import { runQuery } from "@/lib/neo4j";
import { JudgedClaim, GraphData, GraphNode, GraphEdge } from "@/lib/types";

export async function buildGraph(
  documentId: string,
  documentTitle: string,
  claims: JudgedClaim[]
): Promise<void> {
  // Upsert document node
  await runQuery(
    `MERGE (d:Document {id: $id})
     SET d.title = $title, d.updatedAt = datetime()`,
    { id: documentId, title: documentTitle }
  );

  for (const claim of claims) {
    // Upsert claim node
    await runQuery(
      `MERGE (c:Claim {id: $id})
       SET c.text = $text, c.confidence = $confidence, c.status = $status
       WITH c
       MATCH (d:Document {id: $docId})
       MERGE (d)-[:CONTAINS]->(c)`,
      {
        id: claim.id,
        text: claim.text,
        confidence: claim.confidence,
        status: claim.status,
        docId: documentId,
      }
    );

    // Upsert entity nodes and link
    for (const entity of claim.entities) {
      await runQuery(
        `MERGE (e:Entity {name: $name})
         WITH e
         MATCH (c:Claim {id: $claimId})
         MERGE (c)-[:REFERS_TO]->(e)`,
        { name: entity, claimId: claim.id }
      );
    }

    // Link claims that share entities (SUPPORTS relationship heuristic)
    if (claim.entities.length > 0) {
      await runQuery(
        `MATCH (c1:Claim {id: $claimId})-[:REFERS_TO]->(e:Entity)<-[:REFERS_TO]-(c2:Claim)
         WHERE c1 <> c2 AND c2.status = 'ACCEPTED'
         MERGE (c1)-[:SUPPORTS]->(c2)`,
        { claimId: claim.id }
      );
    }
  }
}

export async function getGraphForDocument(documentId: string): Promise<GraphData> {
  const records = await runQuery(
    `MATCH (d:Document {id: $docId})-[:CONTAINS]->(c:Claim)
     OPTIONAL MATCH (c)-[:REFERS_TO]->(e:Entity)
     OPTIONAL MATCH (c)-[r:SUPPORTS|CONTRADICTS]->(c2:Claim)
     RETURN d, c, e, r, c2`,
    { docId: documentId }
  );

  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  for (const record of records) {
    const doc = record.get("d");
    const claim = record.get("c");
    const entity = record.get("e");
    const rel = record.get("r");
    const claim2 = record.get("c2");

    if (doc && !nodesMap.has(doc.properties.id)) {
      nodesMap.set(doc.properties.id, {
        id: doc.properties.id,
        label: doc.properties.title,
        type: "Document",
      });
    }

    if (claim && !nodesMap.has(claim.properties.id)) {
      nodesMap.set(claim.properties.id, {
        id: claim.properties.id,
        label: claim.properties.text.slice(0, 60) + "...",
        type: "Claim",
        confidence: claim.properties.confidence,
        status: claim.properties.status,
      });
    }

    if (entity && !nodesMap.has(`entity-${entity.properties.name}`)) {
      nodesMap.set(`entity-${entity.properties.name}`, {
        id: `entity-${entity.properties.name}`,
        label: entity.properties.name,
        type: "Entity",
      });
      if (claim) {
        edges.push({
          source: claim.properties.id,
          target: `entity-${entity.properties.name}`,
          type: "REFERS_TO",
        });
      }
    }

    if (doc && claim) {
      edges.push({ source: doc.properties.id, target: claim.properties.id, type: "CONTAINS" });
    }

    if (rel && claim && claim2) {
      edges.push({
        source: claim.properties.id,
        target: claim2.properties.id,
        type: rel.type as "SUPPORTS" | "CONTRADICTS",
      });
    }
  }

  return { nodes: Array.from(nodesMap.values()), edges };
}

export async function getFullGraph(): Promise<GraphData> {
  const records = await runQuery(
    `MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 500`
  );

  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  for (const record of records) {
    const n = record.get("n");
    const r = record.get("r");
    const m = record.get("m");

    if (n) {
      const id = n.properties.id ?? n.properties.name;
      if (id && !nodesMap.has(id)) {
        nodesMap.set(id, {
          id,
          label: n.properties.title ?? n.properties.text?.slice(0, 50) ?? n.properties.name ?? id,
          type: n.labels[0] as GraphNode["type"],
          confidence: n.properties.confidence,
          status: n.properties.status,
        });
      }
    }

    if (r && n && m) {
      const srcId = n.properties.id ?? n.properties.name;
      const tgtId = m.properties.id ?? m.properties.name;
      if (srcId && tgtId) {
        edges.push({ source: srcId, target: tgtId, type: r.type as GraphEdge["type"] });
      }
    }
  }

  return { nodes: Array.from(nodesMap.values()), edges };
}

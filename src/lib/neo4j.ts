import neo4j, { Driver, Session } from "neo4j-driver";

const globalForNeo4j = globalThis as unknown as { neo4jDriver: Driver };

function createDriver(): Driver {
  return neo4j.driver(
    process.env.NEO4J_URI ?? "bolt://localhost:7687",
    neo4j.auth.basic(
      process.env.NEO4J_USER ?? "neo4j",
      process.env.NEO4J_PASSWORD ?? "password"
    )
  );
}

export const neo4jDriver: Driver =
  globalForNeo4j.neo4jDriver ?? createDriver();

if (process.env.NODE_ENV !== "production") globalForNeo4j.neo4jDriver = neo4jDriver;

export function getSession(): Session {
  return neo4jDriver.session();
}

export async function runQuery(
  cypher: string,
  params: Record<string, unknown> = {}
) {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

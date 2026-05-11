"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { GraphData, GraphNode, GraphEdge } from "@/lib/types";

interface GraphCanvasProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

const NODE_COLORS: Record<string, string> = {
  Document: "#58a6ff",
  Claim: "#3fb950",
  Entity: "#d29922",
};

const EDGE_COLORS: Record<string, string> = {
  CONTAINS: "#30363d",
  REFERS_TO: "#21262d",
  SUPPORTS: "#3fb950",
  CONTRADICTS: "#f85149",
};

export function GraphCanvas({ data, onNodeClick }: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    const g = svg.append("g");

    svg.call(
      d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 4]).on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
    );

    const nodes = data.nodes.map((n) => ({ ...n })) as (GraphNode & d3.SimulationNodeDatum)[];
    const edges = data.edges.map((e) => ({ ...e })) as (GraphEdge & {
      source: string | GraphNode;
      target: string | GraphNode;
    })[];

    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id((d: d3.SimulationNodeDatum) => (d as GraphNode).id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(20));

    const link = g
      .append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", (d) => EDGE_COLORS[d.type] ?? "#30363d")
      .attr("stroke-width", (d) => (d.type === "CONTRADICTS" ? 2 : 1))
      .attr("stroke-dasharray", (d) => (d.type === "CONTRADICTS" ? "4 2" : "none"))
      .attr("stroke-opacity", 0.7);

    type SimNode = GraphNode & d3.SimulationNodeDatum;

    const dragBehavior = d3.drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes as SimNode[])
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (_, d) => onNodeClick(d as GraphNode))
      // @ts-expect-error D3 drag types don't reconcile BaseType with SVGGElement in .call()
      .call(dragBehavior);

    node
      .append("circle")
      .attr("r", (d) => (d.type === "Document" ? 10 : d.type === "Entity" ? 6 : 8))
      .attr("fill", (d) => NODE_COLORS[d.type] ?? "#8b949e")
      .attr("fill-opacity", 0.85)
      .attr("stroke", (d) => NODE_COLORS[d.type] ?? "#8b949e")
      .attr("stroke-width", 1.5);

    node
      .append("text")
      .text((d) => d.label.slice(0, 20))
      .attr("x", 12)
      .attr("y", 4)
      .attr("fill", "#8b949e")
      .attr("font-size", "10px")
      .attr("font-family", "monospace");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode & d3.SimulationNodeDatum).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode & d3.SimulationNodeDatum).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode & d3.SimulationNodeDatum).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode & d3.SimulationNodeDatum).y ?? 0);

      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full bg-[#0f1117]"
      style={{ minHeight: "500px" }}
    />
  );
}

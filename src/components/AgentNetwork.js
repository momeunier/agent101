"use client";

import { useEffect, useRef } from "react";
import { Network } from "vis-network";

export default function AgentNetwork({ agents }) {
  const networkRef = useRef(null);

  useEffect(() => {
    if (!networkRef.current) return;

    // Create nodes from agents
    const nodes = agents.map((agent) => ({
      id: agent.id,
      label: agent.name,
      title: `${agent.name}\n${agent.goal}`,
      color: {
        background: "#1d4ed8",
        border: "#2563eb",
        highlight: {
          background: "#3b82f6",
          border: "#60a5fa",
        },
      },
      font: {
        size: 16,
        color: "#fff",
      },
      shadow: {
        enabled: true,
        color: "rgba(59, 130, 246, 0.3)",
        size: 10,
        x: 0,
        y: 0,
      },
    }));

    const edges = agents
      .filter((agent) => agent.parentAgent)
      .map((agent) => ({
        from: agent.parentAgent,
        to: agent.id,
        arrows: {
          to: {
            enabled: true,
            type: "arrow",
            scaleFactor: 0.8,
          },
        },
        color: {
          color: "#3b82f6",
          highlight: "#60a5fa",
        },
        smooth: {
          type: "cubicBezier",
          roundness: 0.5,
        },
      }));

    const data = {
      nodes,
      edges,
    };

    const options = {
      nodes: {
        shape: "dot",
        size: 20,
        borderWidth: 2,
        shadow: true,
        color: {
          background: "#1d4ed8",
          border: "#2563eb",
          highlight: {
            background: "#3b82f6",
            border: "#60a5fa",
          },
        },
      },
      edges: {
        width: 2,
        shadow: true,
        arrows: {
          to: {
            enabled: true,
            type: "arrow",
          },
        },
        color: {
          color: "#3b82f6",
          highlight: "#60a5fa",
        },
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 100,
          springConstant: 0.04,
        },
        stabilization: {
          enabled: true,
          iterations: 50,
          fit: true,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 300,
        zoomView: false,
        dragView: true,
        dragNodes: true,
      },
    };

    // Create network
    const network = new Network(networkRef.current, data, options);

    // Clean up
    return () => {
      network.destroy();
    };
  }, [agents]);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-white/10 backdrop-blur-sm">
      <h2 className="text-xl font-semibold p-4">Agent Network</h2>
      <div
        ref={networkRef}
        className="w-full h-[250px] bg-gradient-to-b from-black/30 to-black/10 p-4"
      />
    </div>
  );
}

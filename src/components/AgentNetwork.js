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
        color: "#fff",
      },
    }));

    // Create edges from parent-child relationships
    const edges = agents
      .filter((agent) => agent.parentAgent)
      .map((agent) => ({
        from: agent.parentAgent,
        to: agent.id,
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
        font: {
          color: "#fff",
        },
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
          springLength: 200,
          springConstant: 0.04,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 300,
        zoomView: false,
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
    <div className="bg-gray-900 rounded-xl border border-white/10 p-6 backdrop-blur-sm mb-4">
      <h2 className="text-xl font-semibold mb-4">Agent Network</h2>
      <div
        ref={networkRef}
        className="w-full h-[400px] bg-black/30 rounded-lg"
      />
    </div>
  );
}

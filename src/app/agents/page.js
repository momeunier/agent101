"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AgentNetwork from "@/components/AgentNetwork";
import AutoCompleteTextarea from "@/components/AutoCompleteTextarea";
import toast from "react-hot-toast";

const DEFAULT_PARAMETERS = JSON.stringify(
  {
    items: [{ idea: "value" }, { result: "value" }],
  },
  null,
  2
);

export default function AgentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [status, setStatus] = useState("idle");
  const [editingAgent, setEditingAgent] = useState(null);
  const [form, setForm] = useState({
    name: "",
    backstory: "",
    goal: "",
    parentAgent: "",
    parameters: DEFAULT_PARAMETERS,
  });

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      fetchAgents();
    }
  }, [user]);

  useEffect(() => {
    if (editingAgent) {
      setForm({
        name: editingAgent.name,
        backstory: editingAgent.backstory,
        goal: editingAgent.goal,
        parentAgent: editingAgent.parentAgent || "",
        parameters: editingAgent.parameters || DEFAULT_PARAMETERS,
      });
    }
  }, [editingAgent]);

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Function to generate suggestions based on parent agent
  const getParentSuggestions = useMemo(() => {
    if (!form.parentAgent) return [];

    const parentAgent = agents.find((a) => a.id === form.parentAgent);
    if (!parentAgent?.parameters || !parentAgent?.name) return [];

    try {
      const params = JSON.parse(parentAgent.parameters);
      const suggestions = [];

      // Only look at the items array's idea and result fields
      if (params.items) {
        suggestions.push(`${parentAgent.name}.idea`);
        suggestions.push(`${parentAgent.name}.result`);
      }

      return suggestions;
    } catch (e) {
      console.error("Error parsing parent parameters:", e);
      return [];
    }
  }, [form.parentAgent, agents]);

  if (!user) {
    return null;
  }

  async function fetchAgents() {
    try {
      const response = await fetch("/api/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValidJSON(form.parameters)) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      if (editingAgent) {
        // Update existing agent
        const response = await fetch("/api/agents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: editingAgent.id,
            ...form,
          }),
        });

        if (response.ok) {
          const updatedAgent = await response.json();
          setAgents((prev) =>
            prev.map((agent) =>
              agent.id === updatedAgent.id ? updatedAgent : agent
            )
          );
          setEditingAgent(null);
        }
      } else {
        // Create new agent
        const response = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (response.ok) {
          const newAgent = await response.json();
          setAgents((prev) => [newAgent, ...prev]);
        }
      }

      setForm({
        name: "",
        backstory: "",
        goal: "",
        parentAgent: "",
        parameters: DEFAULT_PARAMETERS,
      });
      setStatus("success");
    } catch (error) {
      console.error("Error saving agent:", error);
      setStatus("error");
    }
  }

  async function handleDelete(agentId) {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;

    try {
      const response = await fetch("/api/agents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      if (response.ok) {
        setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  }

  function cancelEdit() {
    setEditingAgent(null);
    setForm({
      name: "",
      backstory: "",
      goal: "",
      parentAgent: "",
      parameters: DEFAULT_PARAMETERS,
    });
    setStatus("idle");
  }

  async function handleRun(agentId, agentName) {
    const toastId = toast.loading(`Starting agent: ${agentName}...`);

    try {
      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to run agent");
      }

      const { runId } = await response.json();
      toast.success(`Agent ${agentName} started successfully!`, {
        id: toastId,
      });
    } catch (error) {
      console.error("Error running agent:", error);
      toast.error(`Failed to start agent: ${agentName}`, {
        id: toastId,
      });
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-16 sm:pt-24 pb-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
          Manage Agents
        </h1>
      </div>

      <div className="flex gap-8">
        {/* Form Section */}
        <div className="w-1/3">
          <div className="bg-gray-900 rounded-xl border border-white/10 p-6 backdrop-blur-sm sticky top-24">
            <h2 className="text-xl font-semibold mb-6">
              {editingAgent ? "Edit Agent" : "Create New Agent"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Backstory
                </label>
                <AutoCompleteTextarea
                  value={form.backstory}
                  onChange={(e) =>
                    setForm({ ...form, backstory: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                  placeholder="Enter agent backstory"
                  required
                  suggestions={getParentSuggestions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Goal
                </label>
                <AutoCompleteTextarea
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  placeholder="Enter agent goal"
                  required
                  suggestions={getParentSuggestions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Parameters (JSON)
                </label>
                <textarea
                  value={form.parameters}
                  onChange={(e) =>
                    setForm({ ...form, parameters: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 font-mono text-xs"
                  placeholder='Enter JSON parameters e.g. {"temperature": 0.7}'
                  spellCheck="false"
                />
                {!isValidJSON(form.parameters) && (
                  <p className="mt-1 text-sm text-red-400">
                    Invalid JSON format
                  </p>
                )}
              </div>

              {agents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Parent Agent (Optional)
                  </label>
                  <select
                    value={form.parentAgent}
                    onChange={(e) =>
                      setForm({ ...form, parentAgent: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    {agents
                      .filter(
                        (agent) => !editingAgent || agent.id !== editingAgent.id
                      )
                      .map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {status === "loading"
                    ? "Saving..."
                    : editingAgent
                    ? "Update Agent"
                    : "Create Agent"}
                </button>

                {editingAgent && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-white/10 rounded-lg text-white/80 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {status === "error" && (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/20 text-center">
                  Failed to save agent. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Agents List Section */}
        <div className="w-2/3">
          {agents.length > 0 && <AgentNetwork agents={agents} />}

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Agents</h2>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isCollapsed ? "Expand" : "Collapse"} All
            </button>
          </div>

          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-gray-900 rounded-xl border border-white/10 p-6 backdrop-blur-sm"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-white">
                    {agent.name}
                    {agent.parentAgent && (
                      <span className="ml-2 text-sm text-white/60">
                        (Child of:{" "}
                        {agents.find((a) => a.id === agent.parentAgent)?.name})
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingAgent(agent)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleRun(agent.id, agent.name)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      Run
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-1">
                        Backstory
                      </h4>
                      <p className="text-white/60">{agent.backstory}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-1">
                        Goal
                      </h4>
                      <p className="text-white/60">{agent.goal}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-1">
                        Parameters
                      </h4>
                      <pre className="text-white/60 bg-black/30 p-2 rounded-lg overflow-x-auto font-mono text-xs">
                        {agent.parameters
                          ? JSON.stringify(
                              JSON.parse(agent.parameters),
                              null,
                              2
                            )
                          : "{}"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {agents.length === 0 && (
              <div className="text-center text-white/60 py-8">
                No agents created yet. Create your first agent using the form.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

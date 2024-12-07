"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ChainStatus = {
  SCHEDULED: "SCHEDULED",
  TODO: "TODO",
  RUNNING: "RUNNING",
  PARTIAL: "PARTIAL",
  COMPLETED: "COMPLETED",
};

export default function HomePage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [chains, setChains] = useState([]);
  const [newChain, setNewChain] = useState({ name: "" });
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchChains();
    }
  }, [user]);

  const fetchChains = async () => {
    try {
      const response = await fetch("/api/chains");
      if (response.ok) {
        const data = await response.json();
        setChains(data);
      }
    } catch (error) {
      console.error("Error fetching chains:", error);
    }
  };

  const handleCreateChain = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChain.name,
          status: ChainStatus.TODO,
        }),
      });

      if (response.ok) {
        const chain = await response.json();
        setChains([chain, ...chains]);
        setNewChain({ name: "" });
      }
    } catch (error) {
      console.error("Error creating chain:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const success = await login(email);
      if (success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto px-4 pt-16 sm:pt-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
            Welcome to Agent101
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Build and manage your chain of agents with ease
          </p>
        </div>

        <div className="mt-12 bg-gray-900 rounded-xl border border-white/10 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">Login to get started</h2>

          {status === "success" ? (
            <div className="bg-green-500/10 text-green-300 p-4 rounded-lg border border-green-500/20">
              Check your email (or console in development) for the magic link!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/80 mb-1"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/40"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === "loading" ? "Sending..." : "Send Magic Link"}
              </button>

              {status === "error" && (
                <div className="text-red-400 text-sm text-center">
                  Failed to send magic link. Please try again.
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create New Chain</h2>
        <form onSubmit={handleCreateChain} className="space-y-4">
          <div>
            <label
              htmlFor="chainName"
              className="block text-sm font-medium mb-1"
            >
              Chain Name
            </label>
            <input
              type="text"
              id="chainName"
              value={newChain.name}
              onChange={(e) => setNewChain({ name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Chain
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Chains</h2>
        <div className="grid gap-4">
          {chains.map((chain) => (
            <Link
              key={chain.id}
              href={`/chains/${chain.id}`}
              className="block p-4 bg-gray-900 border border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{chain.name}</h3>
                <span className="px-2 py-1 text-sm rounded-full bg-gray-800">
                  {chain.status}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Created {new Date(chain.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

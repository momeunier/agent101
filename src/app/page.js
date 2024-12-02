"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

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

      {user ? (
        <div className="mt-12 bg-gray-900 rounded-xl border border-white/10 p-6 backdrop-blur-sm">
          <p className="text-lg">
            Welcome back,{" "}
            <span className="text-blue-400 font-medium">
              {user.name || user.email}
            </span>
            !
          </p>
          <div className="mt-4 bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <p className="text-blue-300">
              Your workspace is ready. Agent chain building functionality coming
              soon...
            </p>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}

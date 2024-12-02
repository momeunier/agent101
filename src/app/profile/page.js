"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    location: "",
  });
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        location: user.location || "",
      });
    }
  }, [user]);

  if (!user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await updateProfile(form);
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-16 sm:pt-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
          Edit Profile
        </h1>
      </div>

      <div className="bg-gray-900 rounded-xl border border-white/10 p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white/60"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your location"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "loading" ? "Saving..." : "Save Profile"}
          </button>

          {status === "success" && (
            <div className="bg-green-500/10 text-green-300 p-4 rounded-lg border border-green-500/20 text-center">
              Profile updated successfully!
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/20 text-center">
              Failed to update profile. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

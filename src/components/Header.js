"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

function UserAvatar({ email }) {
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium ring-2 ring-blue-600">
      {initials}
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-b border-white/10 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-semibold text-white hover:text-blue-400 transition-colors"
            >
              Agent101
            </Link>
            {user && (
              <Link
                href="/agents"
                className="text-white/80 hover:text-white transition-colors"
              >
                Manage Agents
              </Link>
            )}
          </div>

          {user && (
            <div className="flex items-center">
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-3 group p-2 rounded-md hover:bg-white/5"
                >
                  <UserAvatar email={user.email} />
                  <span className="text-sm text-white/80 group-hover:text-white">
                    {user.email}
                  </span>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl py-1 z-50 border border-white/10">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white">Profile</p>
                      <p className="text-sm text-white/60 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="px-4 py-2">
                      <div className="text-sm text-white/80">
                        <div className="flex justify-between py-1">
                          <span>Name</span>
                          <span className="font-medium text-white">
                            {user.name || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Location</span>
                          <span className="font-medium text-white">
                            {user.location || "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-white/10">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

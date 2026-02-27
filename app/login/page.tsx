"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TopNav, BottomNav } from "@/components/Navigation";
import { useAuth } from "@/components/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(username, password);
    setIsLoading(false);

    if (success) {
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen">
      <TopNav />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="glass-panel p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-400/90 rounded-3xl mb-4 shadow-[0_0_40px_rgba(52,211,153,0.9)]">
              <svg
                className="w-8 h-8 text-slate-950"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-50 mb-2">Welcome Back</h1>
            <p className="text-slate-300">Sign in to your Livestoq account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/15 border border-red-400/60 text-red-100 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 glass-input"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 glass-input"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-300">
              Don't have an account?{" "}
              <Link href="/signup" className="text-emerald-300 hover:text-emerald-200 font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-slate-900/60 border border-white/10 rounded-2xl">
            <p className="text-xs text-slate-300 text-center">
              Demo credentials: Username: <strong>Testing</strong>, Password: <strong>Testing</strong>
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
      <div className="h-20 md:hidden" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <TopNav />
          <div className="max-w-md mx-auto px-4 py-12 text-center">
            <p className="text-slate-300">Loading...</p>
          </div>
          <BottomNav />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition ${
      pathname === path
        ? "bg-slate-900/80 text-emerald-200 shadow-[0_10px_35px_rgba(16,185,129,0.55)] border border-emerald-300/50"
        : "text-slate-100/80 hover:text-emerald-200 hover:bg-slate-900/40 border border-transparent hover:border-emerald-300/40"
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-emerald-400/90 shadow-[0_0_35px_rgba(52,211,153,0.9)]">
              <Image
                src="/logo.png"
                alt="Livestoq"
                width={24}
                height={24}
                className="h-6 w-6"
                priority
              />
            </div>
            <span className="hidden sm:inline text-sm font-semibold text-slate-100 tracking-[0.18em] uppercase">
              Livestoq
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link href="/scan" className={linkClass("/scan")}>
              Scan
            </Link>
            <Link href="/marketplace" className={linkClass("/marketplace")}>
              Marketplace
            </Link>
            <Link href="/ask" className={linkClass("/ask")}>
              Ask
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
                <span className="text-sm text-slate-100/90 hidden sm:inline font-semibold">
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-full text-sm font-semibold text-slate-100 bg-slate-900/40 border border-white/10 hover:bg-slate-900/70"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-3 border-l border-white/10">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-slate-100 hover:bg-slate-900/70 border border-white/10"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 shadow-[0_12px_40px_rgba(59,130,246,0.6)] hover:from-emerald-200 hover:via-sky-200 hover:to-indigo-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden">
      <div className={`grid ${isAuthenticated ? "grid-cols-4" : "grid-cols-3"} h-20`}>
        <Link
          href="/"
          className={`flex flex-col items-center justify-center transition-all ${
            isActive("/")
              ? "text-primary-600 bg-primary-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-xs font-semibold">Home</span>
        </Link>
        <Link
          href="/scan"
          className={`flex flex-col items-center justify-center transition-all ${
            isActive("/scan")
              ? "text-primary-600 bg-primary-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-xs font-semibold">Scan</span>
        </Link>
        <Link
          href="/marketplace"
          className={`flex flex-col items-center justify-center transition-all ${
            isActive("/marketplace")
              ? "text-primary-600 bg-primary-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span className="text-xs font-semibold">Marketplace</span>
        </Link>
        {isAuthenticated && (
          <Link
            href="/ask"
            className={`flex flex-col items-center justify-center transition-all ${
              isActive("/ask")
                ? "text-primary-600 bg-primary-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="text-xs font-semibold">Ask</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

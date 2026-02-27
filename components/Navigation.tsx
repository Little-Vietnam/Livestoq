"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

import { useState, useRef, useEffect } from "react";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Simple utility for navigation link style
  const linkClass = (path: string) =>
    `px-4 py-2 rounded-full text-sm font-semibold transition ${
      pathname === path
        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
        : "text-gray-700 hover:bg-white/70 border border-transparent hover:border-primary-100"
    }`;

  // Handle clicking outside for mobile dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Livestoq"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          {/* Desktop right nav */}
          <div className="hidden sm:flex items-center space-x-3">
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
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <span className="text-sm text-gray-700 hidden sm:inline font-semibold">
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-white/70 border border-gray-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-white/70 border border-gray-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          {/* Mobile: Only dropdown top-right for login/signup (if not authenticated) */}
          {!isAuthenticated && (
            <div className="sm:hidden relative">
              <button
                aria-label="Open account menu"
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
                onClick={() => setDropdownOpen((open) => !open)}
                type="button"
              >
                {/* Menu/Account icon */}
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <circle cx="12" cy="8.5" r="3.25" stroke="currentColor"/>
                  <path d="M4.8 18c.5-3.25 3.7-4.75 7.2-4.75s6.7 1.5 7.2 4.75" stroke="currentColor"/>
                </svg>
              </button>
              {/* Dropdown */}
              {dropdownOpen && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  <Link
                    href="/login"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 rounded-md"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 mt-1 text-sm text-primary-700 hover:bg-primary-50 rounded-md font-semibold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
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

  // Determine number of columns for nav grid
  // +1 for Stoqy button, +1 for Ask if authenticated
  const colCount = isAuthenticated ? 5 : 4;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur bg-white/85 border-t border-white/60 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.2)] md:hidden">
      <div className={`grid grid-cols-${colCount} h-20`}>
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
        {/* Stoqy Button */}
        <Link
          href="/ask"
          className={`flex flex-col items-center justify-center transition-all ${
            isActive("/stoqy")
              ? "text-primary-600 bg-primary-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {/* Stoqy icon: robot */}
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {/* Head */}
            <rect
              x="5"
              y="7"
              width="14"
              height="9"
              rx="3"
              stroke="currentColor"
              strokeWidth={2}
              fill="none"
            />
            {/* Eyes */}
            <circle
              cx="9"
              cy="11"
              r="1"
              fill="currentColor"
            />
            <circle
              cx="15"
              cy="11"
              r="1"
              fill="currentColor"
            />
            {/* Antenna */}
            <line
              x1="12"
              y1="4"
              x2="12"
              y2="7"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <circle
              cx="12"
              cy="3"
              r="1"
              fill="currentColor"
            />
            {/* Smile */}
            <path
              d="M10 14c1 1 3 1 4 0"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="text-xs font-semibold">Stoqy</span>
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

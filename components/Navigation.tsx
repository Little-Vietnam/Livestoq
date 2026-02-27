"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

import { useState, useRef, useEffect } from "react";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, credits, logout } = useAuth();
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
            {isAuthenticated && (
              <div className="flex items-center space-x-2 pl-3 border-l border-gray-200 mr-2">
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-primary-50 border border-primary-100">
                  <span className="text-xs font-medium text-primary-700">
                    Credits: <span className="font-semibold">{credits}</span>
                  </span>
                  <Link
                    href="/credits"
                    className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-sm hover:bg-primary-700"
                    aria-label="Buy credits"
                  >
                    +
                  </Link>
                </div>
              </div>
            )}
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
          {/* Mobile: Dropdown top-right for account, credits, and auth actions */}
          <div className="sm:hidden relative">
            <button
              aria-label="Open account menu"
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
              onClick={() => setDropdownOpen((open) => !open)}
              type="button"
            >
              {/* Improved Profile/Account icon */}
              <svg
                className="w-8 h-8 text-primary-600"
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="16" cy="12" r="6" stroke="currentColor" fill="#fff" />
                <path
                  d="M6 26c0-4.418 4.477-8 10-8s10 3.582 10 8"
                  stroke="currentColor"
                  strokeLinecap="round"
                  fill="#fff"
                />
              </svg>
            </button>
            {/* Dropdown */}
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50"
              >
                {!isAuthenticated ? (
                  <>
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
                  </>
                ) : (
                  <>
                    {user?.username && (
                      <div className="block px-4 py-2 text-sm text-gray-700 font-semibold truncate">
                        {user.username}
                      </div>
                    )}
                    <div className="px-4 py-2 border-y border-gray-100 mb-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">
                          Credits
                        </span>
                        <span className="text-sm font-semibold text-primary-700">
                          {credits}
                        </span>
                      </div>
                      <Link
                        href="/credits"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full text-center px-3 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                      >
                        Purchase Credits
                      </Link>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-primary-50 rounded-md font-semibold"
                    >
                      Logout
                    </button>
                  </>
                )}
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

  // Keep nav items in a row, always, never in a column (horizontal scrolling if overflow)
  // Map of nav items for easy rendering
  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: (
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
      ),
      activeTest: () => isActive("/"),
    },
    {
      href: "/scan",
      label: "Scan",
      icon: (
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
      ),
      activeTest: () => isActive("/scan"),
    },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: (
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
      ),
      activeTest: () => isActive("/marketplace"),
    },
    {
      href: "/ask",
      label: "Stoqy",
      icon: (
        <svg
          className="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
          <path
            d="M10 14c1 1 3 1 4 0"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ),
      activeTest: () => isActive("/ask"),
    },
  ];

  

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur bg-white/85 border-t border-white/60 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.2)] md:hidden">
      <div
        className="flex flex-row flex-nowrap overflow-x-auto h-20"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {navLinks.map(({ href, label, icon, activeTest }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center transition-all ${
              activeTest()
                ? "text-primary-600 bg-primary-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            style={{ minWidth: `${100 / navLinks.length}%` }}
          >
            {icon}
            <span className="text-xs font-semibold truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

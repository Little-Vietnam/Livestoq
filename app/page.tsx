"use client";

import Link from "next/link";
import Image from "next/image";
import { TopNav, BottomNav } from "@/components/Navigation";
import { useAuth } from "@/components/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <TopNav />

      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left glass-panel p-8 sm:p-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 leading-tight tracking-tight">
                Redefining the way livestock is bought, sold, and trusted
              </h1>
              <p className="text-lg sm:text-xl text-slate-200/80 mb-8 max-w-2xl mx-auto lg:mx-0">
                AI Computer Vision for a safer livestock trading experience through{" "}
                <span className="text-emerald-300 font-semibold">
                  animal-level verification
                </span>
                . Verify the animal, not the claim.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/scan"
                  className="btn-primary px-8 py-4 text-lg"
                >
                  Scan Livestock
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-white/15 bg-slate-900/40 text-slate-50 font-semibold hover:bg-slate-900/80 hover:text-emerald-200 transition-all transform hover:scale-105 shadow-[0_14px_40px_rgba(15,23,42,0.75)] text-lg"
                >
                  Browse Marketplace
                </Link>
              </div>
              {!isAuthenticated && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-white/15 bg-slate-900/70 text-slate-50 font-semibold hover:bg-slate-900/90 transition-all text-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-slate-950 bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 hover:from-emerald-200 hover:via-sky-200 hover:to-indigo-200 shadow-[0_12px_35px_rgba(59,130,246,0.65)] transition-all text-base"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.95)] aspect-[4/3] border border-white/10">
                <Image
                  src="https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg"
                  alt="Brown Guernsey cow"
                  fill
                  className="object-cover scale-[1.02]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 glass-panel rounded-2xl p-4 border border-emerald-300/40 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-slate-50">
                    AI Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Simple, secure, and transparent. Get AI-powered verification in three easy steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 glass-panel hover:shadow-[0_22px_70px_rgba(15,23,42,0.95)] transition-shadow">
              <div className="w-20 h-20 bg-emerald-400/90 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_45px_rgba(52,211,153,0.9)]">
                <span className="text-3xl font-bold text-slate-950">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-3">
                Capture Your Livestock
              </h3>
              <p className="text-slate-200/90 leading-relaxed">
                Take a side photo (required) plus optional head, back, and teeth images for deeper analysis
              </p>
            </div>
            <div className="text-center p-6 glass-panel hover:shadow-[0_22px_70px_rgba(15,23,42,0.95)] transition-shadow">
              <div className="w-20 h-20 bg-sky-400/90 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_45px_rgba(56,189,248,0.9)]">
                <span className="text-3xl font-bold text-slate-950">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-3">
                AI Analysis
              </h3>
              <p className="text-slate-200/90 leading-relaxed">
                Our AI assesses species, age, weight, health, and fair price range with confidence scores
              </p>
            </div>
            <div className="text-center p-6 glass-panel hover:shadow-[0_22px_70px_rgba(15,23,42,0.95)] transition-shadow">
              <div className="w-20 h-20 bg-indigo-400/90 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_45px_rgba(129,140,248,0.9)]">
                <span className="text-3xl font-bold text-slate-950">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-3">
                Verified Listing
              </h3>
              <p className="text-slate-200/90 leading-relaxed">
                List with confidence or browse verified animals in our trusted marketplace
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stoqy Section */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="glass-panel p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-emerald-400/90 rounded-3xl flex items-center justify-center shadow-[0_0_45px_rgba(52,211,153,0.9)]">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-50">Stoqy</h2>
                    <p className="text-sm text-slate-300">Livestoq Personal AI Assistant</p>
                  </div>
                </div>
                <p className="text-lg text-slate-100 mb-6 leading-relaxed">
                  Your 24/7 digital livestock consultant. Get real-time guidance on health, care, 
                  feeding, nutrition, medicine, and marketplace questions.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-100">Livestock health and care advice</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-100">Feeding and nutrition recommendations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-100">Medicine and vitamin suggestions</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-100">Marketplace assistance</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-100">General livestock management Q&A</span>
                  </li>
                </ul>
                <Link
                  href="/ask"
                  className="btn-primary inline-flex items-center justify-center px-6 py-3 mt-2"
                >
                  Try Stoqy Now
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="glass-panel p-8">
                <div className="space-y-4">
                  <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/10 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-100">What vitamins should I give my cow?</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-400/15 rounded-2xl p-4 border border-emerald-300/40 shadow-sm ml-8">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-100">
                          For healthy cows, I recommend vitamin A, D, and E supplements. Vitamin A supports vision and immune function...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-8 sm:p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-400/90 rounded-3xl mb-6 shadow-[0_0_45px_rgba(52,211,153,0.9)]">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-6">
                Verify the animal, not the claim
              </h2>
              <p className="text-lg text-slate-200/90 mb-6 max-w-2xl mx-auto leading-relaxed">
                Every verified listing includes AI-generated assessments with confidence scores. 
                Make informed decisions with transparent, data-driven insights.
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-400/15 border border-amber-300/40 rounded-xl">
                <svg
                  className="w-5 h-5 text-amber-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-amber-100 font-medium">
                  Verify before you buy. Fraud happens fastest when decisions are rushed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-slate-100 font-semibold mb-4">Livestoq</h3>
              <p className="text-sm text-slate-400">
                Redefining the way livestock is trusted.
              </p>
            </div>
            <div>
              <h3 className="text-slate-100 font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-slate-100">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-100">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-100 font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-slate-100">Support</a></li>
                <li><a href="#" className="hover:text-slate-100">About Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 Livestoq. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
      <div className="h-20 md:hidden" /> {/* Spacer for bottom nav */}
    </div>
  );
}

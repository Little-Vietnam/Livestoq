"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { TopNav, BottomNav } from "@/components/Navigation";
import { useAuth } from "@/components/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  // ── Typing animation ────────────────────────────────────────────
  const heroText = "Redefining the way livestock is bought, sold, and trusted";
  const [charIndex, setCharIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (charIndex < heroText.length) {
      const timeout = setTimeout(() => setCharIndex((i) => i + 1), 40);
      return () => clearTimeout(timeout);
    } else {
      setTypingDone(true);
    }
  }, [charIndex, heroText.length]);

  const displayedText = heroText.slice(0, charIndex);

  // ── "How it works" typing animation ──────────────────────────────
  const howText = "How it works";
  const [howCharIndex, setHowCharIndex] = useState(0);
  const [howTypingDone, setHowTypingDone] = useState(false);
  const [howVisible, setHowVisible] = useState(false);
  const howRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = howRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHowVisible(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!howVisible) return;
    if (howCharIndex < howText.length) {
      const t = setTimeout(() => setHowCharIndex((i) => i + 1), 60);
      return () => clearTimeout(t);
    } else {
      setHowTypingDone(true);
    }
  }, [howVisible, howCharIndex, howText.length]);

  const howDisplayed = howVisible ? howText.slice(0, howCharIndex) : "";

  // ── Stoqy chat typing animation ─────────────────────────────────
  const stoqyQuestion = "What vitamins should I give my cow?";
  const stoqyAnswer = "For healthy cows, I recommend vitamin A, D, and E supplements. Vitamin A supports vision and immune function...";
  const [stoqyVisible, setStoqyVisible] = useState(false);
  const [qCharIndex, setQCharIndex] = useState(0);
  const [aCharIndex, setACharIndex] = useState(0);
  const [qDone, setQDone] = useState(false);
  const [aDone, setADone] = useState(false);
  const stoqyChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stoqyChatRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStoqyVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!stoqyVisible) return;
    if (qCharIndex < stoqyQuestion.length) {
      const t = setTimeout(() => setQCharIndex((i) => i + 1), 35);
      return () => clearTimeout(t);
    } else {
      setQDone(true);
    }
  }, [stoqyVisible, qCharIndex, stoqyQuestion.length]);

  useEffect(() => {
    if (!qDone) return;
    if (aCharIndex < stoqyAnswer.length) {
      const t = setTimeout(() => setACharIndex((i) => i + 1), 20);
      return () => clearTimeout(t);
    } else {
      setADone(true);
    }
  }, [qDone, aCharIndex, stoqyAnswer.length]);

  const heroImage = {
    src: "/file.jpg",
    alt: "Cow in a field",
  };

  // ── Slide-up animation (IntersectionObserver for all sections) ────
  const slideUpRefs = useRef<(HTMLElement | null)[]>([]);
  const addSlideRef = useCallback((el: HTMLElement | null) => {
    if (el && !slideUpRefs.current.includes(el)) {
      slideUpRefs.current.push(el);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    slideUpRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      
      {/* Hero Section */}
      <section ref={addSlideRef} className="animate-slide-up px-4 py-12 sm:py-16 lg:py-20 hero-gradient">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs sm:text-sm font-medium text-primary-700 mb-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.166 12.334A8.001 8.001 0 0116.68 6.34l1.142-1.141A.5.5 0 0118.5 5.5v5.993a.5.5 0 01-.5.5H12a.5.5 0 01-.353-.854l1.57-1.57A4.5 4.5 0 104.5 12.5a.75.75 0 01-1.5 0 6 6 0 1110.652-3.3l1.038-1.038A7 7 0 003.41 11.59a.75.75 0 01-1.244.744z" />
                  </svg>
                </span>
                <span>AI Computer Vision for Livestock</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight min-h-[3.5em] sm:min-h-[2.5em]" style={{ fontFamily: "serif" }}>
                {displayedText}
                {!typingDone && (
                  <span className="inline-block w-[3px] h-[1em] bg-gray-900 ml-1 align-baseline animate-pulse" />
                )}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Livestoq uses AI computer vision to generate objective assessments on age, weight, and health — so buyers and sellers can verify the animal, not guess from claims.
              </p>
              {isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/scan"
                    className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg text-lg"
                  >
                    Scan Livestock
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-all transform hover:scale-105 shadow-md text-lg"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              )}
              {!isAuthenticated && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all text-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-all text-base"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-2xl border-4 border-primary-100 group cursor-pointer">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Livestoq Delivers */}
      <section ref={addSlideRef} className="animate-slide-up px-4 py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="group text-center p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Verified Animals</h3>
              <p className="text-xs text-gray-500">AI verification, not seller claims</p>
            </div>

            {/* Card 2 */}
            <div className="group text-center p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Objective Insights</h3>
              <p className="text-xs text-gray-500">Age, weight, health & price</p>
            </div>

            {/* Card 3 */}
            <div className="group text-center p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Smart Marketplace</h3>
              <p className="text-xs text-gray-500">AI insights on every listing</p>
            </div>

            {/* Card 4 */}
            <div className="group text-center p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Fair Pricing</h3>
              <p className="text-xs text-gray-500">Transparent for both sides</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Pipeline Flow */}
      <section ref={(el) => { howRef.current = el; addSlideRef(el); }} className="animate-slide-up px-4 py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 min-h-[1.5em]" style={{ fontFamily: "serif" }}>
              {howDisplayed}
              {howVisible && !howTypingDone && (
                <span className="inline-block w-[3px] h-[0.9em] bg-gray-900 ml-1 align-baseline animate-pulse" />
              )}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our ML pipeline processes a single photo through multiple stages to deliver accurate livestock insights.
            </p>
          </div>

          {/* Pipeline Steps */}
          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              {/* Step 1 — Segmentation */}
              <div className="text-center group">
                <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-primary-100 group-hover:border-primary-400 transition-all mb-4 aspect-square bg-gray-100">
                  <Image
                    src="/pipeline_01_segmentation.jpg"
                    alt="Segmentation — isolating the animal from the background"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold shadow">1</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Segmentation</h3>
                <p className="text-xs text-gray-500 mt-1">Isolate the animal from its background</p>
              </div>

              {/* Step 2 — Keypoint Detection */}
              <div className="text-center group">
                <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-primary-100 group-hover:border-primary-400 transition-all mb-4 aspect-square bg-gray-100">
                  <Image
                    src="/pipeline_02_keypoints.jpg"
                    alt="Keypoint detection — 17 anatomical landmarks"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold shadow">2</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Keypoint Detection</h3>
                <p className="text-xs text-gray-500 mt-1">Locate 17 anatomical landmarks</p>
              </div>

              {/* Step 3 — Pose Normalization */}
              <div className="text-center group">
                <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-primary-100 group-hover:border-primary-400 transition-all mb-4 aspect-square bg-gray-100">
                  <Image
                    src="/pipeline_03_normalized_pose.jpg"
                    alt="Normalized pose — standardized body dimensions"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold shadow">3</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Pose Normalization</h3>
                <p className="text-xs text-gray-500 mt-1">Standardize body dimensions</p>
              </div>

              {/* Step 4 — Final Result */}
              <div className="text-center group">
                <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-primary-100 group-hover:border-primary-400 transition-all mb-4 aspect-square bg-gray-100">
                  <Image
                    src="/result.jpg"
                    alt="Final result — weight prediction and health assessment"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold shadow">4</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Weight & Health</h3>
                <p className="text-xs text-gray-500 mt-1">Predict weight and detect conditions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stoqy Section */}
      <section ref={addSlideRef} className="animate-slide-up px-4 py-6 sm:py-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="order-2 lg:order-1 lg:col-span-7 relative lg:-mr-16">
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border border-primary-100 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="4"
                        y="6"
                        width="16"
                        height="11"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <circle
                        cx="10"
                        cy="11"
                        r="1.3"
                        fill="currentColor"
                      />
                      <circle
                        cx="14"
                        cy="11"
                        r="1.3"
                        fill="currentColor"
                      />
                      <path
                        d="M9 15H15"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9 4L9 6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M15 4L15 6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Stoqy</h2>
                    <p className="text-sm text-gray-600">Livestoq Personal AI Assistant</p>
                  </div>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Your 24/7 digital livestock consultant. Get real-time guidance on health, care, 
                  feeding, nutrition, medicine, and marketplace questions.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Livestock health and care advice</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Feeding and nutrition recommendations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Medicine and vitamin suggestions</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Marketplace assistance</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">General livestock management Q&A</span>
                  </li>
                </ul>
                <Link
                  href="/ask"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Try Stoqy Now
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5 lg:pl-8 relative z-10" ref={stoqyChatRef}>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="space-y-4">
                  {/* User question — typing animation */}
                  <div className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm transition-opacity duration-300 ${stoqyVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-primary-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M6.5 18C7.3 15.8 9.46 14.25 12 14.25C14.54 14.25 16.7 15.8 17.5 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex-1 min-h-[1.5em]">
                        <p className="text-sm text-gray-700">
                          {stoqyVisible ? stoqyQuestion.slice(0, qCharIndex) : ""}
                          {stoqyVisible && !qDone && (
                            <span className="inline-block w-[2px] h-[0.9em] bg-gray-900 ml-0.5 align-baseline animate-pulse" />
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Stoqy answer — typing animation (starts after question finishes) */}
                  <div className={`bg-primary-50 rounded-lg p-4 border border-primary-200 shadow-sm ml-8 transition-opacity duration-500 ${qDone ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="5" y="7" width="14" height="9" rx="3" stroke="currentColor" strokeWidth="1.6" />
                          <circle cx="10" cy="11" r="1.1" fill="currentColor" />
                          <circle cx="14" cy="11" r="1.1" fill="currentColor" />
                          <path d="M10 5L10 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          <path d="M14 5L14 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex-1 min-h-[3em]">
                        <p className="text-sm text-gray-700">
                          {qDone ? stoqyAnswer.slice(0, aCharIndex) : ""}
                          {qDone && !aDone && (
                            <span className="inline-block w-[2px] h-[0.9em] bg-primary-600 ml-0.5 align-baseline animate-pulse" />
                          )}
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

      {/* Footer */}
      <footer ref={addSlideRef} className="animate-slide-up px-4 py-8 bg-white text-gray-500 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Livestoq</h3>
              <p className="text-sm">
                Redefining the way livestock is trusted.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-gray-900">Support</a></li>
                <li><a href="#" className="hover:text-gray-900">About Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-sm">
            <p>&copy; 2026 Livestoq. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
      <div className="h-20 md:hidden" /> {/* Spacer for bottom nav */}
    </div>
  );
}

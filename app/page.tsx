"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
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

  const heroImages = [
    {
      src: "https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg",
      alt: "Cattle in a traditional Indonesian market",
    },
    {
      src: "https://media.4-paws.org/4/9/8/9/49896113ec1edb7553e53df93fec214bfba35e4d/VIER%20PFOTEN_2015-04-27_010-3369x2246-3246x2246-1920x1329.jpg",
      alt: "Farmer inspecting a cow in the field",
    },
    {
      src: "https://images.twinkl.co.uk/tw1n/image/private/t_630_eco/website/uploaded/cow-6360406-1280-1729765657.jpg",
      alt: "Healthy cattle herd walking in pasture",
    },
    {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJKLSAWro4ItSJjwqj02T3OQgwLwQ_Fbc3aw&s",
      alt: "Close-up of a cow with ear tag",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Holstein_Cow_in_Mont%C3%A9r%C3%A9gie%2C_Quebec.jpg/1280px-Holstein_Cow_in_Mont%C3%A9r%C3%A9gie%2C_Quebec.jpg",
      alt: "Livestock trader observing animals at market",
    },
    {
      src: "https://cdn.sanity.io/images/5dqbssss/production-v3/a25daafbd63d028bacd81f322618de5ea1b9bc98-6720x4480.jpg?w=3840&q=75&fit=clip&auto=format",
      alt: "Cows in a pen ready for sale",
    },
  ];

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleNextImage = () => {
    setCurrentHeroIndex((prev) =>
      prev === heroImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentHeroIndex((prev) =>
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      
      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-primary-50 to-white">
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
                  <span className="inline-block w-[3px] h-[1em] bg-primary-600 ml-1 align-baseline animate-pulse" />
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
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-gray-100">
                {heroImages.map((image, index) => (
                  <div
                    key={image.src}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === currentHeroIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs sm:text-sm text-white/80 bg-black/40 inline-block px-3 py-1 rounded-full backdrop-blur">
                        Livestock image {index + 1} of {heroImages.length}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-4">
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur transition"
                    aria-label="Previous image"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.5 5L8 9.5L12.5 14"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1.5">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentHeroIndex(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === currentHeroIndex
                            ? "w-5 bg-white"
                            : "w-2 bg-white/50"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur transition"
                    aria-label="Next image"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.5 5L12 9.5L7.5 14"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-xl p-4 border-2 border-primary-200 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    AI-verified insights on every listing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Livestoq Delivers */}
      <section className="px-4 py-16 sm:py-20 bg-white border-t border-gray-100">
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

      {/* How It Works */}
      <section className="px-4 py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and transparent. Get AI-powered verification in three easy steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Capture Your Livestock
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Take a side photo (required) plus an optional teeth image for age prediction
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI assesses species, age, weight, health, and fair price range with confidence scores
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Verified Listing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                List with confidence or browse verified animals in our trusted marketplace
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stoqy Section */}
      <section className="px-4 py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border border-primary-100">
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
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-primary-700"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="12"
                            cy="9"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M6.5 18C7.3 15.8 9.46 14.25 12 14.25C14.54 14.25 16.7 15.8 17.5 18"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">What vitamins should I give my cow?</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-4 border border-primary-200 shadow-sm ml-8">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="5"
                            y="7"
                            width="14"
                            height="9"
                            rx="3"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                          <circle
                            cx="10"
                            cy="11"
                            r="1.1"
                            fill="currentColor"
                          />
                          <circle
                            cx="14"
                            cy="11"
                            r="1.1"
                            fill="currentColor"
                          />
                          <path
                            d="M10 5L10 7"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                          <path
                            d="M14 5L14 7"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
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

      {/* ML Result Showcase */}
      <section className="px-4 py-12 sm:py-16 bg-gradient-to-b from-white to-primary-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See what our AI delivers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a single side-view photo, Livestoq extracts body dimensions, estimates weight, and detects health conditions.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary-100 bg-white">
            <Image
              src="/result.jpg"
              alt="ML pipeline result showing segmentation, keypoints, dimensions, and weight prediction"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority={false}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <div className="flex flex-wrap gap-3">
                <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur font-medium">Segmentation</span>
                <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur font-medium">17 Keypoints</span>
                <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur font-medium">8 Body Dimensions</span>
                <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur font-medium">Weight Prediction</span>
                <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur font-medium">Skin Disease Detection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-gray-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Livestoq</h3>
              <p className="text-sm">
                Redefining the way livestock is trusted.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Livestoq. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
      <div className="h-20 md:hidden" /> {/* Spacer for bottom nav */}
    </div>
  );
}

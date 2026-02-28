"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav, BottomNav } from "@/components/Navigation";
import { useAuth } from "@/components/AuthContext";
import { Angle } from "@/lib/types";
import {
  generateMockAssessment,
} from "@/lib/mockAssessment";
import {
  analyzeWithML,
  dataURLtoFile,
  buildAssessmentFromML,
} from "@/lib/mlAnalysis";
import { store } from "@/lib/store";

// ─── Capture slots ──────────────────────────────────────────────────────
// Side is REQUIRED → dimension estimation + skin disease detection
// Teeth is OPTIONAL → age prediction (only runs if teeth captured)

const BREEDS = [
  "generic", "holstein", "angus", "hereford", "brahman", "jersey",
  "simmental", "limousin", "charolais", "bali", "ongole", "madura",
  "peranakan_ongole",
];

type CaptureSlot = {
  key: Angle;
  label: string;
  icon: string;
  required: boolean;
  description: string;
  /** What ML pipelines this image feeds into */
  pipelines: string[];
};

const CAPTURE_SLOTS: CaptureSlot[] = [
  {
    key: "side",
    label: "Side View",
    icon: "🐄",
    required: true,
    description: "Lateral view — used for body dimension estimation and skin disease detection",
    pipelines: ["Dimension & Weight", "Skin Disease"],
  },
  {
    key: "teeth",
    label: "Teeth / Mouth",
    icon: "🦷",
    required: false,
    description: "Close-up of incisors — enables age prediction from dental analysis",
    pipelines: ["Age Prediction"],
  },
];

export default function ScanPage() {
  const router = useRouter();
  const { isAuthenticated, credits, consumeCredit } = useAuth();
  const [images, setImages] = useState<Partial<Record<Angle, string>>>({});
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [breed, setBreed] = useState<string>("generic");
  const [useMLPipeline, setUseMLPipeline] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);

  const currentSlot = CAPTURE_SLOTS[activeSlot];
  const hasSideImage = !!images.side;
  const hasTeethImage = !!images.teeth;
  const capturedCount = Object.keys(images).length;

  // ── Auth guard ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/scan");
    }
  }, [isAuthenticated, router]);

  // ── Helpers ─────────────────────────────────────────────────────────

  const setImageData = (angle: Angle, base64String: string) => {
    setImages((prev) => ({ ...prev, [angle]: base64String }));
    // Auto-advance to next empty slot
    const nextEmptyIdx = CAPTURE_SLOTS.findIndex(
      (s, i) => i > activeSlot && !images[s.key] && s.key !== angle
    );
    if (nextEmptyIdx >= 0) {
      setTimeout(() => setActiveSlot(nextEmptyIdx), 300);
    }
  };

  const handleFileInput = (angle: Angle, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageData(angle, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (angle: Angle) => {
    setImages((prev) => {
      const next = { ...prev };
      delete next[angle];
      return next;
    });
  };

  // ── Camera ──────────────────────────────────────────────────────────

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStream(stream);
      setCameraError("");
    } catch {
      setCameraError("Camera unavailable. Please allow access or upload instead.");
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || !cameraStream) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setImageData(currentSlot.key, canvas.toDataURL("image/jpeg", 0.92));
  };

  useEffect(() => () => stopCamera(), []);

  // ── Analyse ─────────────────────────────────────────────────────────

  const performAnalysis = async () => {
    if (!hasSideImage) {
      alert("A side view image is required to run the analysis.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus("");

    try {
      if (useMLPipeline) {
        setAnalysisStatus("Preparing images…");
        const sideFile = dataURLtoFile(images.side!, "side.jpg");
        const teethFile = hasTeethImage
          ? dataURLtoFile(images.teeth!, "teeth.jpg")
          : null;

        setAnalysisStatus(
          hasTeethImage
            ? "Running dimension, skin disease & age pipelines…"
            : "Running dimension & skin disease pipelines…"
        );

        const mlResult = await analyzeWithML(sideFile, teethFile, breed);

        setAnalysisStatus("Building assessment…");
        const assessment = buildAssessmentFromML(mlResult, images);
        store.addScanAssessment(assessment);
        router.push(`/scan/results?id=${assessment.id}`);
      } else {
        setAnalysisStatus("Running demo analysis…");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const assessment = generateMockAssessment(images);
        store.addScanAssessment(assessment);
        router.push(`/scan/results?id=${assessment.id}`);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisStatus("");
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (confirm(`ML pipeline failed: ${msg}\n\nUse demo assessment instead?`)) {
        const assessment = generateMockAssessment(images);
        store.addScanAssessment(assessment);
        router.push(`/scan/results?id=${assessment.id}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (!hasSideImage) {
      return;
    }
    if (credits < 1) {
      if (
        confirm(
          "You do not have enough credits to run a scan. Go to the credits page to purchase more?"
        )
      ) {
        router.push("/credits");
      }
      return;
    }
    setShowCreditConfirm(true);
  };

  const handleConfirmUseCredit = async () => {
    if (!hasSideImage) {
      setShowCreditConfirm(false);
      alert("A side view image is required to run the analysis.");
      return;
    }
    const ok = consumeCredit();
    if (!ok) {
      setShowCreditConfirm(false);
      alert("You do not have enough credits to run a scan.");
      router.push("/credits");
      return;
    }
    setShowCreditConfirm(false);
    await performAnalysis();
  };

  // ── What will run indicator ─────────────────────────────────────────

  const pipelinesWillRun = [
    ...(hasSideImage ? ["Dimension & Weight", "Skin Disease"] : []),
    ...(hasTeethImage ? ["Age Prediction"] : []),
  ];

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Scan Livestock
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Capture images for AI analysis — only a side view is required
        </p>

        {/* ── ML Settings ─────────────────────────────────────────── */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">AI Analysis Mode</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                useMLPipeline
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {useMLPipeline ? "ML Pipeline" : "Demo Mode"}
              </span>
            </div>
            <button
              onClick={() => setUseMLPipeline(!useMLPipeline)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useMLPipeline ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useMLPipeline ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          {useMLPipeline ? (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Breed (for weight correction)
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {BREEDS.map((b) => (
                  <option key={b} value={b}>
                    {b.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-yellow-600">
              Demo mode uses simulated data. Enable ML Pipeline for real analysis.
            </p>
          )}
        </div>

        {/* ── Capture slot tabs ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {CAPTURE_SLOTS.map((slot, idx) => {
            const captured = !!images[slot.key];
            const isActive = idx === activeSlot;
            return (
              <button
                key={slot.key}
                onClick={() => setActiveSlot(idx)}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-primary-600 bg-primary-50"
                    : captured
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="text-2xl mb-1">{slot.icon}</span>
                <span className={`text-xs font-semibold ${
                  isActive ? "text-primary-700" : captured ? "text-green-700" : "text-gray-600"
                }`}>
                  {slot.label}
                </span>
                {/* Status dot */}
                {captured && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">✓</span>
                  </span>
                )}
                {slot.required && !captured && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-400 rounded-full" title="Required" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Active capture area ─────────────────────────────────── */}
        <div className="card p-6 mb-6">
          {/* Slot header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-4xl">{currentSlot.icon}</span>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentSlot.label}
                  {currentSlot.required && (
                    <span className="ml-2 text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500">{currentSlot.description}</p>
              </div>
            </div>
            {/* Pipeline badges */}
            <div className="flex justify-center gap-2 mt-2">
              {currentSlot.pipelines.map((p) => (
                <span
                  key={p}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Image captured OR capture controls */}
          {images[currentSlot.key] ? (
            <div>
              <img
                src={images[currentSlot.key]}
                alt={currentSlot.label}
                className="w-full h-64 object-cover rounded-lg mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => removeImage(currentSlot.key)}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Retake
                </button>
                {activeSlot < CAPTURE_SLOTS.length - 1 && (
                  <button
                    onClick={() => setActiveSlot(activeSlot + 1)}
                    className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera */}
              <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Live camera</p>
                    <p className="text-xs text-gray-600">Point at the animal and capture</p>
                  </div>
                  {cameraStream ? (
                    <button onClick={stopCamera} className="text-sm font-semibold text-red-600 hover:text-red-700">
                      Stop
                    </button>
                  ) : (
                    <button onClick={startCamera} className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                      Start
                    </button>
                  )}
                </div>

                {cameraError && <p className="text-sm text-red-600 mb-2">{cameraError}</p>}

                <div className="relative overflow-hidden rounded-xl border border-primary-100 bg-white">
                  {cameraStream ? (
                    <video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline muted />
                  ) : (
                    <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
                      Camera preview
                    </div>
                  )}
                </div>

                <button
                  onClick={captureFromCamera}
                  disabled={!cameraStream}
                  className={`w-full mt-3 px-6 py-3 rounded-lg font-semibold ${
                    cameraStream
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {cameraStream ? "📸 Capture" : "Start camera first"}
                </button>
              </div>

              {/* Upload buttons */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileInput(currentSlot.key, e)}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-4 bg-white text-primary-700 rounded-lg text-center font-semibold border-2 border-primary-200 cursor-pointer hover:bg-primary-50 text-sm">
                    📷 Take Photo
                  </div>
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInput(currentSlot.key, e)}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-4 bg-white text-gray-700 rounded-lg text-center font-semibold border-2 border-gray-200 cursor-pointer hover:bg-gray-50 text-sm">
                    📁 Upload
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation arrows */}
          <div className="flex gap-3 mt-4">
            {activeSlot > 0 && (
              <button
                onClick={() => setActiveSlot(activeSlot - 1)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                ← Previous
              </button>
            )}
            {activeSlot < CAPTURE_SLOTS.length - 1 && !images[currentSlot.key] && (
              <button
                onClick={() => setActiveSlot(activeSlot + 1)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
              >
                Skip →
              </button>
            )}
          </div>
        </div>

        {/* ── Thumbnail strip ─────────────────────────────────────── */}
        {capturedCount > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Captured ({capturedCount}/2)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CAPTURE_SLOTS.map((slot) => (
                <div
                  key={slot.key}
                  onClick={() => setActiveSlot(CAPTURE_SLOTS.indexOf(slot))}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                    images[slot.key]
                      ? "border-primary-600"
                      : slot.required
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {images[slot.key] ? (
                    <img src={images[slot.key]} alt={slot.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                      <span className="text-lg">{slot.icon}</span>
                      <span className="text-[10px] font-medium">
                        {slot.required ? "Required" : "Optional"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Analyses that will run ──────────────────────────────── */}
        {hasSideImage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-2">
              Analyses that will run:
            </p>
            <div className="flex flex-wrap gap-2">
              {pipelinesWillRun.map((p) => (
                <span key={p} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {p}
                </span>
              ))}
            </div>
            {!hasTeethImage && (
              <p className="text-xs text-blue-600 mt-2">
                💡 Add a teeth image to enable age prediction
              </p>
            )}
          </div>
        )}

        {/* ── Analyse button (sticky on mobile) ──────────────────── */}
        <div className="sticky bottom-20 md:relative md:bottom-0 bg-white pt-4 pb-4 md:pb-0 border-t md:border-t-0">
          {analysisStatus && isAnalyzing && (
            <div className="mb-3 p-3 bg-primary-50 border border-primary-100 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <p className="text-sm text-primary-700 font-medium">{analysisStatus}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyzeClick}
            disabled={!hasSideImage || isAnalyzing}
            className={`w-full px-6 py-4 rounded-lg font-semibold text-lg ${
              hasSideImage && !isAnalyzing
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing…
              </span>
            ) : !hasSideImage ? (
              "Capture side view to analyze"
            ) : (
              <span className="flex items-center justify-center gap-2">
                {useMLPipeline && "🧠 "}Analyze{useMLPipeline ? " with ML" : ""}
                {hasTeethImage && " (+ Age)"}
              </span>
            )}
          </button>

          {!hasSideImage && (
            <p className="text-xs text-center text-gray-400 mt-2">
              A side view image is required for dimension and skin analysis
            </p>
          )}
        </div>
      </div>
      {showCreditConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Use 1 credit for this scan?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Each scan costs <span className="font-semibold">1 credit</span>.
              You currently have{" "}
              <span className="font-semibold">{credits}</span> credits.
            </p>
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowCreditConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUseCredit}
                disabled={isAnalyzing}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60"
              >
                {isAnalyzing ? "Scanning…" : "Confirm & Scan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      <div className="h-20 md:hidden" />
    </div>
  );
}

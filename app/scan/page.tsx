"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav, BottomNav } from "@/components/Navigation";
import { Angle } from "@/lib/types";
import { generateMockAssessment } from "@/lib/mockAssessment";
import { analyzeWithML, dataURLtoFile, buildAssessmentFromML } from "@/lib/mlAnalysis";
import { store } from "@/lib/store";

const BREEDS = [
  "generic",
  "holstein",
  "angus",
  "hereford",
  "brahman",
  "jersey",
  "simmental",
  "limousin",
  "charolais",
  "bali",
  "ongole",
  "madura",
  "peranakan_ongole",
];

const ANGLES: Array<{ key: Angle; label: string; icon: string }> = [
  { key: "front", label: "Front", icon: "⬆️" },
  { key: "left", label: "Left Side", icon: "⬅️" },
  { key: "back", label: "Back", icon: "⬇️" },
  { key: "right", label: "Right Side", icon: "➡️" },
  { key: "teeth", label: "Teeth", icon: "🦷" },
];

export default function ScanPage() {
  const router = useRouter();
  const [images, setImages] = useState<Partial<Record<Angle, string>>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");
  const [breed, setBreed] = useState<string>("generic");
  const [useMLPipeline, setUseMLPipeline] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");

  const setImageData = (angle: Angle, base64String: string) => {
    setImages((prev) => ({ ...prev, [angle]: base64String }));
    if (currentStep < ANGLES.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 250);
    }
  };

  const handleImageCapture = (angle: Angle, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(angle, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (angle: Angle, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageCapture(angle, file);
    }
  };

  const handleAnalyze = async () => {
    const allImages = images as Record<Angle, string>;
    if (Object.keys(allImages).length !== 5) {
      alert("Please capture all 5 angles (including teeth) before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus("");

    try {
      if (useMLPipeline) {
        // Use real ML pipeline
        // Prefer left side image (best for lateral-view pipeline)
        const primaryImage = allImages.left || allImages.right || allImages.front;
        setAnalysisStatus("Sending image to ML pipeline...");
        const imageFile = dataURLtoFile(primaryImage, "livestock.jpg");

        setAnalysisStatus("Running segmentation & keypoint detection...");
        const mlResult = await analyzeWithML(imageFile, breed);

        setAnalysisStatus("Building assessment...");
        const assessment = buildAssessmentFromML(mlResult, allImages);

        store.addScanAssessment(assessment);
        router.push(`/scan/results?id=${assessment.id}`);
      } else {
        // Fallback to mock assessment
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const assessment = generateMockAssessment(allImages);
        store.addScanAssessment(assessment);
        router.push(`/scan/results?id=${assessment.id}`);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisStatus("");
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      
      if (confirm(`ML pipeline failed: ${errorMsg}\n\nUse mock assessment instead?`)) {
        const assessment = generateMockAssessment(allImages);
        store.addScanAssessment(assessment);
        router.push(`/scan/results?id=${assessment.id}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

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
    } catch (error) {
      setCameraError("Camera unavailable. Please allow access or use upload instead.");
    }
  };

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
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
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setImageData(currentAngle.key, dataUrl);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const allImagesCaptured = Object.keys(images).length === 5;
  const currentAngle = ANGLES[currentStep];

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Scan Livestock
        </h1>

        {/* ML Pipeline Settings */}
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
              <p className="text-xs text-gray-500 mt-1">
                The left side image will be used for ML dimension analysis (lateral view is optimal).
              </p>
            </div>
          ) : (
            <p className="text-xs text-yellow-600">
              Demo mode uses simulated data. Enable ML Pipeline for real weight and dimension analysis.
            </p>
          )}
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {ANGLES.map((angle, index) => (
              <div
                key={angle.key}
                className={`flex-1 flex flex-col items-center ${
                  index < ANGLES.length - 1 ? "mr-2" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    images[angle.key]
                      ? "bg-primary-600 text-white"
                      : index === currentStep
                      ? "bg-primary-100 text-primary-700 border-2 border-primary-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {images[angle.key] ? "✓" : index + 1}
                </div>
                <span className="text-xs mt-2 text-center text-gray-600">
                  {angle.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="card p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{currentAngle.icon}</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Capture {currentAngle.label}
            </h2>
            <p className="text-gray-600">
              {images[currentAngle.key]
                ? "Image captured successfully"
                : cameraStream
                ? "Use the live camera or upload"
                : "Start the camera or upload from gallery"}
            </p>
          </div>

          {images[currentAngle.key] ? (
            <div className="mb-4">
              <img
                src={images[currentAngle.key]}
                alt={currentAngle.label}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => {
                    const newImages = { ...images };
                    delete newImages[currentAngle.key];
                    setImages(newImages);
                  }}
                  className="px-4 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Retake
                </button>
                {currentStep < ANGLES.length - 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-4 py-3 rounded-lg font-semibold text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Next angle →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Live camera</p>
                    <p className="text-xs text-gray-600">Use your device camera for faster capture</p>
                  </div>
                  {cameraStream ? (
                    <button
                      onClick={stopCamera}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="text-sm font-semibold text-primary-700 hover:text-primary-800"
                    >
                      Start
                    </button>
                  )}
                </div>

                {cameraError && (
                  <p className="text-sm text-red-600 mb-2">{cameraError}</p>
                )}

                <div className="relative overflow-hidden rounded-xl border border-primary-100 bg-white">
                  {cameraStream ? (
                    <div className="relative">
                      <video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline muted />
                      <div className="absolute inset-0 pointer-events-none border-2 border-primary-200 rounded-xl" />
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                      Camera preview will appear here
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

              <div className="space-y-3">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileInput(currentAngle.key, e)}
                    className="hidden"
                  />
                  <div className="w-full px-6 py-4 bg-white text-primary-700 rounded-lg text-center font-semibold border-2 border-primary-200 cursor-pointer hover:bg-primary-50">
                    📷 Take Photo
                  </div>
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInput(currentAngle.key, e)}
                    className="hidden"
                  />
                  <div className="w-full px-6 py-4 bg-white text-gray-800 rounded-lg text-center font-semibold border-2 border-gray-200 cursor-pointer hover:bg-gray-50">
                    📁 Upload from gallery
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                ← Previous
              </button>
            )}
            {currentStep < ANGLES.length - 1 && !images[currentAngle.key] && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Skip →
              </button>
            )}
          </div>
        </div>

        {/* Image Thumbnails */}
        {Object.keys(images).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Captured Images
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {ANGLES.map((angle) => (
                <div
                  key={angle.key}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    images[angle.key]
                      ? "border-primary-600"
                      : "border-gray-200 bg-gray-100"
                  }`}
                >
                  {images[angle.key] ? (
                    <img
                      src={images[angle.key]}
                      alt={angle.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {angle.icon}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button - Sticky Bottom on Mobile */}
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
            onClick={handleAnalyze}
            disabled={!allImagesCaptured || isAnalyzing}
            className={`w-full px-6 py-4 rounded-lg font-semibold text-lg ${
              allImagesCaptured && !isAnalyzing
                ? "bg-primary-600 text-white hover:bg-primary-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {useMLPipeline ? "Running ML Pipeline..." : "Analyzing..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {useMLPipeline && "🧠 "}Analyze{useMLPipeline ? " with ML" : ""}
              </span>
            )}
          </button>
        </div>
      </div>

      <BottomNav />
      <div className="h-20 md:hidden" /> {/* Spacer for bottom nav */}
    </div>
  );
}

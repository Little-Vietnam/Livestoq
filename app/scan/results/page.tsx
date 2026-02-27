"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TopNav, BottomNav } from "@/components/Navigation";
import { VerifiedBadge, ConfidenceBadge } from "@/components/Badges";
import { ScanAssessment } from "@/lib/types";
import { store } from "@/lib/store";
import { formatIdrRange, formatConfidence, formatDate } from "@/lib/utils";

const ANGLES: Array<{ key: keyof ScanAssessment["images"]; label: string }> = [
  { key: "front", label: "Front" },
  { key: "left", label: "Left Side" },
  { key: "back", label: "Back" },
  { key: "right", label: "Right Side" },
  { key: "teeth", label: "Teeth" },
];

function ScanResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assessment, setAssessment] = useState<ScanAssessment | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const found = store.getScanAssessment(id);
      if (found) {
        setAssessment(found);
      } else {
        // Fallback to latest if ID not found
        const latest = store.getLatestScanAssessment();
        if (latest) {
          setAssessment(latest);
        }
      }
    } else {
      // No ID, try latest
      const latest = store.getLatestScanAssessment();
      if (latest) {
        setAssessment(latest);
      }
    }
  }, [searchParams]);

  if (!assessment) {
    return (
      <div className="min-h-screen bg-white">
        <TopNav />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">No assessment found.</p>
          <Link
            href="/scan"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700"
          >
            Start a new scan
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { prediction, confidence, createdAt, images, mlAnalysis } = assessment;

  // Dimension labels for display
  const DIMENSION_LABELS: Record<string, string> = {
    body_length_cm: "Body Length",
    body_width_cm: "Body Width",
    tube_girth_cm: "Tube Girth",
    body_height_cm: "Body Height",
    chest_width_cm: "Chest Width",
    abdominal_girth_cm: "Abdominal Girth",
    chest_depth_cm: "Chest Depth",
    chest_girth_cm: "Chest Girth",
  };

  const METHOD_LABELS: Record<string, string> = {
    schaeffer: "Schaeffer's Formula",
    heart_girth: "Heart-Girth Method",
    crevat_lagneau: "Crevat-Lagneau",
    regression: "Multivariate Regression",
    bsa: "Body Surface Area",
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Summary</h1>
              <p className="text-gray-600">Scanned on {formatDate(createdAt)}</p>
            </div>
            {mlAnalysis && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                ML Pipeline
              </span>
            )}
          </div>
        </div>

        {/* Images Grid */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Captured Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ANGLES.map((angle) => (
              <div key={angle.key} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <img
                  src={images[angle.key]}
                  alt={angle.label}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 text-center text-sm font-medium text-gray-700">
                  {angle.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ML Body Dimensions Card */}
        {mlAnalysis && (
          <div className="card border-blue-100 border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Body Measurements</h2>
              <span className="text-sm text-gray-500">
                Breed: <span className="font-semibold text-gray-700 capitalize">{mlAnalysis.breed.replace(/_/g, " ")}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(mlAnalysis.dimensions).map(([key, value]) => {
                const confKey = key.replace("_cm", "");
                const rawConf = mlAnalysis.dimension_confidence[confKey];
                const conf = typeof rawConf === "string" ? parseFloat(rawConf) : rawConf;
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {DIMENSION_LABELS[key] || key}
                      </span>
                      {conf != null && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          conf >= 0.7 ? "bg-green-100 text-green-700" :
                          conf >= 0.5 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {Math.round(conf * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {typeof value === "number" ? value.toFixed(1) : value} <span className="text-sm font-normal text-gray-500">cm</span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Pose Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Pose Analysis</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-blue-700">
                <div>
                  <span className="text-blue-500">Orientation:</span>{" "}
                  <span className="font-semibold capitalize">{mlAnalysis.pose.orientation}</span>
                </div>
                <div>
                  <span className="text-blue-500">Yaw:</span>{" "}
                  <span className="font-semibold">{mlAnalysis.pose.yaw_deg}°</span>
                </div>
                <div>
                  <span className="text-blue-500">Distance:</span>{" "}
                  <span className="font-semibold">{mlAnalysis.distance.distance_m}m</span>
                </div>
                <div>
                  <span className="text-blue-500">Keypoints:</span>{" "}
                  <span className="font-semibold">{mlAnalysis.keypoints.num_detected}/17</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ML Weight Prediction Card */}
        {mlAnalysis && (
          <div className="card border-green-100 border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weight Prediction</h2>

            {/* Primary weight */}
            <div className="text-center mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <p className="text-sm font-medium text-green-600 mb-1">Estimated Live Weight</p>
              <p className="text-5xl font-bold text-gray-900">
                {mlAnalysis.weight.predicted_kg.toFixed(1)}
                <span className="text-2xl font-normal text-gray-500 ml-1">kg</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Range: {mlAnalysis.weight.range_kg[0].toFixed(0)} – {mlAnalysis.weight.range_kg[1].toFixed(0)} kg
              </p>
            </div>

            {/* BCS */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Body Condition Score (BCS)</span>
                <span className="text-lg font-bold text-gray-900">{mlAnalysis.weight.bcs.toFixed(1)}/9</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    mlAnalysis.weight.bcs <= 3 ? "bg-red-500" :
                    mlAnalysis.weight.bcs <= 5 ? "bg-yellow-500" :
                    mlAnalysis.weight.bcs <= 7 ? "bg-green-500" :
                    "bg-orange-500"
                  }`}
                  style={{ width: `${(mlAnalysis.weight.bcs / 9) * 100}%` }}
                />
              </div>
              <div className="flex text-xs text-gray-400 mt-1">
                <span className="w-1/3">Thin (1–3)</span>
                <span className="w-1/3 text-center">Moderate (4–6)</span>
                <span className="w-1/3 text-right">Fleshy (7–9)</span>
              </div>
            </div>

            {/* Method Breakdown */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Prediction Methods</p>
              <div className="space-y-2">
                {Object.entries(mlAnalysis.weight.method_weights).map(([method, weight]) => (
                  <div key={method} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">{METHOD_LABELS[method] || method}</span>
                    <span className="text-sm font-semibold text-gray-900">{weight.toFixed(1)} kg</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Final prediction is a confidence-weighted ensemble average with outlier rejection.
                {mlAnalysis.weight.breed_factor !== 1 && (
                  <span> Breed correction factor: ×{mlAnalysis.weight.breed_factor.toFixed(2)}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* AI Assessment Card */}
        <div className="card border-primary-100 border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Assessment</h2>
            <VerifiedBadge />
          </div>

          <div className="space-y-6">
            {/* Species */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Species</span>
                <ConfidenceBadge confidence={confidence.species} />
              </div>
              <p className="text-xl font-semibold text-gray-900 capitalize">
                {prediction.species}
              </p>
            </div>

            {/* Age Eligibility */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Age
                </span>
                <ConfidenceBadge confidence={confidence.ageEligibility} />
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {prediction.ageEligibility} months
              </p>
            </div>

            {/* Gender */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Gender
                </span>
                <ConfidenceBadge confidence={confidence.gender} />
              </div>
              <p className="text-xl font-semibold text-gray-900 capitalize">
                {prediction.gender}
              </p>
            </div>

            {/* Weight */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Estimated Weight
                </span>
                <ConfidenceBadge confidence={confidence.weight} />
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {prediction.weightKg} kg
              </p>
            </div>

            {/* Health Risk */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Health Risk
                </span>
                <ConfidenceBadge confidence={confidence.healthRisk} />
              </div>
              <p
                className={`text-xl font-semibold mb-2 ${
                  prediction.healthRisk === "Low"
                    ? "text-green-600"
                    : prediction.healthRisk === "Medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {prediction.healthRisk}
              </p>
              {prediction.healthRiskExplanation && (
                <p className="text-sm text-gray-600 italic">
                  {prediction.healthRiskExplanation}
                </p>
              )}
            </div>

            {/* Fair Price Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Fair Price Estimate
                </span>
                <ConfidenceBadge confidence={confidence.fairPrice} />
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {formatIdrRange(
                  prediction.fairPriceIdrRange.min,
                  prediction.fairPriceIdrRange.max
                )}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong>{" "}
              {mlAnalysis
                ? "Weight and dimensions are estimated using computer vision ML pipeline. Results may vary based on image quality, angle, and lighting conditions."
                : "AI-based estimate (MVP mock). Always verify directly."}{" "}
              Verify before you buy. Fraud happens fastest when decisions are rushed.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/scan"
            className="block px-6 py-4 bg-white text-primary-600 rounded-lg text-center font-semibold border-2 border-primary-600 hover:bg-primary-50"
          >
            Scan another animal
          </Link>
          <Link
            href="/marketplace"
            className="block px-6 py-4 bg-primary-600 text-white rounded-lg text-center font-semibold hover:bg-primary-700"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>

      <BottomNav />
      <div className="h-20 md:hidden" /> {/* Spacer for bottom nav */}
    </div>
  );
}

export default function ScanResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <TopNav />
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
          <BottomNav />
        </div>
      }
    >
      <ScanResultsContent />
    </Suspense>
  );
}

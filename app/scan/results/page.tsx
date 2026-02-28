"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TopNav, BottomNav } from "@/components/Navigation";
import { VerifiedBadge, ConfidenceBadge } from "@/components/Badges";
import { useAuth } from "@/components/AuthContext";
import { ScanAssessment, Angle } from "@/lib/types";
import { store } from "@/lib/store";
import { formatIdrRange, formatConfidence, formatDate } from "@/lib/utils";

// ── Labels ──────────────────────────────────────────────────────────────

const ANGLE_LABELS: Record<Angle, string> = {
  side: "Side View",
  teeth: "Teeth / Mouth",
};

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

const DENTITION_LABELS: Record<string, string> = {
  "milk-teeth": "All Milk Teeth",
  "2-tooth": "2-Tooth (1 permanent pair)",
  "4-tooth": "4-Tooth (2 permanent pairs)",
  "6-tooth": "6-Tooth (3 permanent pairs)",
  "full-mouth": "Full Mouth",
  "full-mouth-worn": "Full Mouth (worn)",
  aged: "Aged",
  old: "Old",
  unknown: "Unknown",
};

// ── Component ───────────────────────────────────────────────────────────

function ScanResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  const [assessment, setAssessment] = useState<ScanAssessment | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/scan/results");
      return;
    }
    if (loading) return;
    const id = searchParams.get("id");
    if (id) {
      const found = store.getScanAssessment(id);
      if (found) setAssessment(found);
      else {
        const latest = store.getLatestScanAssessment();
        if (latest) setAssessment(latest);
      }
    } else {
      const latest = store.getLatestScanAssessment();
      if (latest) setAssessment(latest);
    }
  }, [isAuthenticated, loading, router, searchParams]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <TopNav />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">{loading ? "" : "Redirecting to login…"}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-white">
        <TopNav />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">No assessment found.</p>
          <Link href="/scan" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            Start a new scan
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const {
    prediction,
    confidence,
    createdAt,
    images,
    mlAnalysis,
    skinDisease,
    agePrediction,
    analysesRun,
  } = assessment;

  const isML = analysesRun && !analysesRun.includes("mock");

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Scan Summary</h1>
              <p className="text-gray-600 text-sm">Scanned on {formatDate(createdAt)}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {analysesRun?.map((a) => (
                <span
                  key={a}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    a === "mock"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${a === "mock" ? "bg-yellow-500" : "bg-green-500"}`} />
                  {a === "dimension_weight"
                    ? "Dimensions & Weight"
                    : a === "skin_disease"
                    ? "Skin Disease"
                    : a === "age_prediction"
                    ? "Age Prediction"
                    : a === "mock"
                    ? "Demo Mode"
                    : a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Captured images ─────────────────────────────────────── */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Captured Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(Object.entries(images) as [Angle, string][])
              .filter(([, v]) => !!v)
              .map(([angle, src]) => (
                <div key={angle} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                  <img src={src} alt={ANGLE_LABELS[angle]} className="w-full h-36 object-cover" />
                  <div className="p-2 text-center text-xs font-medium text-gray-700">
                    {ANGLE_LABELS[angle]}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ── Body Dimensions (from side image) ───────────────────── */}
        {mlAnalysis && (
          <div className="card border-blue-100 border p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
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
                      {typeof value === "number" ? value.toFixed(1) : value}{" "}
                      <span className="text-sm font-normal text-gray-500">cm</span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Pose info */}
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

        {/* ── Weight Prediction ───────────────────────────────────── */}
        {mlAnalysis && (
          <div className="card border-green-100 border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weight Prediction</h2>

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

            {/* Method breakdown */}
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

        {/* ── Skin Disease Detection ──────────────────────────────── */}
        {skinDisease && (
          <div className={`card border p-6 ${
            skinDisease.overall_status === "healthy"
              ? "border-green-100"
              : skinDisease.overall_status === "suspect"
              ? "border-yellow-100"
              : "border-red-100"
          }`}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h2 className="text-2xl font-bold text-gray-900">Skin Health</h2>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                skinDisease.overall_status === "healthy"
                  ? "bg-green-100 text-green-700"
                  : skinDisease.overall_status === "suspect"
                  ? "bg-yellow-100 text-yellow-700"
                  : skinDisease.overall_status === "diseased"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {skinDisease.overall_status === "healthy"
                  ? "✓ Healthy"
                  : skinDisease.overall_status === "suspect"
                  ? "~ Suspect"
                  : skinDisease.overall_status === "diseased"
                  ? "~ Attention"
                  : "Unknown"}
              </span>
            </div>

            {/* Skin score gauge */}
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Skin Quality Score</span>
                <span className="text-2xl font-bold text-gray-900">
                  {skinDisease.skin_quality_score.toFixed(0)}
                  <span className="text-sm font-normal text-gray-500">/100</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    skinDisease.skin_quality_score >= 80 ? "bg-green-500" :
                    skinDisease.skin_quality_score >= 50 ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${skinDisease.skin_quality_score}%` }}
                />
              </div>
            </div>

            {/* Neutral skin interpretation */}
            <div className="text-center py-3">
              {skinDisease.skin_quality_score >= 88 ? (
                <>
                  <p className="text-green-600 font-semibold">No skin disease indicators detected</p>
                  <p className="text-sm text-gray-500 mt-1">Coat and skin texture appear within normal range based on visual analysis.</p>
                </>
              ) : skinDisease.skin_quality_score >= 82 ? (
                <>
                  <p className="text-yellow-600 font-semibold">Minor visual variations noted</p>
                  <p className="text-sm text-gray-500 mt-1">No significant disease markers detected. A routine veterinary check is a good practice.</p>
                </>
              ) : (
                <>
                  <p className="text-orange-600 font-semibold">Some visual patterns observed</p>
                  <p className="text-sm text-gray-500 mt-1">The skin analysis flagged some patterns. Consult a veterinarian for a professional assessment.</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Age Prediction (from teeth) ─────────────────────────── */}
        {agePrediction && (
          <div className="card border-purple-100 border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Age Prediction</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Predicted age */}
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                <p className="text-sm font-medium text-purple-600 mb-1">Estimated Age</p>
                <p className="text-4xl font-bold text-gray-900">
                  {agePrediction.predicted_age_months}
                  <span className="text-lg font-normal text-gray-500 ml-1">mo</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Range: {agePrediction.age_range_months[0]}–{agePrediction.age_range_months[1]} months
                </p>
              </div>

              {/* Dentition stage */}
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-500 mb-1">Dentition Stage</p>
                <p className="text-lg font-bold text-gray-900">
                  {DENTITION_LABELS[agePrediction.dentition_stage] || agePrediction.dentition_stage}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {agePrediction.tooth_count} teeth detected
                </p>
              </div>

              {/* Wear grade */}
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-500 mb-1">Tooth Wear</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[0, 1, 2, 3].map((g) => (
                    <div
                      key={g}
                      className={`w-8 h-3 rounded ${
                        g <= agePrediction.wear_grade
                          ? g <= 1 ? "bg-green-400" : g === 2 ? "bg-yellow-400" : "bg-red-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Grade {agePrediction.wear_grade}/3 —{" "}
                  {agePrediction.wear_grade === 0
                    ? "Unworn"
                    : agePrediction.wear_grade === 1
                    ? "Slight wear"
                    : agePrediction.wear_grade === 2
                    ? "Moderate wear"
                    : "Heavy wear"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-700">Analysis Confidence</span>
              <span className="text-sm font-bold text-purple-900">
                {Math.round(agePrediction.confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* ── No teeth notice ─────────────────────────────────────── */}
        {!agePrediction && isML && (
          <div className="card border-gray-200 border p-6 text-center">
            <p className="text-gray-500 text-sm">
              🦷 Age prediction was not performed — no teeth image was provided.
            </p>
          </div>
        )}

        {/* ── AI Assessment summary ───────────────────────────────── */}
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
              <p className="text-xl font-semibold text-gray-900 capitalize">{prediction.species}</p>
            </div>

            {/* Age */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Age</span>
                <ConfidenceBadge confidence={confidence.ageEligibility} />
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {prediction.ageEligibility === "N/A" ? (
                  <span className="text-gray-400">Not available (no teeth image)</span>
                ) : (
                  <>{prediction.ageEligibility} months</>
                )}
              </p>
            </div>

            {/* Weight */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Estimated Weight</span>
                <ConfidenceBadge confidence={confidence.weight} />
              </div>
              <p className="text-xl font-semibold text-gray-900">{prediction.weightKg} kg</p>
            </div>

            {/* Gender */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Gender</span>
                <ConfidenceBadge confidence={confidence.gender} />
              </div>
              <p className="text-xl font-semibold text-gray-900 capitalize">{prediction.gender}</p>
            </div>

            {/* Health Risk */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Health Risk</span>
                <ConfidenceBadge confidence={confidence.healthRisk} />
              </div>
              <p className={`text-xl font-semibold mb-2 ${
                prediction.healthRisk === "Low" ? "text-green-600" :
                prediction.healthRisk === "Medium" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {prediction.healthRisk === "Low" ? "Good" : prediction.healthRisk}
              </p>
              {prediction.healthRiskExplanation && (
                <p className="text-sm text-gray-600 italic">{prediction.healthRiskExplanation}</p>
              )}
            </div>

            {/* Fair Price */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Fair Price Estimate</span>
                <ConfidenceBadge confidence={confidence.fairPrice} />
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {prediction.fairPriceIdrRange.min > 0
                  ? formatIdrRange(prediction.fairPriceIdrRange.min, prediction.fairPriceIdrRange.max)
                  : <span className="text-gray-400">Not available</span>}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong>{" "}
              {isML
                ? "Dimensions, weight, age, and skin analysis are estimated using computer vision. Results may vary based on image quality, angle, and lighting."
                : "Demo mode — simulated assessment data. Enable ML Pipeline for real analysis."}{" "}
              Always verify directly before purchasing.
            </p>
          </div>
        </div>

        {/* ── CTAs ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/scan"
            className="block px-6 py-4 bg-white text-primary-600 rounded-lg text-center font-semibold border-2 border-primary-600 hover:bg-primary-50"
          >
            Scan another
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
      <div className="h-20 md:hidden" />
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
            <p className="text-gray-600">Loading…</p>
          </div>
          <BottomNav />
        </div>
      }
    >
      <ScanResultsContent />
    </Suspense>
  );
}

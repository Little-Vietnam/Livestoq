import {
  MLFullAnalysisResult,
  ScanAssessment,
  Angle,
  Confidence,
  MLSkinDiseaseResult,
} from "./types";

/**
 * Send side image (and optional teeth image) to ML pipeline for full analysis.
 */
export async function analyzeWithML(
  sideImageFile: File | Blob,
  teethImageFile: File | Blob | null,
  breed: string = "generic"
): Promise<MLFullAnalysisResult> {
  const formData = new FormData();
  formData.append("side_image", sideImageFile);
  formData.append("breed", breed);

  if (teethImageFile) {
    formData.append("teeth_image", teethImageFile);
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.details || error.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Convert a base64 data URL to a File object.
 */
export function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Estimate fair price range based on weight in kg.
 */
function estimateFairPrice(weightKg: number): { min: number; max: number } {
  const pricePerKgLow = 55_000;
  const pricePerKgHigh = 75_000;
  return {
    min: Math.round(weightKg * pricePerKgLow),
    max: Math.round(weightKg * pricePerKgHigh),
  };
}

/**
 * Derive health risk from BCS + skin disease status.
 */
function deriveHealthRisk(
  bcs: number,
  skinDisease?: MLSkinDiseaseResult
): { risk: "Low" | "Medium" | "High"; explanation: string } {
  // Start with BCS-based risk
  let risk: "Low" | "Medium" | "High";
  let explanation: string;

  if (bcs >= 4 && bcs <= 7) {
    risk = "Low";
    explanation = "Body condition is within the optimal range.";
  } else if ((bcs >= 3 && bcs < 4) || (bcs > 7 && bcs <= 8)) {
    risk = "Medium";
    explanation = `BCS ${bcs.toFixed(1)} is slightly outside optimal range.`;
  } else {
    risk = "High";
    explanation = bcs < 3
      ? "Animal appears underweight, possible malnutrition."
      : "Animal appears overconditioned, metabolic risk.";
  }

  // Elevate risk if skin disease detected
  if (skinDisease) {
    if (skinDisease.overall_status === "diseased") {
      risk = "High";
      const diseaseNames = skinDisease.conditions.map((c) => c.name).join(", ");
      explanation += ` Skin conditions detected: ${diseaseNames}.`;
    } else if (skinDisease.overall_status === "suspect") {
      if (risk === "Low") risk = "Medium";
      explanation += " Possible skin anomalies detected — recommend veterinary check.";
    }
  }

  return { risk, explanation };
}

/**
 * Build a full ScanAssessment from combined ML pipeline results.
 */
export function buildAssessmentFromML(
  mlResult: MLFullAnalysisResult,
  images: Partial<Record<Angle, string>>
): ScanAssessment {
  const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();

  const dw = mlResult.dimension_weight;

  // Weight
  const weightKg = dw
    ? Math.round(dw.weight.predicted_kg * 10) / 10
    : 0;
  const bcs = dw?.weight.bcs ?? 5;

  // Age (from teeth)
  const agePrediction = mlResult.age_prediction;
  const ageMonths = agePrediction?.predicted_age_months;
  const ageDisplay = ageMonths != null ? String(ageMonths) : "N/A";

  // Health risk (BCS + skin)
  const healthInfo = deriveHealthRisk(bcs, mlResult.skin_disease);

  // Fair price
  const fairPrice = weightKg > 0
    ? estimateFairPrice(weightKg)
    : { min: 0, max: 0 };

  // Confidence scores
  const segConf = dw?.segmentation.confidence ?? 0.5;
  const distConf = dw?.distance.confidence ?? 0.5;
  const poseConf = dw?.pose.confidence ?? 0.5;
  const dimConfValues = dw
    ? Object.values(dw.dimension_confidence).map((v) =>
        typeof v === "string" ? parseFloat(v) : v
      )
    : [0.5];
  const avgDimConf =
    dimConfValues.reduce((sum, v) => sum + v, 0) / dimConfValues.length;
  const weightConf = Math.min(segConf, distConf, poseConf, avgDimConf);
  const ageConf = agePrediction?.confidence ?? 0.5;
  const skinConf = mlResult.skin_disease?.overall_confidence ?? 0.5;

  const confidence: Confidence = {
    species: Math.round(segConf * 100) / 100,
    ageEligibility: Math.round(ageConf * 100) / 100,
    weight: Math.round(Math.max(0.5, weightConf) * 100) / 100,
    healthRisk: Math.round(
      Math.max(0.5, (segConf + poseConf + skinConf) / 3) * 100
    ) / 100,
    fairPrice: Math.round(Math.max(0.5, weightConf * 0.9) * 100) / 100,
    gender: 0.75,
  };

  return {
    id,
    createdAt,
    images,
    prediction: {
      species: "cow",
      ageMonths,
      ageEligibility: ageDisplay,
      weightKg,
      gender: "male",
      healthRisk: healthInfo.risk,
      healthRiskExplanation: healthInfo.explanation,
      fairPriceIdrRange: fairPrice,
    },
    confidence,
    mlAnalysis: dw,
    skinDisease: mlResult.skin_disease,
    agePrediction: mlResult.age_prediction,
    analysesRun: mlResult.analyses_run,
  };
}

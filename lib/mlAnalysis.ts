import { MLAnalysisResult, ScanAssessment, Angle, Confidence } from "./types";

/**
 * Send an image to the ML pipeline API for analysis.
 *
 * @param imageFile - The image file or base64 data URL
 * @param breed - Breed name for weight correction
 * @returns ML analysis result from the pipeline
 */
export async function analyzeWithML(
  imageFile: File | Blob,
  breed: string = "generic"
): Promise<MLAnalysisResult> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("breed", breed);

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
 * Uses Indonesian market rates for Qurban-eligible cattle.
 */
function estimateFairPrice(weightKg: number): { min: number; max: number } {
  // Approximate IDR per kg of live cattle (Indonesian market)
  const pricePerKgLow = 55_000;
  const pricePerKgHigh = 75_000;
  return {
    min: Math.round(weightKg * pricePerKgLow),
    max: Math.round(weightKg * pricePerKgHigh),
  };
}

/**
 * Determine health risk from BCS (Body Condition Score).
 */
function bcsToHealthRisk(bcs: number): {
  risk: "Low" | "Medium" | "High";
  explanation: string;
} {
  if (bcs >= 4 && bcs <= 7) {
    return { risk: "Low", explanation: "Body condition is within the optimal range, indicating good health and nutrition." };
  } else if ((bcs >= 3 && bcs < 4) || (bcs > 7 && bcs <= 8)) {
    return { risk: "Medium", explanation: `Body condition score of ${bcs.toFixed(1)} is slightly outside optimal range. Monitor nutrition and feeding program.` };
  } else {
    const detail = bcs < 3
      ? "Animal appears underweight, which may indicate malnutrition, parasites, or illness."
      : "Animal appears overconditioned, which may cause metabolic issues or calving difficulties.";
    return { risk: "High", explanation: `BCS ${bcs.toFixed(1)}/9. ${detail}` };
  }
}

/**
 * Build a full ScanAssessment from ML pipeline results + captured images.
 * Combines ML-derived weight/dimensions with heuristic species/age/gender.
 */
export function buildAssessmentFromML(
  mlResult: MLAnalysisResult,
  images: Record<Angle, string>
): ScanAssessment {
  const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();

  const weightKg = Math.round(mlResult.weight.predicted_kg * 10) / 10;
  const bcs = mlResult.weight.bcs;
  const healthInfo = bcsToHealthRisk(bcs);
  const fairPrice = estimateFairPrice(weightKg);

  // Use ML confidence values where available
  const segConf = mlResult.segmentation.confidence;
  const distConf = mlResult.distance.confidence;
  const poseConf = mlResult.pose.confidence;
  const dimConfValues = Object.values(mlResult.dimension_confidence).map(
    (v) => (typeof v === "string" ? parseFloat(v) : v)
  );
  const avgDimConf = dimConfValues.reduce((sum, v) => sum + v, 0) / dimConfValues.length;
  const weightConf = Math.min(segConf, distConf, poseConf, avgDimConf);

  const confidence: Confidence = {
    species: Math.round(segConf * 100) / 100,
    ageEligibility: 0.75, // Not determined by ML pipeline
    weight: Math.round(Math.max(0.5, weightConf) * 100) / 100,
    healthRisk: Math.round(Math.max(0.6, (segConf + poseConf) / 2) * 100) / 100,
    fairPrice: Math.round(Math.max(0.5, weightConf * 0.9) * 100) / 100,
    gender: 0.75, // Not determined by ML pipeline
  };

  return {
    id,
    createdAt,
    images,
    prediction: {
      species: "cow",
      ageEligibility: "11",
      weightKg,
      gender: "male",
      healthRisk: healthInfo.risk,
      healthRiskExplanation: healthInfo.explanation,
      fairPriceIdrRange: fairPrice,
    },
    confidence,
    mlAnalysis: mlResult,
  };
}

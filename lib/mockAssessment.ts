import { ScanAssessment, Angle, Confidence } from "./types";

/**
 * Generates a mock AI assessment for demo mode.
 * Returns fixed values: cow, 380kg, age 18 months, Medium health risk.
 */
export function generateMockAssessment(
  images: Partial<Record<Angle, string>>
): ScanAssessment {
  const id = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();

  const hasTeeth = !!images.teeth;

  const species: "cow" = "cow";
  const weightKg = 380;
  const ageMonths = hasTeeth ? 18 : undefined;
  const ageEligibility = hasTeeth ? "18" : "N/A";
  const gender: "male" = "male";
  const healthRisk: "Medium" = "Medium";
  const healthRiskExplanation = "Demo mode — simulated assessment. Enable ML Pipeline for real analysis.";

  const min = 12000000;
  const max = 18000000;
  const fairPriceIdrRange = { min, max };

  const generateConfidence = (): number => {
    return Math.round((Math.random() * 0.29 + 0.70) * 100) / 100;
  };

  const confidence: Confidence = {
    species: generateConfidence(),
    ageEligibility: hasTeeth ? generateConfidence() : 0.5,
    weight: generateConfidence(),
    healthRisk: generateConfidence(),
    fairPrice: generateConfidence(),
    gender: generateConfidence(),
  };

  return {
    id,
    createdAt,
    images,
    prediction: {
      species,
      ageMonths,
      ageEligibility,
      weightKg,
      gender,
      healthRisk,
      healthRiskExplanation,
      fairPriceIdrRange,
    },
    confidence,
    analysesRun: ["mock"],
  };
}

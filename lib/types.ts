// ── Image capture angles ────────────────────────────────────────────────

/** The 2 capture slots: side (required) → teeth (optional) */
export type Angle = "side" | "teeth";

export type Confidence = {
  species: number;        // 0.70–0.99
  ageEligibility: number; // 0.70–0.99
  weight: number;         // 0.70–0.99
  healthRisk: number;     // 0.70–0.99
  fairPrice: number;      // 0.70–0.99
  gender: number;         // 0.70–0.99
};

// ── ML Pipeline Types ──────────────────────────────────────────────────

export type MLDimensions = {
  body_length_cm: number;
  body_width_cm: number;
  tube_girth_cm: number;
  body_height_cm: number;
  chest_width_cm: number;
  abdominal_girth_cm: number;
  chest_depth_cm: number;
  chest_girth_cm: number;
};

export type MLWeightResult = {
  predicted_kg: number;
  range_kg: [number, number];
  bcs: number;
  breed: string;
  breed_factor: number;
  method_weights: Record<string, number>;
};

export type MLPoseResult = {
  orientation: string;
  yaw_deg: number;
  roll_deg: number;
  pitch_deg: number;
  foreshortening_factor: number;
  is_valid: boolean;
  confidence: number;
};

// ── Age Prediction (from teeth image) ──────────────────────────────────

export type MLAgeResult = {
  predicted_age_months: number;
  age_range_months: [number, number];
  dentition_stage: string;       // "milk-teeth" | "2-tooth" | ... | "old"
  wear_grade: number;            // 0–3
  tooth_count: number;
  confidence: number;
  details: Record<string, unknown>;
};

// ── Skin Disease Detection (from side image) ───────────────────────────

export type SkinCondition = {
  name: string;
  confidence: number;
  severity: "none" | "mild" | "moderate" | "severe";
  affected_area_pct: number;
  description: string;
};

export type MLSkinDiseaseResult = {
  overall_status: "healthy" | "suspect" | "diseased" | "unknown";
  overall_confidence: number;
  skin_quality_score: number;     // 0–100
  conditions: SkinCondition[];
  details: Record<string, unknown>;
};

// ── Dimension + Weight pipeline result (from side image) ───────────────

export type MLDimensionWeightResult = {
  image_size: { width: number; height: number };
  breed: string;
  segmentation: {
    bbox: number[];
    area_pixels: number;
    confidence: number;
  };
  distance: {
    distance_m: number;
    method: string;
    pixels_per_meter: number;
    confidence: number;
  };
  keypoints: {
    num_detected: number;
    method: string;
  };
  pose: MLPoseResult;
  dimensions: MLDimensions;
  dimension_confidence: Record<string, number | string>;
  weight: MLWeightResult;
};

// ── Full ML Analysis Result (combined endpoint) ────────────────────────

export type MLFullAnalysisResult = {
  success: boolean;
  analyses_run: string[];
  // From side image
  dimension_weight?: MLDimensionWeightResult;
  dimension_weight_error?: string;
  // Skin disease (side image)
  skin_disease?: MLSkinDiseaseResult;
  // Age prediction (teeth image, optional)
  age_prediction?: MLAgeResult;
  age_prediction_error?: string;
};

// Legacy single-endpoint type (kept for backward compat)
export type MLAnalysisResult = MLDimensionWeightResult & {
  success: boolean;
};

// ── Scan Assessment ────────────────────────────────────────────────────

export type ScanAssessment = {
  id: string;
  createdAt: string; // ISO
  images: Partial<Record<Angle, string>>; // not all angles required
  prediction: {
    species: "cow" | "goat" | "sheep" | "lamb";
    ageMonths?: number;           // from teeth ML (or mock)
    ageEligibility: string;       // display string, e.g. "18" or "~18"
    weightKg: number;
    gender: "male" | "female";
    healthRisk: "Low" | "Medium" | "High";
    healthRiskExplanation?: string;
    fairPriceIdrRange: { min: number; max: number };
  };
  confidence: Confidence;
  // ML pipeline data (present when real ML analysis is used)
  mlAnalysis?: MLDimensionWeightResult;
  skinDisease?: MLSkinDiseaseResult;
  agePrediction?: MLAgeResult;
  analysesRun?: string[];
};

export type MarketplaceListing = {
  id: string;
  title: string;
  location: string;
  sellerName: string;
  priceIdr: number;
  imageUrl: string;
  aiVerified: boolean;
  assessment?: Pick<ScanAssessment, "createdAt" | "prediction" | "confidence">;
};

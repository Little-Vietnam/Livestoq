export type Angle = "front" | "left" | "back" | "right" | "teeth";

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

export type MLAnalysisResult = {
  success: boolean;
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

// ── Scan Assessment (updated) ──────────────────────────────────────────

export type ScanAssessment = {
  id: string;
  createdAt: string; // ISO
  images: Record<Angle, string>; // object URLs or base64
  prediction: {
    species: "cow" | "goat" | "sheep" | "lamb";
    ageEligibility: "9" | "11" | "13";
    weightKg: number;
    gender: "male" | "female";
    healthRisk: "Low" | "Medium" | "High";
    healthRiskExplanation?: string; // Optional explanation for health risk
    fairPriceIdrRange: { min: number; max: number }; // e.g., 800000–900000
  };
  confidence: Confidence;
  // ML pipeline data (present when real ML analysis is used)
  mlAnalysis?: MLAnalysisResult;
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

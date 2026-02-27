import { NextRequest, NextResponse } from "next/server";

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

/**
 * POST /api/analyze
 *
 * Proxies to the ML backend's /analyze/full endpoint.
 * Accepts multipart form data with:
 *   - side_image (required)
 *   - teeth_image (optional)
 *   - breed (optional, default "generic")
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sideImage = formData.get("side_image") as File | null;
    const teethImage = formData.get("teeth_image") as File | null;
    const breed = (formData.get("breed") as string) || "generic";

    if (!sideImage) {
      return NextResponse.json(
        { error: "Side image is required" },
        { status: 400 }
      );
    }

    // Build form data for ML backend
    const mlFormData = new FormData();
    mlFormData.append("side_image", sideImage);
    mlFormData.append("breed", breed);

    if (teethImage) {
      mlFormData.append("teeth_image", teethImage);
    }

    const response = await fetch(`${ML_API_URL}/analyze/full`, {
      method: "POST",
      body: mlFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ML API Error]", response.status, errorText);
      return NextResponse.json(
        { error: `ML API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Analyze API Error]", error);
    return NextResponse.json(
      {
        error: "Failed to connect to ML service",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}

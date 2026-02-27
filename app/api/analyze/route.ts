import { NextRequest, NextResponse } from "next/server";

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const breed = (formData.get("breed") as string) || "generic";

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Forward to ML API
    const mlFormData = new FormData();
    mlFormData.append("image", image);
    mlFormData.append("breed", breed);

    const response = await fetch(`${ML_API_URL}/analyze`, {
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

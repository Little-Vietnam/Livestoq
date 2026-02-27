import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Stoqy AI, the official AI assistant for Livestoq — a platform that helps people buy, sell, and manage livestock with trust and transparency.

Your expertise covers:
- Livestock health, diseases, symptoms, and treatments
- Feeding schedules, nutrition, and supplements
- Livestock medicine and vaccination guidance
- Marketplace tips: buying, selling, pricing, and verifying listings
- General livestock management and husbandry best practices
- Breed information and characteristics
- Age estimation and weight assessment tips

Guidelines:
- Be friendly, helpful, and conversational.
- Keep answers concise but informative.
- When giving medical advice, always recommend consulting a veterinarian for serious issues.
- If asked about something outside livestock/agriculture topics, politely redirect to your area of expertise.
- Reference Livestoq features (scanning, verification, marketplace) when relevant.
- Use simple language accessible to farmers of all education levels.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-openai-api-key-here") {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("[Stoqy AI Error]", error);

    const isAuthError =
      error instanceof Error && error.message?.includes("401");
    if (isAuthError) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Please check your .env.local configuration." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to get response from Stoqy AI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

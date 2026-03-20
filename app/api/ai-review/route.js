import { NextResponse } from "next/server";

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured on server" },
      { status: 400 }
    );
  }

  try {
    const payload = await request.json();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system:
          "You are a senior Pakistan real estate sales strategist. Analyze the provided ARD City Sales Plan and produce an Executive Intelligence Brief in 3 labeled sections: STRENGTHS, GAPS, TOP 3 RECOMMENDATIONS. Be direct, expert, and Pakistan-market-specific.",
        messages: payload.messages || [{ role: "user", content: payload.content || "" }],
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "AI review failed" },
      { status: 500 }
    );
  }
}

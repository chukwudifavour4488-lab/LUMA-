import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const goal = typeof body?.goal === "string" ? body.goal.trim() : "";

    if (!goal) {
      return NextResponse.json({ error: "Please enter a goal." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI is not connected yet. Add OPENAI_API_KEY in Vercel." },
        { status: 503 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        input: [
          {
            role: "system",
            content:
              "You are LUMA, a practical goal coach. Turn the user's goal into exactly 3 small, realistic missions for the next few days. Return JSON only.",
          },
          { role: "user", content: goal },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "luma_plan",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                missions: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["title", "description"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["summary", "missions"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LUMA AI error:", errorText);
      return NextResponse.json({ error: "The AI planner could not create a plan." }, { status: 502 });
    }

    const data = await response.json();
    const outputText = data?.output?.flatMap((item: any) => item?.content ?? [])
      ?.find((item: any) => item?.type === "output_text")?.text;

    if (!outputText) {
      return NextResponse.json({ error: "The AI returned an empty plan." }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(outputText));
  } catch (error) {
    console.error("LUMA AI planner error:", error);
    return NextResponse.json({ error: "Unable to create the plan right now." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
    const authorization = request.headers.get("authorization") || "";

    if (!goal) {
      return NextResponse.json({ error: "Please enter a goal." }, { status: 400 });
    }
    if (!authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI is not connected yet. Add OPENAI_API_KEY in Vercel." }, { status: 503 });
    }
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "LUMA database is not configured." }, { status: 503 });
    }

    const token = authorization.slice("Bearer ".length);
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        input: [
          { role: "system", content: "You are LUMA, a practical goal coach. Turn the user's goal into exactly 3 small, realistic missions for the next few days. Return JSON only." },
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
                  type: "array", minItems: 3, maxItems: 3,
                  items: {
                    type: "object",
                    properties: { title: { type: "string" }, description: { type: "string" } },
                    required: ["title", "description"], additionalProperties: false,
                  },
                },
              },
              required: ["summary", "missions"], additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      console.error("LUMA AI error:", await response.text());
      return NextResponse.json({ error: "The AI planner could not create a plan." }, { status: 502 });
    }

    const data = await response.json();
    const outputText = data?.output?.flatMap((item: any) => item?.content ?? [])
      ?.find((item: any) => item?.type === "output_text")?.text;
    if (!outputText) return NextResponse.json({ error: "The AI returned an empty plan." }, { status: 502 });

    const plan = JSON.parse(outputText);
    const { data: savedGoal, error: goalError } = await supabase
      .from("goals")
      .insert({ user_id: user.id, title: goal, description: plan.summary, status: "active" })
      .select("id,title,description,status")
      .single();
    if (goalError || !savedGoal) {
      console.error("LUMA goal save error:", goalError);
      return NextResponse.json({ error: "The plan was created but could not be saved." }, { status: 500 });
    }

    const missionRows = plan.missions.map((mission: { title: string; description: string }) => ({
      goal_id: savedGoal.id,
      title: mission.title,
      description: mission.description,
      status: "pending",
    }));
    const { data: savedMissions, error: missionsError } = await supabase
      .from("missions")
      .insert(missionRows)
      .select("id,title,description,status");

    if (missionsError) {
      console.error("LUMA missions save error:", missionsError);
      await supabase.from("goals").delete().eq("id", savedGoal.id);
      return NextResponse.json({ error: "The goal could not be saved with its missions." }, { status: 500 });
    }

    return NextResponse.json({ ...plan, goal: savedGoal, missions: savedMissions || [] });
  } catch (error) {
    console.error("LUMA AI planner error:", error);
    return NextResponse.json({ error: "Unable to create the plan right now." }, { status: 500 });
  }
}

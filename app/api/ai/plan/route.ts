import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function buildPlan(goal: string) {
  return {
    summary: `A practical first path for: ${goal}`,
    missions: [
      { title: "Define the first outcome", description: `Write what success for “${goal}” looks like in one clear sentence.` },
      { title: "Take the smallest useful step", description: `Spend 20 focused minutes doing the easiest real action that moves “${goal}” forward.` },
      { title: "Create proof of progress", description: `Save or record what you completed, then choose the next action for tomorrow.` },
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const goal = typeof body?.goal === "string" ? body.goal.trim() : "";
    const authorization = request.headers.get("authorization") || "";

    if (!goal) return NextResponse.json({ error: "Please enter a goal." }, { status: 400 });
    if (!authorization.startsWith("Bearer ")) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "LUMA database is not configured. Add the Supabase URL and publishable key in Vercel." }, { status: 503 });
    }

    const token = authorization.slice("Bearer ".length);
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authorization } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }

    const plan = buildPlan(goal);

    const { data: savedGoal, error: goalError } = await supabase
      .from("goals")
      .insert({ user_id: user.id, title: goal, description: plan.summary, status: "active" })
      .select("id,title,description,status")
      .single();

    if (goalError || !savedGoal) {
      console.error("LUMA goal save error:", goalError);
      return NextResponse.json({ error: "The goal could not be saved." }, { status: 500 });
    }

    const missionRows = plan.missions.map((mission) => ({
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

    return NextResponse.json({
      ...plan,
      goal: savedGoal,
      missions: savedMissions || [],
      ai: false,
    });
  } catch (error) {
    console.error("LUMA planner error:", error);
    return NextResponse.json({ error: "Unable to create the plan right now." }, { status: 500 });
  }
}

"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

export default function ImpactPage() {
  const [stats, setStats] = useState({ goals: 0, missions: 0, completed: 0 });
  useEffect(() => {
    getSupabaseClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const supabase = getSupabaseClient();
      const { data: goals } = await supabase.from("goals").select("id,missions(id,status)").eq("user_id", data.user.id);
      const list = goals || []; const missions = list.flatMap((g: any) => g.missions || []);
      setStats({ goals: list.length, missions: missions.length, completed: missions.filter((m: any) => m.status === "completed").length });
    });
  }, []);
  const score = Math.min(999, 500 + stats.completed * 35);
  const pct = stats.missions ? Math.round(stats.completed / stats.missions * 100) : 0;
  return <main className="sectionView" style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px"}}>
    <span className="eyebrow">LUMA · IMPACT</span>
    <h1 style={{fontSize:"clamp(44px,7vw,76px)",letterSpacing:"-.055em",lineHeight:.95}}>Your intention<br/><em>became action.</em></h1>
    <p style={{maxWidth:650,color:"#756e66",lineHeight:1.6}}>LUMA measures the part that matters: the real actions you completed, not the time you spent scrolling.</p>
    <div className="goalCards" style={{marginTop:28}}>
      <article className="panel"><span className="eyebrow">IMPACT SCORE</span><h2 style={{fontSize:64,margin:"12px 0"}}>{score}</h2><p>Built from completed missions and consistent progress.</p></article>
      <article className="panel"><span className="eyebrow">MISSIONS</span><h2>{stats.completed} completed</h2><p>{stats.missions - stats.completed} still in motion · {pct}% completion rate.</p></article>
      <article className="panel"><span className="eyebrow">GOALS</span><h2>{stats.goals} active paths</h2><p>Every goal is a promise turned into smaller, useful actions.</p></article>
    </div>
    <footer><span>LUMA</span><span>Less scrolling. More becoming.</span></footer>
  </main>;
}

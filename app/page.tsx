"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabase";

type Mission = { id: string; title: string; description?: string | null; status: string };
type Goal = { id: string; title: string; description?: string | null; status: string; missions?: Mission[] };

export default function Home() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [missionsDone, setMissionsDone] = useState(0);
  const [totalMissions, setTotalMissions] = useState(0);
  const [userName, setUserName] = useState("Builder");
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setUserName(user.user_metadata?.display_name || user.email?.split("@")[0] || "Builder");
      const { data, error: dbError } = await supabase.from("goals").select("id,title,description,status,missions(id,title,description,status)").eq("user_id", user.id).order("created_at", { ascending: false });
      if (dbError) throw dbError;
      const list = (data || []) as Goal[];
      setGoals(list);
      const all = list.flatMap(g => g.missions || []);
      setTotalMissions(all.length);
      setMissionsDone(all.filter(m => m.status === "completed").length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your LUMA data.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function buildPath() {
    if (!goal.trim() || planning) return;
    setPlanning(true); setError("");
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Please sign in again.");
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ goal: goal.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI planning failed.");
      setGoal("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI planning failed.");
    } finally { setPlanning(false); }
  }

  async function toggleMission(mission: Mission) {
    const supabase = getSupabaseClient();
    const next = mission.status === "completed" ? "pending" : "completed";
    const { error: updateError } = await supabase.from("missions").update({ status: next, completed_at: next === "completed" ? new Date().toISOString() : null }).eq("id", mission.id);
    if (updateError) setError(updateError.message); else await load();
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">L</span><span>LUMA</span></div><p className="tagline">Make today matter.</p>
        <nav>{[["Today","⌂"],["Goals","◎"],["Missions","✓"],["Circles","◌"],["Mentors","✦"],["Opportunities","↗"],["Portfolio","▣"],["Impact","◒"]].map(([label,icon],i)=><div className={`navItem ${i===0?"active":""}`} key={label}><span>{icon}</span>{label}</div>)}</nav>
        <div className="proCard"><div className="miniLabel">LUMA PRO</div><strong>Turn intentions into momentum.</strong><button>Explore Pro →</button></div>
      </aside>
      <section className="content">
        <header className="topbar"><div className="mobileBrand">LUMA</div><div className="search">⌕ <span>Ask LUMA anything...</span></div><div className="topActions"><span>◔</span><span>◉</span><div className="avatar">{userName.slice(0,1).toUpperCase()}</div></div></header>
        <div className="hero"><div><div className="eyebrow">YOUR DAY · {new Date().toLocaleDateString(undefined,{weekday:"long"}).toUpperCase()}</div><h1>Make today<br/><em>matter.</em></h1><p>Hi {userName}. LUMA turns what you care about into one clear next step.</p></div><div className="score"><span>IMPACT SCORE</span><strong>{Math.min(999,500 + missionsDone*35)}</strong><small>↑ {missionsDone} completed</small></div></div>
        <section className="coach"><div className="coachOrb">✦</div><div className="coachText"><span>LUMA INTELLIGENCE</span><strong>{loading ? "Loading your plan…" : totalMissions ? "Your next best action, not another feed." : "Start with one goal worth making real."}</strong><p>{totalMissions ? `You have ${Math.max(totalMissions-missionsDone,0)} missions left. Keep your momentum going.` : "Create your first goal and LUMA will turn it into a practical path."}</p></div><button className="primary" onClick={()=>document.querySelector<HTMLInputElement>(".goalInput input")?.focus()}>Start focus →</button></section>
        <section className="grid">
          <div className="panel missions"><div className="panelHead"><div><span className="eyebrow">TODAY</span><h2>Your missions</h2></div><span className="count">{missionsDone}/{totalMissions}</span></div>
            {goals.flatMap(g=>g.missions||[]).slice(0,5).map(m=><button className={`mission ${m.status === "completed" ? "done" : ""}`} key={m.id} onClick={()=>toggleMission(m)}><span className="check">{m.status === "completed" ? "✓" : ""}</span><span><strong>{m.title}</strong><small>{m.description || "LUMA mission"}</small></span></button>)}
            {!loading && totalMissions===0 && <p className="muted">No missions yet. Create a goal on the right.</p>}
          </div>
          <div className="panel goalPanel"><div className="eyebrow">AI GOAL PLANNER</div><h2>What are you trying to make real?</h2><p>Tell LUMA the goal. It will turn it into a practical path.</p><div className="goalInput"><input value={goal} onChange={e=>setGoal(e.target.value)} onKeyDown={e=>{if(e.key === "Enter") buildPath()}} placeholder="e.g. Launch my first app"/><button onClick={buildPath} disabled={planning}>{planning ? "Building…" : "Build my path"}</button></div>{error&&<div className="planReady">⚠ {error}</div>}</div>
        </section>
        <section className="lower"><div className="panel progressPanel"><div className="panelHead"><div><span className="eyebrow">PROGRESS</span><h2>Your momentum</h2></div><span className="muted">Live</span></div><div className="chart">{[32,48,42,66,58,82,74].map((h,i)=><div className="barWrap" key={i}><div className="bar" style={{height:`${h}%`}}></div><small>{["M","T","W","T","F","S","S"][i]}</small></div>)}</div></div><div className="panel loopPanel"><span className="eyebrow">THE LUMA LOOP</span><h2>Goal → Action → Proof → Growth</h2><p>Every completed mission becomes evidence of progress you can build on.</p><div className="loop">{["Goal","Action","Proof","Growth"].map((x,i)=><div key={x}><span>{i+1}</span>{x}</div>)}</div></div></section>
        <footer><span>LUMA</span><span>Less scrolling. More becoming.</span></footer>
      </section>
    </main>
  );
}

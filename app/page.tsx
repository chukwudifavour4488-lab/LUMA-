"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../lib/supabase";

type Mission = { id: string; title: string; description?: string | null; status: string };
type Goal = { id: string; title: string; description?: string | null; status: string; missions?: Mission[] };
type Section = "Today" | "Goals" | "Missions" | "Circles" | "Mentors" | "Opportunities" | "Portfolio" | "Impact";

const navItems: [Section, string][] = [["Today", "⌂"], ["Goals", "◎"], ["Missions", "✓"], ["Circles", "◌"], ["Mentors", "✦"], ["Opportunities", "↗"], ["Portfolio", "▣"], ["Impact", "◒"]];

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
  const [section, setSection] = useState<Section>("Today");
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);

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
      const res = await fetch("/api/ai/plan", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ goal: goal.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI planning failed.");
      setGoal("");
      setSection("Missions");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "AI planning failed."); }
    finally { setPlanning(false); }
  }

  async function toggleMission(mission: Mission) {
    const supabase = getSupabaseClient();
    const next = mission.status === "completed" ? "pending" : "completed";
    const { error: updateError } = await supabase.from("missions").update({ status: next, completed_at: next === "completed" ? new Date().toISOString() : null }).eq("id", mission.id);
    if (updateError) setError(updateError.message); else await load();
  }

  async function signOut() {
    await getSupabaseClient().auth.signOut();
    router.replace("/login");
  }

  const allMissions = useMemo(() => goals.flatMap(g => (g.missions || []).map(m => ({ ...m, goalTitle: g.title }))), [goals]);
  const filteredGoals = goals.filter(g => !search.trim() || `${g.title} ${g.description || ""}`.toLowerCase().includes(search.toLowerCase()));
  const filteredMissions = allMissions.filter(m => !search.trim() || `${m.title} ${m.description || ""} ${m.goalTitle}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">L</span><span>LUMA</span></div><p className="tagline">Make today matter.</p>
        <nav>{navItems.map(([label, icon]) => <button className={`navItem ${section === label ? "active" : ""}`} key={label} onClick={() => { setSection(label); setSearch(""); }}><span>{icon}</span>{label}</button>)}</nav>
        <div className="proCard"><div className="miniLabel">LUMA PRO</div><strong>Turn intentions into momentum.</strong><button onClick={() => setSection("Impact")}>Explore Pro →</button></div>
      </aside>
      <section className="content">
        <header className="topbar"><div className="mobileBrand">LUMA</div><div className="search">⌕ <input aria-label="Search LUMA" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ask LUMA anything..." /></div><div className="topActions"><button aria-label="Focus on goals" onClick={() => { setSection("Goals"); document.querySelector<HTMLInputElement>(".goalInput input")?.focus(); }}>◔</button><button aria-label="Notifications" onClick={() => setError("You're all caught up — no new notifications.")}>◉</button><button className="avatar" aria-label="Open profile" onClick={() => setShowProfile(v => !v)}>{userName.slice(0,1).toUpperCase()}</button></div>{showProfile && <div className="profileMenu"><strong>{userName}</strong><span>Builder mode</span><button onClick={signOut}>Sign out</button></div>}</header>

        {section === "Today" && <>
          <div className="hero"><div><div className="eyebrow">YOUR DAY · {new Date().toLocaleDateString(undefined,{weekday:"long"}).toUpperCase()}</div><h1>Make today<br/><em>matter.</em></h1><p>Hi {userName}. LUMA turns what you care about into one clear next step.</p></div><div className="score"><span>IMPACT SCORE</span><strong>{Math.min(999,500 + missionsDone*35)}</strong><small>↑ {missionsDone} completed</small></div></div>
          <section className="coach"><div className="coachOrb">✦</div><div className="coachText"><span>LUMA INTELLIGENCE</span><strong>{loading ? "Loading your plan…" : totalMissions ? "Your next best action, not another feed." : "Start with one goal worth making real."}</strong><p>{totalMissions ? `You have ${Math.max(totalMissions-missionsDone,0)} missions left. Keep your momentum going.` : "Create your first goal and LUMA will turn it into a practical path."}</p></div><button className="primary" onClick={() => document.querySelector<HTMLInputElement>(".goalInput input")?.focus()}>Start focus →</button></section>
          <section className="grid"><div className="panel missions"><div className="panelHead"><div><span className="eyebrow">TODAY</span><h2>Your missions</h2></div><span className="count">{missionsDone}/{totalMissions}</span></div>{allMissions.slice(0,5).map(m => <button className={`mission ${m.status === "completed" ? "done" : ""}`} key={m.id} onClick={() => toggleMission(m)}><span className="check">{m.status === "completed" ? "✓" : ""}</span><span><strong>{m.title}</strong><small>{m.description || "LUMA mission"}</small></span></button>)}{!loading && totalMissions===0 && <p className="muted">No missions yet. Create a goal on the right.</p>}</div>
            <div className="panel goalPanel"><div className="eyebrow">AI GOAL PLANNER</div><h2>What are you trying to make real?</h2><p>Tell LUMA the goal. It will turn it into a practical path.</p><div className="goalInput"><input value={goal} onChange={e=>setGoal(e.target.value)} onKeyDown={e=>{if(e.key === "Enter") buildPath()}} placeholder="e.g. Launch my first app"/><button onClick={buildPath} disabled={planning}>{planning ? "Building…" : "Build my path"}</button></div>{error&&<div className="planReady">⚠ {error}</div>}</div></section>
        </>}

        {section === "Goals" && <section className="sectionView"><div className="sectionTitle"><div><span className="eyebrow">YOUR GOALS</span><h1>What you're making real.</h1></div><button className="primary" onClick={() => document.querySelector<HTMLInputElement>(".goalInput input")?.focus()}>New goal →</button></div><div className="goalCards">{filteredGoals.map(g => <article className="panel" key={g.id}><span className="eyebrow">{g.status.toUpperCase()}</span><h2>{g.title}</h2><p>{g.description || "A goal worth turning into action."}</p><span className="muted">{(g.missions || []).filter(m=>m.status === "completed").length}/{(g.missions || []).length} missions complete</span></article>)}{!filteredGoals.length && <div className="panel"><h2>No goals found</h2><p className="muted">Create a goal from the Today page to start your LUMA path.</p></div>}</div></section>}

        {section === "Missions" && <section className="sectionView"><div className="sectionTitle"><div><span className="eyebrow">YOUR MISSIONS</span><h1>Small actions. Real momentum.</h1></div><span className="count">{missionsDone}/{totalMissions} complete</span></div><div className="panel missionList">{filteredMissions.map(m => <button className={`mission ${m.status === "completed" ? "done" : ""}`} key={m.id} onClick={() => toggleMission(m)}><span className="check">{m.status === "completed" ? "✓" : ""}</span><span><strong>{m.title}</strong><small>{m.description || m.goalTitle}</small></span></button>)}{!filteredMissions.length && <p className="muted">No missions yet. Build a goal to generate your first path.</p>}</div></section>}

        {section !== "Today" && section !== "Goals" && section !== "Missions" && <section className="sectionView"><div className="sectionTitle"><div><span className="eyebrow">LUMA · {section.toUpperCase()}</span><h1>{section === "Impact" ? "Your progress has a story." : `${section} are coming to life.`}</h1></div></div><div className="panel featurePanel"><div className="featureIcon">✦</div><h2>{section === "Impact" ? `${missionsDone} actions completed` : `Build your ${section.toLowerCase()} layer.`}</h2><p>{section === "Impact" ? "Every completed mission is evidence that your intention became action. Keep going — your impact compounds." : `This space is ready for the next part of the LUMA experience: meaningful ${section.toLowerCase()}, connected to your goals instead of another endless feed.`}</p><button className="primary" onClick={() => setSection("Today")}>Back to Today →</button></div></section>}

        {error && section !== "Today" && <div className="planReady globalError">⚠ {error}</div>}
        <footer><span>LUMA</span><span>Less scrolling. More becoming.</span></footer>
      </section>
    </main>
  );
}

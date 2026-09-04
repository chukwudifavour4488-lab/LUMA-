"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mission = { id: string; title: string; description: string; status: "pending" | "completed" };
type Goal = { id: string; title: string; description: string; createdAt: string; missions: Mission[] };
type Section = "Today" | "Goals" | "Missions" | "Circles" | "Mentors" | "Opportunities" | "Portfolio" | "Impact";

const navItems: [Section, string][] = [["Today", "⌂"], ["Goals", "◎"], ["Missions", "✓"], ["Circles", "◌"], ["Mentors", "✦"], ["Opportunities", "↗"], ["Portfolio", "▣"], ["Impact", "◒"]];
const routes: Partial<Record<Section, string>> = { Circles: "/circles", Mentors: "/mentors", Opportunities: "/opportunities", Portfolio: "/portfolio", Impact: "/impact" };
const STORAGE_KEY = "luma-simple-state";

function makePlan(title: string): Mission[] {
  const safe = title.trim();
  const id = Date.now();
  return [
    { id: `${id}-1`, title: "Define the first outcome", description: `Write what success for “${safe}” looks like in one clear sentence.`, status: "pending" },
    { id: `${id}-2`, title: "Take the smallest useful step", description: `Spend 20 focused minutes doing one real action that moves “${safe}” forward.`, status: "pending" },
    { id: `${id}-3`, title: "Create proof of progress", description: `Save what you completed and choose the next action for tomorrow.`, status: "pending" },
  ];
}

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState("Builder");
  const [goal, setGoal] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [section, setSection] = useState<Section>("Today");
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.userName) setUserName(saved.userName);
      if (Array.isArray(saved?.goals)) setGoals(saved.goals);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify({ userName, goals }));
  }, [goals, userName, ready]);

  const allMissions = useMemo(() => goals.flatMap((g) => g.missions.map((m) => ({ ...m, goalTitle: g.title }))), [goals]);
  const completed = allMissions.filter((m) => m.status === "completed").length;
  const filteredGoals = goals.filter((g) => !search.trim() || `${g.title} ${g.description}`.toLowerCase().includes(search.toLowerCase()));
  const filteredMissions = allMissions.filter((m) => !search.trim() || `${m.title} ${m.description} ${m.goalTitle}`.toLowerCase().includes(search.toLowerCase()));

  function buildPath() {
    const title = goal.trim();
    if (!title) return;
    const newGoal: Goal = { id: `${Date.now()}`, title, description: `A practical LUMA path for ${title}.`, createdAt: new Date().toISOString(), missions: makePlan(title) };
    setGoals((current) => [newGoal, ...current]);
    setGoal("");
    setSection("Missions");
    setMessage("Your path is ready — start with the first mission.");
  }

  function toggleMission(id: string) {
    setGoals((current) => current.map((g) => ({ ...g, missions: g.missions.map((m) => m.id === id ? { ...m, status: m.status === "completed" ? "pending" : "completed" } : m) })));
  }

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY);
    setGoals([]);
    setUserName("Builder");
    setMessage("LUMA is reset. Start with one goal.");
  }

  const go = (label: Section) => {
    setSearch("");
    if (routes[label]) { router.push(routes[label]!); return; }
    setSection(label);
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">L</span><span>LUMA</span></div>
        <p className="tagline">Make today matter.</p>
        <nav>{navItems.map(([label, icon]) => <button className={`navItem ${section === label ? "active" : ""}`} key={label} onClick={() => go(label)}><span>{icon}</span>{label}</button>)}</nav>
        <div className="proCard"><div className="miniLabel">LUMA PRO</div><strong>Turn intentions into momentum.</strong><button onClick={() => router.push("/pro")}>Explore Pro →</button></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div className="mobileBrand">LUMA</div>
          <div className="search">⌕ <input aria-label="Search LUMA" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your LUMA..." /></div>
          <div className="topActions">
            <button aria-label="Focus" onClick={() => { setSection("Today"); setTimeout(() => document.querySelector<HTMLInputElement>(".goalInput input")?.focus(), 50); }}>◔</button>
            <button aria-label="Notifications" onClick={() => setMessage("You're all caught up — keep making progress.")}>◉</button>
            <button className="avatar" aria-label="Profile" onClick={() => setShowProfile((v) => !v)}>{userName.slice(0, 1).toUpperCase()}</button>
          </div>
          {showProfile && <div className="profileMenu"><strong>{userName}</strong><span>Builder mode · saved on this device</span><button onClick={resetDemo}>Reset LUMA</button></div>}
        </header>

        {section === "Today" && <>
          <div className="hero">
            <div><div className="eyebrow">YOUR DAY · {new Date().toLocaleDateString(undefined, { weekday: "long" }).toUpperCase()}</div><h1>Make today<br /><em>matter.</em></h1><p>Hi {userName}. LUMA turns what you care about into one clear next step.</p></div>
            <div className="score"><span>IMPACT SCORE</span><strong>{Math.min(999, 500 + completed * 35)}</strong><small>↑ {completed} completed</small></div>
          </div>

          <section className="coach"><div className="coachOrb">✦</div><div className="coachText"><span>LUMA INTELLIGENCE</span><strong>{goals.length ? "Your next best action, not another feed." : "Start with one goal worth making real."}</strong><p>{goals.length ? `${Math.max(allMissions.length - completed, 0)} missions left. Keep your momentum going.` : "Create your first goal and LUMA will turn it into a practical path."}</p></div><button className="primary" onClick={() => document.querySelector<HTMLInputElement>(".goalInput input")?.focus()}>Start focus →</button></section>

          <section className="grid">
            <div className="panel missions"><div className="panelHead"><div><span className="eyebrow">TODAY</span><h2>Your missions</h2></div><span className="count">{completed}/{allMissions.length}</span></div>{allMissions.slice(0, 5).map((m) => <button className={`mission ${m.status === "completed" ? "done" : ""}`} key={m.id} onClick={() => toggleMission(m.id)}><span className="check">{m.status === "completed" ? "✓" : ""}</span><span><strong>{m.title}</strong><small>{m.description}</small></span></button>)}{!allMissions.length && <p className="muted">No missions yet. Create a goal on the right.</p>}</div>
            <div className="panel goalPanel"><div className="eyebrow">LUMA GOAL PLANNER</div><h2>What are you trying to make real?</h2><p>No account, database or AI key needed. Your goals stay on this device.</p><div className="goalInput"><input value={goal} onChange={(e) => setGoal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") buildPath(); }} placeholder="e.g. Launch my first app"/><button onClick={buildPath}>Build my path</button></div></div>
          </section>

          <section className="panel loopPanel"><div><span className="eyebrow">THE LUMA LOOP</span><h2>Goal → Action → Proof → Growth</h2><p>Every completed mission becomes evidence of progress you can build on.</p></div><div className="loopSteps"><span><b>1</b>Goal</span><span><b>2</b>Action</span><span><b>3</b>Proof</span><span><b>4</b>Growth</span></div></section>
        </>}

        {section === "Goals" && <section className="sectionView"><div className="sectionTitle"><div><span className="eyebrow">YOUR GOALS</span><h1>What you're making real.</h1></div><button className="primary" onClick={() => { setSection("Today"); setTimeout(() => document.querySelector<HTMLInputElement>(".goalInput input")?.focus(), 50); }}>New goal →</button></div><div className="goalCards">{filteredGoals.map((g) => <article className="panel" key={g.id}><span className="eyebrow">ACTIVE PATH</span><h2>{g.title}</h2><p>{g.description}</p><span className="muted">{g.missions.filter((m) => m.status === "completed").length}/{g.missions.length} missions complete</span></article>)}{!filteredGoals.length && <div className="panel"><h2>No goals yet</h2><p className="muted">Create your first goal from Today.</p></div>}</div></section>}

        {section === "Missions" && <section className="sectionView"><div className="sectionTitle"><div><span className="eyebrow">YOUR MISSIONS</span><h1>Small actions. Real momentum.</h1></div><span className="count">{completed}/{allMissions.length} complete</span></div><div className="panel missionList">{filteredMissions.map((m) => <button className={`mission ${m.status === "completed" ? "done" : ""}`} key={m.id} onClick={() => toggleMission(m.id)}><span className="check">{m.status === "completed" ? "✓" : ""}</span><span><strong>{m.title}</strong><small>{m.description} · {m.goalTitle}</small></span></button>)}{!filteredMissions.length && <p className="muted">Build a goal to generate your first path.</p>}</div></section>}

        {message && <div className="planReady globalError">✓ {message}</div>}
        <footer><span>LUMA</span><span>Less scrolling. More becoming.</span></footer>
      </section>
    </main>
  );
}

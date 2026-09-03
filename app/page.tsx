"use client";

import { useState } from "react";

const missions = [
  { title: "Define your next milestone", meta: "10 min · Planning", done: true },
  { title: "Work on your highest-impact task", meta: "25 min · Focus", done: false },
  { title: "Share one progress update", meta: "5 min · Accountability", done: false },
];

export default function Home() {
  const [goal, setGoal] = useState("");
  const [missionsDone, setMissionsDone] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">L</span><span>LUMA</span></div>
        <p className="tagline">Make today matter.</p>
        <nav>
          {[["Today","⌂"],["Goals","◎"],["Missions","✓"],["Circles","◌"],["Mentors","✦"],["Opportunities","↗"],["Portfolio","▣"],["Impact","◒"]].map(([label,icon],i)=><div className={`navItem ${i===0?"active":""}`} key={label}><span>{icon}</span>{label}</div>)}
        </nav>
        <div className="proCard"><div className="miniLabel">LUMA PRO</div><strong>Turn intentions into momentum.</strong><button>Explore Pro →</button></div>
      </aside>

      <section className="content">
        <header className="topbar"><div className="mobileBrand">LUMA</div><div className="search">⌕ <span>Ask LUMA anything...</span></div><div className="topActions"><span>◔</span><span>◉</span><div className="avatar">B</div></div></header>

        <div className="hero">
          <div><div className="eyebrow">YOUR DAY · WEDNESDAY</div><h1>Make today<br/><em>matter.</em></h1><p>LUMA turns what you care about into one clear next step.</p></div>
          <div className="score"><span>IMPACT SCORE</span><strong>742</strong><small>↑ 18 this week</small></div>
        </div>

        <section className="coach">
          <div className="coachOrb">✦</div><div className="coachText"><span>LUMA INTELLIGENCE</span><strong>Your next best action, not another feed.</strong><p>You have 3 missions today. Start with 25 minutes of focused work.</p></div><button className="primary">Start focus →</button>
        </section>

        <section className="grid">
          <div className="panel missions"><div className="panelHead"><div><span className="eyebrow">TODAY</span><h2>Your missions</h2></div><span className="count">{missionsDone}/3</span></div>
            {missions.map((m,i)=><button className={`mission ${i<missionsDone?"done":""}`} key={m.title} onClick={()=>i>=missionsDone&&setMissionsDone(i+1)}><span className="check">{i<missionsDone?"✓":""}</span><span><strong>{m.title}</strong><small>{m.meta}</small></span></button>)}
          </div>
          <div className="panel goalPanel"><div className="eyebrow">AI GOAL PLANNER</div><h2>What are you trying to make real?</h2><p>Tell LUMA the goal. It will turn it into a practical path.</p><div className="goalInput"><input value={goal} onChange={e=>setGoal(e.target.value)} placeholder="e.g. Launch my first app"/><button onClick={()=>setSubmitted(true)}>Build my path</button></div>{submitted&&<div className="planReady">✦ Your first 3 missions are ready. <b>View plan →</b></div>}</div>
        </section>

        <section className="lower"><div className="panel progressPanel"><div className="panelHead"><div><span className="eyebrow">PROGRESS</span><h2>Your momentum</h2></div><span className="muted">This week</span></div><div className="chart">{[32,48,42,66,58,82,74].map((h,i)=><div className="barWrap" key={i}><div className="bar" style={{height:`${h}%`}}></div><small>{["M","T","W","T","F","S","S"][i]}</small></div>)}</div></div><div className="panel loopPanel"><span className="eyebrow">THE LUMA LOOP</span><h2>Goal → Action → Proof → Growth</h2><p>Every completed mission becomes evidence of progress you can build on.</p><div className="loop">{["Goal","Action","Proof","Growth"].map((x,i)=><div key={x}><span>{i+1}</span>{x}</div>)}</div></div></section>

        <footer><span>LUMA</span><span>Less scrolling. More becoming.</span></footer>
      </section>
    </main>
  );
}

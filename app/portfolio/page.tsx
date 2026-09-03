"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

type Goal = { id: string; title: string; description?: string | null; status: string; missions?: { id: string; status: string }[] };

export default function PortfolioPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  useEffect(() => {
    getSupabaseClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: rows } = await getSupabaseClient().from("goals").select("id,title,description,status,missions(id,status)").eq("user_id", data.user.id).order("created_at", { ascending: false });
      setGoals((rows || []) as Goal[]);
    });
  }, []);
  return <main className="sectionView" style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px"}}>
    <span className="eyebrow">LUMA · PORTFOLIO</span>
    <h1 style={{fontSize:"clamp(44px,7vw,76px)",letterSpacing:"-.055em",lineHeight:.95}}>Make your progress<br/><em>visible.</em></h1>
    <p style={{maxWidth:650,color:"#756e66",lineHeight:1.6}}>Your completed goals become a living record of what you actually made, learned and shipped.</p>
    <div className="goalCards" style={{marginTop:28}}>{goals.map(g => {
      const total = g.missions?.length || 0; const done = g.missions?.filter(m => m.status === "completed").length || 0; const pct = total ? Math.round(done / total * 100) : 0;
      return <article className="panel" key={g.id}><span className="eyebrow">{g.status.toUpperCase()}</span><h2>{g.title}</h2><p>{g.description || "A LUMA goal turned into measurable progress."}</p><div style={{margin:"18px 0 8px",height:8,borderRadius:99,background:"#e7e1d8",overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:"#171717"}} /></div><p className="muted">{done}/{total} missions complete · {pct}% progress</p><span className="muted">{g.status === "completed" ? "✓ Verified completion" : "In progress — keep building the proof."}</span></article>;
    })}{!goals.length && <article className="panel"><h2>Your portfolio starts with your first goal.</h2><p className="muted">Complete missions and LUMA will turn the journey into visible proof.</p></article>}</div>
    <footer><span>LUMA</span><span>Progress is proof.</span></footer>
  </main>;
}

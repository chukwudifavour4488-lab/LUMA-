"use client";

import { useState } from "react";
import { circles } from "../data/luma";

export default function CirclesPage() {
  const [joined, setJoined] = useState<string[]>([]);
  return <main className="sectionView" style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px"}}><span className="eyebrow">LUMA · CIRCLES</span><h1 style={{fontSize:"clamp(44px,7vw,76px)",letterSpacing:"-.055em",lineHeight:.95}}>Find people<br/><em>moving too.</em></h1><p style={{maxWidth:600,color:"#756e66",lineHeight:1.6}}>Small communities built around real goals — not endless feeds.</p><div className="goalCards" style={{marginTop:28}}>{circles.map(c=><article className="panel" key={c.name}><span className="eyebrow">{c.tag}</span><h2>{c.name}</h2><p>{c.description}</p><p className="muted">{c.members} members · {c.progress}% weekly momentum</p><button className="primary" onClick={()=>setJoined(v=>v.includes(c.name)?v.filter(x=>x!==c.name):[...v,c.name])}>{joined.includes(c.name)?"Joined ✓":"Join circle →"}</button></article>)}</div><footer><span>LUMA</span><span>Goals feel lighter together.</span></footer></main>;
}

"use client";

import { mentors } from "../data/luma";
import { useState } from "react";

export default function MentorsPage(){const [requested,setRequested]=useState<string[]>([]);return <main className="sectionView" style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px"}}><span className="eyebrow">LUMA · MENTORS</span><h1 style={{fontSize:"clamp(44px,7vw,76px)",letterSpacing:"-.055em",lineHeight:.95}}>Get unstuck<br/><em>with guidance.</em></h1><p style={{maxWidth:600,color:"#756e66",lineHeight:1.6}}>Connect your goal to people who can help you take the next useful step.</p><div className="goalCards" style={{marginTop:28}}>{mentors.map(m=><article className="panel" key={m.name}><span className="eyebrow">MENTOR</span><h2>{m.name}</h2><p>{m.focus}</p><p className="muted">Availability: {m.availability}</p><button className="primary" onClick={()=>setRequested(v=>v.includes(m.name)?v.filter(x=>x!==m.name):[...v,m.name])}>{requested.includes(m.name)?"Request sent ✓":"Request guidance →"}</button></article>)}</div><footer><span>LUMA</span><span>Progress gets easier with the right person.</span></footer></main>}

"use client";

import { opportunities } from "../data/luma";
import { useState } from "react";

export default function OpportunitiesPage(){const [saved,setSaved]=useState<string[]>([]);return <main className="sectionView" style={{maxWidth:1100,margin:"0 auto",padding:"70px 24px"}}><span className="eyebrow">LUMA · OPPORTUNITIES</span><h1 style={{fontSize:"clamp(44px,7vw,76px)",letterSpacing:"-.055em",lineHeight:.95}}>Your next<br/><em>opening.</em></h1><p style={{maxWidth:600,color:"#756e66",lineHeight:1.6}}>Useful opportunities matched to what you are actually trying to accomplish.</p><div className="goalCards" style={{marginTop:28}}>{opportunities.map(o=><article className="panel" key={o.title}><span className="eyebrow">{o.type}</span><h2>{o.title}</h2><p className="muted">{o.fit}% fit for your current direction</p><button className="primary" onClick={()=>setSaved(v=>v.includes(o.title)?v.filter(x=>x!==o.title):[...v,o.title])}>{saved.includes(o.title)?"Saved ✓":`${o.action} →`}</button></article>)}</div><footer><span>LUMA</span><span>Opportunity follows intention.</span></footer></main>}

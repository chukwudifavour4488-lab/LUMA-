"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "luma-simple-state";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  function enter(e: FormEvent) {
    e.preventDefault();
    const displayName = name.trim() || "Builder";
    let saved: { goals?: unknown[] } = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, userName: displayName }));
    router.replace("/");
  }

  return (
    <main className="authPage">
      <div className="authCard">
        <div className="brand"><span className="brandMark">L</span><span>LUMA</span></div>
        <span className="eyebrow">WELCOME</span>
        <h1>Make today matter.</h1>
        <p className="authIntro">Enter your name and start turning one important goal into real progress.</p>
        <form onSubmit={enter}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" autoFocus />
          <button className="authButton">Enter LUMA →</button>
        </form>
        <p className="muted" style={{ marginTop: 18 }}>Simple mode · no password · no database required.</p>
      </div>
    </main>
  );
}

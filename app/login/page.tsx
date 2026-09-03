"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const supabase = getSupabaseClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  }

  return (
    <main className="authPage">
      <div className="authCard">
        <div className="brand"><span className="brandMark">L</span><span>LUMA</span></div>
        <span className="eyebrow">{mode === "login" ? "WELCOME BACK" : "START YOUR JOURNEY"}</span>
        <h1>{mode === "login" ? "Make today matter." : "Turn your goal into momentum."}</h1>
        <p className="authIntro">LUMA helps you turn important goals into practical actions and measurable progress.</p>
        <form onSubmit={submit}>
          {mode === "signup" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required />}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" minLength={6} required />
          {error && <div className="authError">{error}</div>}
          <button className="authButton" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in →" : "Create my LUMA account →"}</button>
        </form>
        <button className="switchAuth" onClick={()=>{setMode(mode === "login" ? "signup" : "login");setError("")}}>
          {mode === "login" ? "New to LUMA? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}

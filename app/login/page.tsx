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
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setNotice("");
    try {
      const supabase = getSupabaseClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim() } } });
        if (error) throw error;
        if (data.session) router.replace("/");
        else setNotice("Account created. Check your email to confirm your account, then sign in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        if (!data.session) throw new Error("Sign in did not create a session. Please try again.");
        router.replace("/");
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
          {mode === "signup" && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" required />}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" autoComplete="email" required />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required />
          {error && <div className="authError">{error}</div>}
          {notice && <div className="planReady">✓ {notice}</div>}
          <button className="authButton" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in →" : "Create my LUMA account →"}</button>
        </form>
        <button className="switchAuth" onClick={()=>{setMode(mode === "login" ? "signup" : "login");setError("");setNotice("")}}>
          {mode === "login" ? "New to LUMA? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}

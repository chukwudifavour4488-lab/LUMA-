"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "../../lib/supabase";

export default function ProPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Checking LUMA Pro…");
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function setup() {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const key = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
      if (!key) {
        if (mounted) { setConfigured(false); setStatus("RevenueCat checkout is ready to connect."); }
        return;
      }
      try {
        const { Purchases } = await import("@revenuecat/purchases-js");
        Purchases.configure({ apiKey: key, appUserId: user.id });
        const customer = await Purchases.getSharedInstance().getCustomerInfo();
        const active = Object.keys(customer.entitlements.active || {}).some((id) => id.toLowerCase() === "pro");
        if (mounted) { setConfigured(true); setStatus(active ? "LUMA Pro is active." : "Choose Pro to unlock your momentum layer."); }
      } catch (error) {
        console.error("RevenueCat setup error", error);
        if (mounted) setStatus("RevenueCat is connected in code, but the web offering needs configuration.");
      }
    }
    setup();
    return () => { mounted = false; };
  }, [router]);

  async function startPurchase() {
    setBusy(true);
    try {
      const key = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
      if (!key) { setStatus("Add NEXT_PUBLIC_REVENUECAT_WEB_API_KEY in Vercel to enable checkout."); return; }
      const { Purchases } = await import("@revenuecat/purchases-js");
      const purchases = Purchases.getSharedInstance();
      const offerings = await purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];
      if (!pkg) { setStatus("No Pro package is configured yet. Create a RevenueCat offering and product, then try again."); return; }
      const result = await purchases.purchase({ rcPackage: pkg });
      const active = Object.keys(result.customerInfo.entitlements.active || {}).some((id) => id.toLowerCase() === "pro");
      setStatus(active ? "Welcome to LUMA Pro — your premium path is unlocked." : "Purchase completed. Finish the Pro entitlement setup in RevenueCat.");
    } catch (error) {
      console.error("RevenueCat purchase error", error);
      setStatus("Checkout was not completed. You can try again.");
    } finally { setBusy(false); }
  }

  return (
    <main className="sectionView" style={{ maxWidth: 1000, margin: "0 auto", padding: "70px 24px" }}>
      <span className="eyebrow">LUMA · PRO</span>
      <h1 style={{ fontSize: "clamp(48px,8vw,88px)", letterSpacing: "-.06em", lineHeight: .94 }}>Turn intentions<br/><em>into momentum.</em></h1>
      <p style={{ maxWidth: 680, color: "#756e66", lineHeight: 1.7 }}>LUMA Pro gives serious builders a deeper coaching layer: smarter paths, richer progress history, priority opportunities and a focused accountability experience.</p>
      <div className="goalCards" style={{ marginTop: 30 }}>
        {[["01","Deeper paths","More structured goal plans and next-best actions."],["02","Progress history","See the evidence behind your momentum."],["03","Priority opportunities","Surface challenges that match where you're going."]].map(([n,t,d]) => <article className="panel" key={n}><span className="eyebrow">{n}</span><h2>{t}</h2><p>{d}</p></article>)}
      </div>
      <div className="panel" style={{ marginTop: 24, textAlign: "center", padding: 32 }}>
        <div className="eyebrow">REVENUECAT</div>
        <h2 style={{ margin: "10px 0" }}>{status}</h2>
        <p className="muted">RevenueCat handles the purchase and the <strong>pro</strong> entitlement unlock.</p>
        <button className="primary" onClick={startPurchase} disabled={busy || !configured}>{busy ? "Opening checkout…" : "Unlock LUMA Pro →"}</button>
        <button onClick={() => router.push("/")} style={{ display:"block", margin:"14px auto 0", background:"none", border:0, textDecoration:"underline", cursor:"pointer" }}>Back to LUMA</button>
      </div>
      <footer><span>LUMA</span><span>Less scrolling. More becoming.</span></footer>
    </main>
  );
}

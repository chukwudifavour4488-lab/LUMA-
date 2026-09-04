"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Loading LUMA Pro…");
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function setup() {
      const key = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
      if (!key) {
        if (mounted) setStatus("LUMA Pro demo mode — add the RevenueCat Web public key to enable checkout.");
        return;
      }
      try {
        const { Purchases } = await import("@revenuecat/purchases-js");
        let appUserId = localStorage.getItem("luma-rc-user");
        if (!appUserId) { appUserId = Purchases.generateRevenueCatAnonymousAppUserId(); localStorage.setItem("luma-rc-user", appUserId); }
        Purchases.configure({ apiKey: key, appUserId });
        if (mounted) { setConfigured(true); setStatus("Choose Pro to unlock your momentum layer."); }
        try {
          const customer = await Purchases.getSharedInstance().getCustomerInfo();
          const active = Object.keys(customer.entitlements.active || {}).some((id) => id.toLowerCase() === "pro");
          if (mounted && active) setStatus("LUMA Pro is active.");
        } catch {}
      } catch (error) {
        console.error("RevenueCat setup error", error);
        if (mounted) setStatus("RevenueCat is connected in code, but the web offering needs configuration.");
      }
    }
    setup();
    return () => { mounted = false; };
  }, []);

  async function startPurchase() {
    setBusy(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-js");
      const offerings = await Purchases.getSharedInstance().getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];
      if (!pkg) { setStatus("No Pro package is configured yet. Check the RevenueCat offering."); return; }
      const result = await Purchases.getSharedInstance().purchase({ rcPackage: pkg });
      const active = Object.keys(result.customerInfo.entitlements.active || {}).some((id) => id.toLowerCase() === "pro");
      setStatus(active ? "Welcome to LUMA Pro — unlocked." : "Purchase completed. Check the Pro entitlement in RevenueCat.");
    } catch (error) {
      console.error("RevenueCat purchase error", error);
      setStatus("Checkout was not completed. You can try again.");
    } finally { setBusy(false); }
  }

  return (
    <main className="sectionView" style={{ maxWidth: 1000, margin: "0 auto", padding: "70px 24px" }}>
      <span className="eyebrow">LUMA · PRO</span>
      <h1 style={{ fontSize: "clamp(48px,8vw,88px)", letterSpacing: "-.06em", lineHeight: .94 }}>Turn intentions<br/><em>into momentum.</em></h1>
      <p style={{ maxWidth: 680, color: "#756e66", lineHeight: 1.7 }}>LUMA Pro gives serious builders a deeper coaching layer: richer progress history, priority opportunities and a focused accountability experience.</p>
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

# LUMA

**Make today matter.**

LUMA is an AI-powered progress companion that turns everyday goals into practical missions, accountability, proof of progress, and real-world growth.

## Stack
- Next.js + TypeScript
- Supabase (Auth, Postgres, Storage)
- LUMA Intelligence planner with a safe fallback
- RevenueCat Web SDK (LUMA Pro)
- Vercel (deployment)

## Core loop
**Goal → AI plan → Mission → Proof → Growth**

## RevenueCat setup
The LUMA Pro page uses `@revenuecat/purchases-js` with the authenticated Supabase user ID as the RevenueCat App User ID. Configure a RevenueCat Web Billing public API key in Vercel as `NEXT_PUBLIC_REVENUECAT_WEB_API_KEY`, then configure a Pro entitlement and an offering/package in RevenueCat. The app reads the active `pro` entitlement after purchase.

## Run locally
```bash
npm install
npm run dev
```

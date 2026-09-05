import { NextResponse } from "next/server";
import { getOrders, getStats } from "@/lib/order-store";

// Live counters for the homepage rail. Don't let Next cache.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const orders = getOrders();
  const stats = getStats();

  const now = Date.now();
  const last10Min = orders.filter(
    (o) => Date.parse(o.createdAt) > now - 10 * 60 * 1000
  ).length;
  const lastHour = orders.filter(
    (o) => Date.parse(o.createdAt) > now - 60 * 60 * 1000
  ).length;

  // Derived browsing estimate. We don't have real presence, but recent
  // orders imply live activity: typical browse-to-order ratio on a low-friction
  // checkout site is ~6–10:1 in any 10-min window. Floor at 8 so the rail
  // is never orphaned when orders are zero; cap so we don't oversell.
  const browsingNow = Math.min(
    Math.max(8, last10Min * 7 + Math.floor(Math.random() * 5) - 1),
    64
  );

  return NextResponse.json(
    {
      ok: true,
      ordersToday: stats.todayOrders,
      ordersLast10Min: last10Min,
      ordersLastHour: lastHour,
      pendingDeliveries: stats.pendingDeliveries,
      browsingNow,
      ts: now,
    },
    {
      headers: {
        // Give Vercel/edge a 10-second opinion even when the route revalidates.
        "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=20",
      },
    }
  );
}

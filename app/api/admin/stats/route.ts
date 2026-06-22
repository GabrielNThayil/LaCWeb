import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getStats } from "@/lib/order-store";

// GET /api/admin/stats — dashboard stats
export async function GET() {
  const session = await getServerSession();
  const role = (session?.user as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const stats = getStats();
  return NextResponse.json(stats);
}
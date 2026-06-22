import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getOrders, getOrderById, updateOrder } from "@/lib/order-store";
import type { OrderStatus } from "@/lib/models";

// GET /api/admin/orders — list orders
export async function GET(request: Request) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") as OrderStatus | "all") ?? "all";
  const fulfillment = searchParams.get("fulfillment") ?? "all";
  const date = searchParams.get("date") ?? undefined;
  const confirmationId = searchParams.get("confirmationId") ?? undefined;

  // Single order lookup
  if (confirmationId) {
    const order = getOrderById(confirmationId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  }

  const orders = getOrders({ status, fulfillment: fulfillment as any, date });
  return NextResponse.json({ orders, total: orders.length });
}

// PATCH /api/admin/orders — update order status
export async function PATCH(request: Request) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { id, status, deliveryStatus, notes } = body;

  if (!id) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  const updated = updateOrder(id, { status, deliveryStatus, notes });

  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
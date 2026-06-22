// Order storage using JSON file persistence.
// Data lives in data/orders.json — survives serverless cold starts
// as long as the same instance handles the request.
// For production: swap for Vercel Postgres.

import fs from "fs";
import path from "path";
import type { AdminOrder, AdminStats, OrderStatus, DeliveryStatus } from "./models";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readOrders(): AdminOrder[] {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    const raw = fs.readFileSync(ORDERS_FILE, "utf8");
    return JSON.parse(raw) as AdminOrder[];
  } catch {
    return [];
  }
}

function writeOrders(orders: AdminOrder[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
}

export function saveOrder(order: Omit<AdminOrder, "id" | "createdAt" | "updatedAt">): AdminOrder {
  const now = new Date().toISOString();
  const newOrder: AdminOrder = {
    ...order,
    id: `ORD-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  const orders = readOrders();
  orders.unshift(newOrder); // newest first
  writeOrders(orders);
  return newOrder;
}

export function getOrders(filters?: {
  status?: OrderStatus | "all";
  fulfillment?: "delivery" | "pickup" | "all";
  date?: string; // YYYY-MM-DD
}): AdminOrder[] {
  let orders = readOrders();

  if (filters?.status && filters.status !== "all") {
    orders = orders.filter((o) => o.status === filters.status);
  }
  if (filters?.fulfillment && filters.fulfillment !== "all") {
    orders = orders.filter((o) => o.fulfillment === filters.fulfillment);
  }
  if (filters?.date) {
    orders = orders.filter((o) => o.createdAt.startsWith(filters.date));
  }

  return orders;
}

export function getOrderById(id: string): AdminOrder | undefined {
  return readOrders().find((o) => o.id === id || o.confirmationId === id);
}

export function updateOrder(
  id: string,
  updates: Partial<Pick<AdminOrder, "status" | "deliveryStatus" | "notes">>
): AdminOrder | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id || o.confirmationId === id);
  if (idx === -1) return null;

  orders[idx] = {
    ...orders[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeOrders(orders);
  return orders[idx];
}

export function getStats(): AdminStats {
  const orders = readOrders();
  const today = new Date().toISOString().slice(0, 10);

  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
  const activeStatus = ["new", "preparing", "out_for_delivery", "ready"];
  const pendingDeliveries = todayOrders.filter(
    (o) => o.fulfillment === "delivery" && activeStatus.includes(o.status)
  );

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.paymentAmount, 0);
  const totalOrders = readOrders().length;
  const avgOrderValue = totalOrders > 0
    ? readOrders().reduce((sum, o) => sum + o.paymentAmount, 0) / totalOrders
    : 0;

  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    pendingDeliveries: pendingDeliveries.length,
    avgOrderValue: Math.round(avgOrderValue),
  };
}
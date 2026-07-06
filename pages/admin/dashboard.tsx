"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBag,
  RefreshCw,
  Truck,
  Clock,
  Check,
  ChevronDown,
  ExternalLink,
  X,
  DollarSign,
  TrendingUp,
  AlertCircle,
  LogOut,
  Crown,
  User,
  Zap,
} from "lucide-react";

type OrderStatus = "new" | "preparing" | "out_for_delivery" | "ready" | "delivered" | "completed" | "cancelled";
type DeliveryStatus = "pending" | "assigned" | "picked_up" | "delivered";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface AdminOrder {
  id: string;
  confirmationId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  customerLandmark?: string;
  fulfillment: "delivery" | "pickup";
  timing: string;
  instructions?: string;
  items: OrderItem[];
  subtotal: number;
  packagingFee: number;
  deliveryFee: number;
  total: number;
  paymentAmount: number;
  status: OrderStatus;
  deliveryStatus?: DeliveryStatus;
  deliveryPartner?: string;
  trackingUrl?: string | null;
  borzoOrderId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  todayOrders: number;
  todayRevenue: number;
  pendingDeliveries: number;
  avgOrderValue: number;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  preparing: { label: "Preparing", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  out_for_delivery: { label: "Out for delivery", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  ready: { label: "Ready", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  completed: { label: "Completed", color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
  ready: "completed",
  delivered: "completed",
  completed: null,
  cancelled: null,
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats>({ todayOrders: 0, todayRevenue: 0, pendingDeliveries: 0, avgOrderValue: 0 });
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [filterFulfillment, setFilterFulfillment] = useState<"all" | "delivery" | "pickup">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterFulfillment !== "all") params.set("fulfillment", filterFulfillment);

      const [ordersRes, statsRes] = await Promise.all([
        fetch(`/api/admin/orders?${params}`),
        fetch(`/api/admin/stats`),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders ?? []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  }, [filterStatus, filterFulfillment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function updateStatus(order: AdminOrder, newStatus: OrderStatus) {
    setUpdating(order.id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Update failed", e);
    } finally {
      setUpdating(null);
    }
  }

  const filtered = orders;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-900 text-amber-100">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">La Couronne — Admin</h1>
              <p className="text-xs text-gray-500">
                {session?.user?.name ?? "Admin"} ·{" "}
                <span className="text-amber-700">{formatTime(lastRefresh.toISOString())}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Today's Orders"
            value={stats.todayOrders}
            icon={<ShoppingBag className="h-5 w-5 text-amber-600" />}
            color="border-amber-200 bg-amber-50"
          />
          <StatCard
            label="Today's Revenue"
            value={formatCurrency(stats.todayRevenue)}
            icon={<DollarSign className="h-5 w-5 text-green-600" />}
            color="border-green-200 bg-green-50"
          />
          <StatCard
            label="Pending Delivery"
            value={stats.pendingDeliveries}
            icon={<Truck className="h-5 w-5 text-purple-600" />}
            color="border-purple-200 bg-purple-50"
          />
          <StatCard
            label="Avg Order Value"
            value={formatCurrency(stats.avgOrderValue)}
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
            color="border-blue-200 bg-blue-50"
          />
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5">
            {(["all", "new", "preparing", "out_for_delivery", "delivered", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  filterStatus === s
                    ? "bg-amber-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s]?.label ?? s}
              </button>
            ))}
          </div>

          <select
            value={filterFulfillment}
            onChange={(e) => setFilterFulfillment(e.target.value as any)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">All types</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
          </select>

          {(filterStatus !== "all" || filterFulfillment !== "all") && (
            <button
              onClick={() => { setFilterStatus("all"); setFilterFulfillment("all"); }}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* ── Order Feed ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-semibold text-gray-600">No orders yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Orders will appear here after customers complete payment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const sc = STATUS_CONFIG[order.status];
              const isExpanded = expandedId === order.id;
              const nextStatus = NEXT_STATUS[order.status];
              const isUpdatingThis = updating === order.id;

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border bg-white shadow-sm transition ${sc.bg} border-opacity-60`}
                >
                  {/* Order header */}
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-gray-900">
                          {order.confirmationId}
                        </span>
                        <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold capitalize ${sc.color} ${sc.bg}`}>
                          {sc.label}
                        </span>
                        <span className={`rounded-lg border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold ${order.fulfillment === "delivery" ? "text-purple-700" : "text-teal-700"}`}>
                          {order.fulfillment === "delivery" ? (
                            <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Delivery</span>
                          ) : (
                            <span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> Pickup</span>
                          )}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{order.customerName}</span>
                        <a href={`tel:${order.customerPhone}`} className="hover:text-amber-700">
                          {order.customerPhone}
                        </a>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {order.timing}
                        </span>
                        <span className="hidden xs:inline">{formatDate(order.createdAt)} · {formatTime(order.createdAt)}</span>
                      </div>

                      {order.fulfillment === "delivery" && order.customerAddress && (
                        <p className="mt-1 text-sm text-gray-500">{order.customerAddress}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-display text-2xl font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="border-t border-gray-100 px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, i) => (
                        <span key={i} className="rounded-lg bg-white/80 border border-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                          {item.quantity}× {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-3">
                    {/* Advance status button */}
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order, nextStatus)}
                        disabled={isUpdatingThis}
                        className="flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-800 disabled:opacity-50"
                      >
                        {isUpdatingThis ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                        Mark as {STATUS_CONFIG[nextStatus]?.label}
                      </button>
                    )}

                    {/* Status badge update */}
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={async (e) => {
                          await updateStatus(order, e.target.value as OrderStatus);
                        }}
                        disabled={isUpdatingThis}
                        className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-9 py-2.5 text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:opacity-50 cursor-pointer"
                      >
                        {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                          <option key={value} value={value}>{cfg.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>

                    {/* Delivery tracking */}
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                      >
                        Track courier
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}

                    {/* Expand details */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100"
                    >
                      {isExpanded ? "Less" : "More"}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 space-y-3 text-sm">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <DetailRow label="Razorpay Payment ID" value={order.razorpayPaymentId ?? "—"} mono />
                        <DetailRow label="Razorpay Order ID" value={order.razorpayOrderId ?? "—"} mono />
                        <DetailRow label="Customer Address" value={order.customerAddress ?? "—"} />
                        <DetailRow label="Subtotal" value={formatCurrency(order.subtotal ?? 0)} />
                        <DetailRow label="Packaging" value={formatCurrency(order.packagingFee ?? 0)} />
                        <DetailRow label="Delivery Fee" value={formatCurrency(order.deliveryFee ?? 0)} />
                        {order.notes && <DetailRow label="Notes" value={order.notes} />}
                      </div>
                      <button
                        onClick={() => updateStatus(order, "cancelled")}
                        disabled={order.status === "completed" || order.status === "cancelled"}
                        className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Cancel order
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${color}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        {icon}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <span className={`text-gray-800 ${mono ? "font-mono text-xs" : "font-medium"} break-all`}>{value}</span>
    </div>
  );
}
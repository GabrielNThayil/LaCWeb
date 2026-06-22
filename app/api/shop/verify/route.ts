import crypto from "crypto";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { dispatchBorzoDelivery, isBorzoConfigured } from "../../../../lib/borzo";
import {
  validateDispatchPayload,
  type DispatchPayload
} from "../../../../lib/delivery-token";
import { saveOrder } from "../../../../lib/order-store";
import { orderMenu } from "../../../../lib/order-catalog";

const TEMP_DATA_DIR = path.join(process.cwd(), "data", "pending");

function ensureDir() {
  if (!fs.existsSync(TEMP_DATA_DIR)) {
    fs.mkdirSync(TEMP_DATA_DIR, { recursive: true });
  }
}

function readPendingOrder(orderId: string) {
  const file = path.join(TEMP_DATA_DIR, `${orderId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function deletePendingOrder(orderId: string) {
  const file = path.join(TEMP_DATA_DIR, `${orderId}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

// ─── Pre-save order data (called by shop/order before sending to client) ──────
export async function preSaveOrder(data: {
  razorpayOrderId: string;
  items: { id: string; quantity: number }[];
  fulfillment: "delivery" | "pickup";
  timing: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    landmark?: string;
    coordinates?: { latitude: number; longitude: number };
  };
  pricing: {
    subtotal: number;
    packaging: number;
    delivery: number;
    total: number;
  };
  instructions?: string;
}) {
  ensureDir();
  const file = path.join(TEMP_DATA_DIR, `${data.razorpayOrderId}.json`);
  fs.writeFileSync(file, JSON.stringify(data), "utf8");
}

// ─── Verify & Save (main POST handler) ───────────────────────────────────────
export async function POST(request: Request) {
  ensureDir();

  const body = await request.json();
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay verification secret is not configured." },
      { status: 500 }
    );
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    fulfillment,
    dispatchPayload,
    dispatchToken
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing payment verification details." },
      { status: 400 }
    );
  }

  // ── Verify signature ──────────────────────────────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 400 }
    );
  }

  // ── Read pending order data ───────────────────────────────────────────────
  const orderData = readPendingOrder(razorpay_order_id);
  deletePendingOrder(razorpay_order_id);

  if (!orderData) {
    return NextResponse.json(
      { error: "Order data not found. Please contact the cafe." },
      { status: 400 }
    );
  }

  // ── Resolve item details ─────────────────────────────────────────────────
  const resolvedItems = (orderData.items as { id: string; quantity: number }[]).map(
    (entry) => {
      const menuItem = orderMenu.find((m) => m.id === entry.id);
      return {
        name: menuItem?.name ?? entry.id,
        quantity: entry.quantity,
        price: menuItem?.price ?? 0,
      };
    }
  );

  // ── Delivery dispatch ─────────────────────────────────────────────────────
  let delivery:
    | {
        provider: string;
        automated: boolean;
        deliveryId?: string;
        status?: string;
        trackingUrl?: string | null;
        message: string;
      }
    | undefined;

  if (fulfillment === "delivery") {
    if (
      dispatchPayload &&
      dispatchToken &&
      validateDispatchPayload(dispatchPayload as DispatchPayload, dispatchToken)
    ) {
      if (isBorzoConfigured()) {
        try {
          const dispatched = await dispatchBorzoDelivery(dispatchPayload);
          delivery = {
            ...dispatched,
            automated: true,
            message: "Delivery partner assigned. Your order is on its way!"
          };
        } catch {
          delivery = {
            provider: "Borzo",
            automated: false,
            message: "Payment confirmed. The cafe will arrange your delivery."
          };
        }
      } else {
        delivery = {
          provider: "Borzo",
          automated: false,
          message: "Payment confirmed. The cafe will arrange your delivery."
        };
      }
    }
  }

  // ── Save to admin store ───────────────────────────────────────────────────
  const confirmationId = `LCF-${razorpay_payment_id.slice(-8).toUpperCase()}`;
  const adminOrderData = {
    confirmationId,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    customerName: orderData.customer.name,
    customerPhone: orderData.customer.phone,
    customerEmail: orderData.customer.email,
    customerAddress: orderData.customer.address,
    customerLandmark: orderData.customer.landmark,
    fulfillment: orderData.fulfillment,
    timing: orderData.timing,
    instructions: orderData.instructions,
    items: resolvedItems,
    subtotal: orderData.pricing.subtotal,
    packagingFee: orderData.pricing.packaging,
    deliveryFee: orderData.pricing.delivery,
    total: orderData.pricing.total,
    paymentAmount: orderData.pricing.total,
    status: "new" as const,
    deliveryStatus: fulfillment === "delivery" ? "pending" : undefined,
    deliveryPartner: delivery?.provider,
    trackingUrl: delivery?.trackingUrl,
    borzoOrderId: delivery?.deliveryId || null,
    notes: "",
  };

  let savedOrder;
  try {
    savedOrder = saveOrder(adminOrderData);
  } catch (e) {
    // Log internally — don't expose to client
    console.error("Order save failed");
    // Don't fail the payment — order is verified
  }

  // ── Return response ───────────────────────────────────────────────────────
  return NextResponse.json({
    verified: true,
    confirmationId,
    eta: fulfillment === "delivery" ? "35-45 minutes" : "20-25 minutes",
    stages: fulfillment === "delivery"
      ? ["Confirmed", "Being prepared", "Out for delivery", "Delivered"]
      : ["Confirmed", "Being prepared", "Ready for pickup"],
    delivery
  });
}
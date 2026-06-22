import { NextResponse } from "next/server";
import { calculateOrderTotal } from "../../../../lib/order-catalog";
import { isBorzoConfigured, quoteBorzoDelivery } from "../../../../lib/borzo";
import {
  signDispatchPayload,
  type DispatchPayload
} from "../../../../lib/delivery-token";
import { preSaveOrder } from "../verify/route";
import { rateLimitOrder } from "@/lib/rate-limit";

type Fulfillment = "delivery" | "pickup";

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  // ── Rate limit ───────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = rateLimitOrder(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many order requests. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  try {
    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const fulfillment: Fulfillment =
      body.fulfillment === "pickup" ? "pickup" : "delivery";

    if (!body.customer?.name || !body.customer?.phone) {
      return NextResponse.json(
        { error: "Name and phone number are required for ordering." },
        { status: 400 }
      );
    }

    if (fulfillment === "delivery" && !body.customer?.address) {
      return NextResponse.json(
        { error: "Delivery address is required." },
        { status: 400 }
      );
    }

    if (
      fulfillment === "delivery" &&
      (!body.customer?.coordinates?.latitude ||
        !body.customer?.coordinates?.longitude)
    ) {
      return NextResponse.json(
        { error: "Please share your delivery location pin for Borzo delivery." },
        { status: 400 }
      );
    }

    if (!body.timing || typeof body.timing !== "string") {
      return NextResponse.json(
        { error: "Please select an order time." },
        { status: 400 }
      );
    }

    let providerQuote:
      | { provider: string; fee: number; automated: boolean }
      | undefined;

    if (fulfillment === "delivery" && isBorzoConfigured()) {
      providerQuote = await quoteBorzoDelivery({
        customer: {
          name: body.customer.name,
          phone: body.customer.phone,
          address: body.customer.address,
          landmark: body.customer.landmark,
          coordinates: body.customer.coordinates
        },
        instructions: body.instructions,
        reference: "checkout"
      });
    }

    const pricing = calculateOrderTotal(
      body.items ?? [],
      fulfillment,
      providerQuote?.fee
    );
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId;

    if (!keyId || !keySecret || !publicKey) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured for online ordering." },
        { status: 500 }
      );
    }

    const receipt = `lc_food_${Date.now()}`;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const menuNote = pricing.lines
      .map((line) => `${line.name} x${line.quantity}`)
      .join(", ")
      .slice(0, 240);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: pricing.total * 100,
        currency: "INR",
        receipt,
        notes: {
          order_type: "cafe_order",
          fulfillment,
          customer: String(body.customer.name).slice(0, 80),
          phone: String(body.customer.phone).slice(0, 20),
          timing: String(body.timing).slice(0, 60),
          items: menuNote
        }
      })
    });
    const order = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: order.error?.description || "Payment order creation failed." },
        { status: response.status }
      );
    }

    // ── Pre-save order data so verify route can retrieve it ─────────────────
    await preSaveOrder({
      razorpayOrderId: order.id,
      items: body.items ?? [],
      fulfillment,
      timing: body.timing,
      customer: {
        name: body.customer.name,
        phone: body.customer.phone,
        email: body.customer.email,
        address: body.customer.address,
        landmark: body.customer.landmark,
        coordinates: body.customer.coordinates
      },
      pricing: {
        subtotal: pricing.subtotal,
        packaging: pricing.packaging,
        delivery: pricing.delivery,
        total: pricing.total
      },
      instructions: body.instructions
    });

    const dispatchPayload: DispatchPayload | null =
      fulfillment === "delivery"
        ? {
            fulfillment: "delivery",
            customer: {
              name: String(body.customer.name),
              phone: String(body.customer.phone),
              address: String(body.customer.address),
              landmark: body.customer.landmark
                ? String(body.customer.landmark)
                : undefined,
              coordinates: {
                latitude: Number(body.customer.coordinates.latitude),
                longitude: Number(body.customer.coordinates.longitude)
              }
            },
            instructions: body.instructions
              ? String(body.instructions).slice(0, 220)
              : undefined,
            reference: receipt
          }
        : null;

    return NextResponse.json({
      keyId: publicKey,
      orderId: order.id,
      amount: pricing.total * 100,
      receipt,
      pricing,
      fulfillment,
      delivery: {
        provider: providerQuote?.provider || "Borzo",
        automated: Boolean(providerQuote)
      },
      dispatchPayload,
      dispatchToken: dispatchPayload ? signDispatchPayload(dispatchPayload) : null
    });
  } catch (error) {
    // Log internally — don't expose error details to client
    console.error("Shop order error");
    return NextResponse.json(
      { error: "Unable to process your order. Please try again." },
      { status: 500 }
    );
  }
}
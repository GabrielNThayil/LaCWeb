import { NextResponse } from "next/server";
import { rateLimitOrder } from "@/lib/rate-limit";

const RENTAL_RATE = 3000;
const MAX_HOURS = 2;

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
      { error: "Too many booking requests. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const hours = Number(body.hours);

  if (!Number.isInteger(hours) || hours < 1 || hours > MAX_HOURS) {
    return NextResponse.json(
      { error: "Private space bookings are limited to 1 or 2 hours." },
      { status: 400 }
    );
  }

  const requiredFields = ["name", "phone", "date", "slot", "eventType"] as const;
  const missing = requiredFields.filter((f) => !body[f]?.toString().trim());
  if (missing.length) {
    return NextResponse.json(
      { error: "Please complete all booking details before checkout." },
      { status: 400 }
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId;

  if (!keyId || !keySecret || !publicKey) {
    return NextResponse.json(
      { error: "Payment is not configured. Contact the cafe." },
      { status: 500 }
    );
  }

  const amount = hours * RENTAL_RATE * 100;
  const receipt = `lc_space_${Date.now()}`;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt,
      notes: {
        name: String(body.name).slice(0, 80),
        phone: String(body.phone).slice(0, 20),
        date: String(body.date).slice(0, 20),
        slot: String(body.slot).slice(0, 10),
        hours: String(hours),
        eventType: String(body.eventType).slice(0, 40)
      }
    })
  });

  const order = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: "Payment order creation failed. Please try again." },
      { status: response.status }
    );
  }

  return NextResponse.json({
    keyId: publicKey,
    orderId: order.id,
    amount,
    receipt
  });
}

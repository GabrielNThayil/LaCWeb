import { NextResponse } from "next/server";

const RENTAL_RATE = 3000;
const MAX_HOURS = 2;

export async function POST(request: Request) {
  const body = await request.json();
  const hours = Number(body.hours);

  if (!Number.isInteger(hours) || hours < 1 || hours > MAX_HOURS) {
    return NextResponse.json(
      { error: "Private space bookings are limited to 1 or 2 hours." },
      { status: 400 }
    );
  }

  if (!body.name || !body.phone || !body.date || !body.slot || !body.eventType) {
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
      {
        error:
          "Razorpay keys are not configured. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID."
      },
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
        name: body.name,
        phone: body.phone,
        date: body.date,
        slot: body.slot,
        hours: String(hours),
        eventType: body.eventType
      }
    })
  });

  const order = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: order.error?.description || "Razorpay order creation failed." },
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

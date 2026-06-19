import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay verification secret is not configured." },
      { status: 500 }
    );
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing Razorpay payment verification fields." },
      { status: 400 }
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Payment signature verification failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    verified: true,
    confirmationId: `LC-${razorpay_payment_id.slice(-8).toUpperCase()}`
  });
}

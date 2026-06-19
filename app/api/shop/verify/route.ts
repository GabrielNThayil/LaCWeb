import crypto from "crypto";
import { NextResponse } from "next/server";
import { dispatchPorterDelivery, isPorterConfigured } from "../../../../lib/porter";
import {
  validateDispatchPayload,
  type DispatchPayload
} from "../../../../lib/delivery-token";

export async function POST(request: Request) {
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

  const isDelivery = fulfillment !== "pickup";
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

  if (isDelivery) {
    if (
      dispatchPayload &&
      dispatchToken &&
      validateDispatchPayload(dispatchPayload as DispatchPayload, dispatchToken)
    ) {
      if (isPorterConfigured()) {
        try {
          const dispatched = await dispatchPorterDelivery(dispatchPayload);
          delivery = {
            ...dispatched,
            automated: true,
            message: "Courier request placed successfully."
          };
        } catch {
          delivery = {
            provider: "Porter",
            automated: false,
            message:
              "Payment is confirmed. The cafe will arrange your courier and share an update."
          };
        }
      } else {
        delivery = {
          provider: "Porter",
          automated: false,
          message:
            "Payment is confirmed. The cafe will arrange your courier and share an update."
        };
      }
    } else {
      return NextResponse.json(
        { error: "Delivery request verification failed." },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({
    verified: true,
    confirmationId: `LCF-${razorpay_payment_id.slice(-8).toUpperCase()}`,
    eta: isDelivery ? "35-45 minutes" : "20-25 minutes",
    stages: isDelivery
      ? ["Confirmed", "Being prepared", "Out for delivery", "Delivered"]
      : ["Confirmed", "Being prepared", "Ready for pickup"],
    delivery
  });
}

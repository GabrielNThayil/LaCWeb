import crypto from "crypto";

export type DispatchPayload = {
  fulfillment: "delivery";
  customer: {
    name: string;
    phone: string;
    address: string;
    landmark?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  instructions?: string;
  reference: string;
};

function signatureSecret() {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("Payment signing secret is not configured.");
  }
  return secret;
}

export function signDispatchPayload(payload: DispatchPayload) {
  return crypto
    .createHmac("sha256", signatureSecret())
    .update(JSON.stringify(payload))
    .digest("hex");
}

export function validateDispatchPayload(payload: DispatchPayload, token: string) {
  const expected = signDispatchPayload(payload);
  const submitted = Buffer.from(token, "hex");
  const signed = Buffer.from(expected, "hex");
  return (
    submitted.length === signed.length && crypto.timingSafeEqual(submitted, signed)
  );
}

import { NextResponse } from "next/server";
import { isBorzoConfigured, quoteBorzoDelivery } from "../../../../lib/borzo";

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Minimal rate limit for quote endpoint
const quoteStore = new Map<string, { count: number; resetAt: number }>();
function checkQuoteLimit(ip: string) {
  const now = Date.now();
  const e = quoteStore.get(ip) ?? { count: 0, resetAt: now + 60_000 };
  if (e.resetAt < now) { e.count = 0; e.resetAt = now + 60_000; }
  e.count += 1;
  quoteStore.set(ip, e);
  if (e.count > 10) return { allowed: false, retry: Math.ceil((e.resetAt - now) / 1000) };
  return { allowed: true, retry: 0 };
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retry: retrySecs } = checkQuoteLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many delivery checks. Please wait." },
      { status: 429, headers: { "Retry-After": String(retrySecs) } }
    );
  }

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.address?.toString().trim() || !body.phone?.toString().trim() || !body.name?.toString().trim()) {
    return NextResponse.json(
      { error: "Name, phone, and delivery address are required." },
      { status: 400 }
    );
  }

  if (
    typeof body.coordinates?.latitude !== "number" ||
    typeof body.coordinates?.longitude !== "number" ||
    body.coordinates.latitude < -90 || body.coordinates.latitude > 90 ||
    body.coordinates.longitude < -180 || body.coordinates.longitude > 180
  ) {
    return NextResponse.json(
      { error: "Share a delivery location pin to check Borzo availability." },
      { status: 400 }
    );
  }

  if (!isBorzoConfigured()) {
    return NextResponse.json({
      configured: false,
      provider: "Borzo",
      message:
        "Borzo integration is being configured. Delivery will be coordinated by the cafe."
    });
  }

  try {
    const quote = await quoteBorzoDelivery({
      customer: {
        name: String(body.name).slice(0, 80),
        phone: String(body.phone).slice(0, 15),
        address: String(body.address).slice(0, 150),
        landmark: body.landmark ? String(body.landmark).slice(0, 50) : undefined,
        coordinates: {
          latitude: Number(body.coordinates.latitude),
          longitude: Number(body.coordinates.longitude)
        }
      },
      reference: "checkout-quote"
    });
    return NextResponse.json({ configured: true, ...quote });
  } catch (error) {
    return NextResponse.json(
      { error: "Delivery is unavailable for this location." },
      { status: 400 }
    );
  }
}
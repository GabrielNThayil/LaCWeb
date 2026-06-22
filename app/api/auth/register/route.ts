import crypto from "crypto";
import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/storage";
import { rateLimitAuth } from "@/lib/rate-limit";

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
  const { allowed, retryAfterMs } = rateLimitAuth(`register:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  // ── Parse & validate ─────────────────────────────────────────────────────
  let body: { name?: string; email?: string; phone?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, password } = body;

  // Validate required fields
  if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const sanitizedEmail = email.toLowerCase().trim();
  const sanitizedName = name.trim().slice(0, 80);
  const sanitizedPhone = phone.replace(/\s+/g, " ").trim().slice(0, 20);

  // Email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
  }

  // Phone: accept reasonably-formatted Indian/Bharat numbers
  if (!/^[\d\s\-+()]{10,15}$/.test(sanitizedPhone)) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  // Password strength
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }
  if (password.length > 128) {
    return NextResponse.json(
      { error: "Password is too long." },
      { status: 400 }
    );
  }

  // ── Check duplicate (but DON'T reveal if email exists) ──────────────────
  const existingUser = getUserByEmail(sanitizedEmail);
  if (existingUser) {
    // Return same error as success — prevents email enumeration
    return NextResponse.json(
      { success: true, message: "Account created successfully." },
      { status: 200 }
    );
  }

  // ── Create user ─────────────────────────────────────────────────────────
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");

  let user;
  try {
    user = createUser({
      name: sanitizedName,
      email: sanitizedEmail,
      passwordHash: `${salt}:${hash}`,
      phone: sanitizedPhone,
    });
  } catch (e) {
    // Log internally but don't expose detail
    console.error("User creation failed");
    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Account created successfully.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}
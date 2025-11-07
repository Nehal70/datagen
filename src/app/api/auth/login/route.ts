// Template route: Login a user
// Methods should authenticate user credentials against MongoDB, then issue JWTs.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
// Adjust these imports to match your project structure:
import { getDb } from "@/lib/mongodb"; // must resolve to a connected MongoClient.db()
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

// Helpers
const enc = new TextEncoder();
const ACCESS_SECRET = enc.encode(process.env.ACCESS_TOKEN_SECRET || "dev_access_secret_change_me");
const REFRESH_SECRET = enc.encode(process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret_change_me");

const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || "7d";

// Minimal validator
function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.length <= 254 && /\S+@\S+\.\S+/.test(email);
}
function isValidPassword(pw: unknown): pw is string {
  return typeof pw === "string" && pw.length >= 6 && pw.length <= 200;
}

async function signToken(
  payload: Record<string, unknown>,
  secret: Uint8Array,
  exp: string
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret);
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse & validate body
    const body = await request.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return NextResponse.json({ error: "Invalid email or password format." }, { status: 400 });
    }

    // Look up user by email
    const db = await getDb();
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      // Do not reveal whether email exists
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Verify password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Ensure tokenVersion exists (for refresh invalidation by rotation/logout)
    const tokenVersion = typeof user.tokenVersion === "number" ? user.tokenVersion : 0;

    // Generate tokens
    const sub = String(user._id);
    const accessToken = await signToken({ sub, tv: tokenVersion, type: "access" }, ACCESS_SECRET, ACCESS_TTL);
    const refreshToken = await signToken({ sub, tv: tokenVersion, type: "refresh" }, REFRESH_SECRET, REFRESH_TTL);

    // Set httpOnly cookie for refresh
    const res = NextResponse.json(
      {
        accessToken,
        // Return non-sensitive user metadata
        user: {
          id: sub,
          email: user.email,
          name: user.name ?? null,
        },
      },
      { status: 200 }
    );

    // Cookie options
    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      sameSite: "strict",
      secure: isProd,
      path: "/",
      // Max-Age ~7 days if REFRESH_TTL is "7d"; we’ll use 7d in seconds by default
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

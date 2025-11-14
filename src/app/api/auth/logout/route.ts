import { clearRefreshTokenCookie } from '@/lib/auth';
import { createSuccessResponse } from '@/lib/validation';

<<<<<<< Updated upstream
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const enc = new TextEncoder();
const REFRESH_SECRET = enc.encode(process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret_change_me");

export async function POST(request: Request): Promise<Response> {
  const cookieStore = cookies();
  const isProd = process.env.NODE_ENV === "production";

  // Try to read refresh token from cookie first
  let refreshToken = cookieStore.get("refresh_token")?.value;

  // Fallback: Authorization header Bearer <token>
  if (!refreshToken) {
    const auth = request.headers.get("authorization");
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      refreshToken = auth.slice(7).trim();
    }
  }

  let userId: string | null = null;

  if (refreshToken) {
    try {
      const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
      // Expecting payload.sub (user id) and payload.tv (tokenVersion)
      if (typeof payload.sub === "string") {
        userId = payload.sub;
      }
    } catch {
      // Invalid/expired refresh is fine; proceed to clear cookie anyway
      userId = null;
    }
  }

  // If we have a user, increment tokenVersion to invalidate all old refresh tokens
  if (userId) {
    try {
      const db = await getDb();
      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(userId) }, { $inc: { tokenVersion: 1 } }, { upsert: false });
    } catch (err) {
      // Do not fail logout if DB update fails; still clear cookies
      console.error("Logout: failed to bump tokenVersion", err);
    }
  }

  // Always clear the cookie (idempotent)
  const res = NextResponse.json({ success: true }, { status: 200 });
  res.cookies.set({
    name: "refresh_token",
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: isProd,
    path: "/",
    maxAge: 0, // expire immediately
  });

  return res;
=======
export async function POST(_request: Request): Promise<Response> {
  try {
    // Clear refresh token cookie
    await clearRefreshTokenCookie();

    return createSuccessResponse({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return createSuccessResponse({ message: 'Logged out successfully' });
  }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}

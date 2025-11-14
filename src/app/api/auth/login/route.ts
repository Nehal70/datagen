import bcrypt from 'bcrypt';
import { getCollection } from '@/lib/db';
import { signAccessToken, signRefreshToken, setRefreshTokenCookie } from '@/lib/auth';
import { loginSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { User } from '@/app/types';

<<<<<<< Updated upstream
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
=======
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const { email, password } = validationResult.data;

    // Look up user
    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return createErrorResponse('Invalid email or password', 401);
    }

    // Verify password
    if (!user.password) {
      return createErrorResponse('Invalid email or password', 401);
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return createErrorResponse('Invalid email or password', 401);
    }

    // Generate tokens
    const userId = user._id?.toString() || user.id;
    const accessToken = signAccessToken({
      sub: userId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      sub: userId,
      email: user.email,
      role: user.role,
    });

    // Set refresh token cookie
    await setRefreshTokenCookie(refreshToken);

    // Return user metadata (excluding password)
    const userResponse = {
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      accessToken,
    };

    return createSuccessResponse(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
>>>>>>> Stashed changes

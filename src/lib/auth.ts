import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string, isRefresh = false): JwtPayload {
  try {
    const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

export function getBearerTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function getTokenFromRequest(request: Request): Promise<string | null> {
  // Try Bearer token first
  const bearerToken = getBearerTokenFromRequest(request);
  if (bearerToken) {
    return bearerToken;
  }

  // Try cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('refreshToken')?.value || cookieStore.get('accessToken')?.value;
  return token || null;
}

export async function getAuthenticatedUser(request: Request): Promise<JwtPayload | null> {
  try {
    const token = await getTokenFromRequest(request);
    if (!token) {
      return null;
    }

    // Try as access token first
    try {
      return verifyToken(token, false);
    } catch {
      // If access token fails, try as refresh token
      return verifyToken(token, true);
    }
  } catch {
    return null;
  }
}

export async function setRefreshTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearRefreshTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('refreshToken');
}

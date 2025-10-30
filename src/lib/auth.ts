// Template JWT utilities (no implementation)
// Provide helpers for signing, verifying, and parsing JWTs with RS256/HS256.

export interface JwtPayload {
  // TODO: Add standard and custom claims (e.g., sub, exp, iat, role)
  [key: string]: unknown;
}

export function signAccessToken(_payload: JwtPayload): string {
  // TODO: Sign short-lived access token with secret/private key and standard claims
  return '';
}

export function signRefreshToken(_payload: JwtPayload): string {
  // TODO: Sign long-lived refresh token with rotation strategy
  return '';
}

export function verifyToken(_token: string): JwtPayload {
  // TODO: Verify token signature and expiration; throw on invalid tokens
  return {};
}

export function getBearerTokenFromRequest(_request: Request): string | null {
  // TODO: Extract Bearer token from Authorization header or cookie
  return null;
}



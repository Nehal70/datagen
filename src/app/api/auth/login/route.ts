// Template route: Login a user
// Methods should authenticate user credentials against MongoDB, then issue JWTs.

export async function POST(request: Request): Promise<Response> {
  // TODO: Parse and validate request body (email, password)
  // TODO: Look up user in MongoDB by email
  // TODO: Verify password
  // TODO: Generate access and refresh JWT tokens
  // TODO: Set httpOnly cookie for refresh token (if cookie-based) or return tokens in JSON
  // TODO: Return user metadata (excluding sensitive fields)
  return new Response(null);
}



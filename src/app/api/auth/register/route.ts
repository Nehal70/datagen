// Template route: Register a new user
// Methods exported here should validate input, create a user in MongoDB,
// hash password securely, and return JWT tokens.

export async function POST(request: Request): Promise<Response> {
  // TODO: Parse and validate request body (email, password, name)
  // TODO: Check for existing user in MongoDB
  // TODO: Hash password using a modern algorithm (e.g., bcrypt/argon2)
  // TODO: Create user document and persist to MongoDB
  // TODO: Generate access and refresh JWT tokens
  // TODO: Set httpOnly cookie for refresh token (if cookie-based) or return tokens in JSON
  // TODO: Return created user metadata (excluding sensitive fields)
  return new Response(null);
}



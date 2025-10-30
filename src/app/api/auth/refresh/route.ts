// Template route: Refresh access token using a refresh token
// Should verify refresh token, rotate if needed, and issue new access token.

export async function POST(request: Request): Promise<Response> {
  // TODO: Read refresh token (cookie or Authorization header/body)
  // TODO: Verify refresh token signature and claims
  // TODO: Optionally rotate refresh token and persist new token metadata
  // TODO: Issue new access token (short-lived)
  // TODO: Return new tokens
  return new Response(null);
}



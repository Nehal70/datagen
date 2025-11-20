import { clearRefreshTokenCookie } from '@/lib/auth';
import { createSuccessResponse } from '@/lib/validation';

export async function POST(_request: Request): Promise<Response> {
  try {
    // Clear refresh token cookie
    await clearRefreshTokenCookie();

    return createSuccessResponse({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return createSuccessResponse({ message: 'Logged out successfully' });
  }
}

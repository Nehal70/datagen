import { getCollection } from '@/lib/db';
import { verifyToken, signAccessToken, signRefreshToken, setRefreshTokenCookie, getTokenFromRequest } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { User } from '@/app/types';
import { ObjectId } from 'mongodb';

export async function POST(request: Request): Promise<Response> {
  try {
    const refreshToken = await getTokenFromRequest(request);

    if (!refreshToken) {
      return createErrorResponse('Refresh token required', 401);
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyToken(refreshToken, true);
    } catch (error) {
      return createErrorResponse('Invalid or expired refresh token', 401);
    }

    // Verify user still exists
    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({
      _id: new ObjectId(payload.sub),
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Generate new tokens
    const userId = user._id?.toString() || user.id;
    const newAccessToken = signAccessToken({
      sub: userId,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = signRefreshToken({
      sub: userId,
      email: user.email,
      role: user.role,
    });

    // Set new refresh token cookie
    await setRefreshTokenCookie(newRefreshToken);

    return createSuccessResponse({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

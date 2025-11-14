import { getCollection } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { User } from '@/app/types';
import { ObjectId } from 'mongodb';

export async function GET(request: Request): Promise<Response> {
  try {
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({
      _id: new ObjectId(payload.sub),
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Return user metadata (excluding password)
    const userResponse = {
      id: user._id?.toString() || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    return createSuccessResponse(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

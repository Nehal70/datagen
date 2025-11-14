import { getCollection } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { userUpdateSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { User } from '@/app/types';
import { ObjectId } from 'mongodb';

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
): Promise<Response> {
  try {
    const { userId } = await context.params;
    const payload = await getAuthenticatedUser(_request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Users can only view their own profile unless they're admin
    if (payload.sub !== userId && payload.role !== 'admin') {
      return createErrorResponse('Forbidden', 403);
    }

    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
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
      updatedAt: user.updatedAt,
    };

    return createSuccessResponse(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
): Promise<Response> {
  try {
    const { userId } = await context.params;
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Users can only update their own profile unless they're admin
    if (payload.sub !== userId && payload.role !== 'admin') {
      return createErrorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const validationResult = userUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const updates = validationResult.data;
    const usersCollection = await getCollection<User>('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!existingUser) {
      return createErrorResponse('User not found', 404);
    }

    // Check for email conflicts if email is being updated
    if (updates.email && updates.email !== existingUser.email) {
      const emailConflict = await usersCollection.findOne({
        email: updates.email.toLowerCase(),
      });
      if (emailConflict) {
        return createErrorResponse('Email already in use', 409);
      }
    }

    const updateData: Partial<User> = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email.toLowerCase();
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    const updatedUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!updatedUser) {
      return createErrorResponse('User not found', 404);
    }

    const userResponse = {
      id: updatedUser._id?.toString() || updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return createSuccessResponse(userResponse);
  } catch (error) {
    console.error('Update user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
): Promise<Response> {
  try {
    const { userId } = await context.params;
    const payload = await getAuthenticatedUser(_request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Only admin can delete users (or users can delete themselves)
    if (payload.sub !== userId && payload.role !== 'admin') {
      return createErrorResponse('Forbidden', 403);
    }

    const usersCollection = await getCollection<User>('users');
    const projectsCollection = await getCollection('projects');
    const imagesCollection = await getCollection('images');

    // Check if user exists
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Delete user's projects and images
    const userProjects = await projectsCollection.find({ ownerId: userId }).toArray();
    const projectIds = userProjects.map(p => p._id?.toString() || p.id);

    if (projectIds.length > 0) {
      await imagesCollection.deleteMany({ projectId: { $in: projectIds } });
      await projectsCollection.deleteMany({ ownerId: userId });
    }

    // Delete user
    await usersCollection.deleteOne({ _id: new ObjectId(userId) });

    return createSuccessResponse({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

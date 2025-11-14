import { getCollection } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { registerSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { User } from '@/app/types';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export async function GET(request: Request): Promise<Response> {
  try {
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Only admin can list users
    if (payload.role !== 'admin') {
      return createErrorResponse('Forbidden', 403);
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role');

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (roleFilter) {
      query.role = roleFilter;
    }

    const usersCollection = await getCollection<User>('users');

    // Get total count
    const total = await usersCollection.countDocuments(query);

    // Fetch users
    const users = await usersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format response (exclude passwords)
    const formattedUsers = users.map((user) => ({
      id: user._id?.toString() || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return createSuccessResponse({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Only admin can create users
    if (payload.role !== 'admin') {
      return createErrorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const { email, password, name } = validationResult.data;

    // Check for existing user
    const usersCollection = await getCollection<User>('users');
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return createErrorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const now = new Date();
    const user: Omit<User, 'id'> & { _id?: string } = {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role: 'user',
      createdAt: now,
      updatedAt: now,
    };

    const result = await usersCollection.insertOne(user);
    const userId = result.insertedId.toString();

    // Return user metadata (excluding password)
    const userResponse = {
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return createSuccessResponse(userResponse, 201);
  } catch (error) {
    console.error('Create user error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

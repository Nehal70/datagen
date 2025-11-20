import bcrypt from 'bcrypt';
import { getCollection } from '@/lib/db';
import { signAccessToken, signRefreshToken, setRefreshTokenCookie } from '@/lib/auth';
import { registerSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { User } from '@/app/types';
import { ObjectId } from 'mongodb';

export async function POST(request: Request): Promise<Response> {
  try {
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

    // Generate tokens
    const accessToken = signAccessToken({
      sub: userId,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      sub: userId,
      email: user.email,
      role: user.role,
    });

    // Set refresh token cookie
    await setRefreshTokenCookie(refreshToken);

    // Return user metadata (excluding password)
    const userResponse = {
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      accessToken,
    };

    return createSuccessResponse(userResponse, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

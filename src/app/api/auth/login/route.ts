import bcrypt from 'bcrypt';
import { getCollection } from '@/lib/db';
import { signAccessToken, signRefreshToken, setRefreshTokenCookie } from '@/lib/auth';
import { loginSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { User } from '@/app/types';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const { email, password } = validationResult.data;

    // Look up user
    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return createErrorResponse('Invalid email or password', 401);
    }

    // Verify password
    if (!user.password) {
      return createErrorResponse('Invalid email or password', 401);
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return createErrorResponse('Invalid email or password', 401);
    }

    // Generate tokens
    const userId = user._id?.toString() || user.id;
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

    return createSuccessResponse(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

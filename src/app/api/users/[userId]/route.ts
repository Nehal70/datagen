// Template routes: Single user resource (read, update, delete)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// import { authOptions } from '../../auth/[...nextauth]/route';

const authOptions = {} as any;


export async function GET(_request: Request, context: { params: { userId: string } }): Promise<Response> {
  try {
    // TODO: Authenticate and authorize (self or admin)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Load user by context.params.userId from MongoDB
    const userId = context.params.userId;
    
    // Mock user data - replace with actual MongoDB query
    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      avatar: null,
      bio: null,
      createdAt: new Date().toISOString()
    };

    // TODO: Return user data (omit sensitive fields)
    return NextResponse.json(mockUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: { params: { userId: string } }): Promise<Response> {
  try {
    // TODO: Authenticate and authorize (self or admin)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Validate updatable fields (e.g., name, email if allowed)
    const updates = await request.json();
    const allowedUpdates = ['name', 'email', 'avatar', 'bio', 'phone'];
    const updateKeys = Object.keys(updates);
    const isValidOperation = updateKeys.every(key => allowedUpdates.includes(key));
    
    if (!isValidOperation) {
      return NextResponse.json(
        { error: 'Invalid updates' },
        { status: 400 }
      );
    }

    // TODO: Update user in MongoDB
    const userId = context.params.userId;
    
    // Mock updated user - replace with actual MongoDB update
    const mockUpdatedUser = {
      id: userId,
      name: updates.name || 'Test User',
      email: updates.email || 'test@example.com',
      avatar: updates.avatar || null,
      bio: updates.bio || null,
      updatedAt: new Date().toISOString()
    };

    // TODO: Return updated user data
    return NextResponse.json(mockUpdatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: { userId: string } }): Promise<Response> {
  try {
    // TODO: Authenticate and authorize (admin-only or self-delete policy)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = context.params.userId;

    // TODO: Delete user and related data according to business rules
    console.log(`Deleting user ${userId} and related data...`);
    
    // Mock delete - replace with actual MongoDB delete
    const deleteSuccess = true; // Replace with actual delete operation

    if (!deleteSuccess) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Return success response
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
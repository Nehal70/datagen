// Template routes: Users collection (list and create)
// GET: List users with pagination and optional filters
// POST: Create a new user (admin use-case)
import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<Response> {
   // TODO: Authenticate and authorize (admin-only)
  // TODO: Parse query params for pagination/sorting/filtering
  // TODO: Query MongoDB for users
  // TODO: Return paginated list of users
  try {
    // TODO: Authenticate and authorize (admin-only)
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // TODO: Parse query params for pagination/sorting/filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // TODO: Query MongoDB for users
    // Mock data - replace with actual MongoDB query
    const mockUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        avatar: null
      },
      {
        id: '2', 
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date().toISOString(),
        avatar: null
      }
    ];

    // Mock pagination
    const totalUsers = 2; // Replace with actual count from MongoDB
    const totalPages = Math.ceil(totalUsers / limit);

    // TODO: Return paginated list of users
    return NextResponse.json({
      users: mockUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
   // TODO: Authenticate and authorize (admin-only)
  // TODO: Validate request body for new user
  // TODO: Hash password securely and create user in MongoDB
  // TODO: Return created user metadata
  try {
    // TODO: Authenticate and authorize (admin-only)
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // TODO: Validate request body for new user
    const userData = await request.json();
    
    const requiredFields = ['name', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (userData.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // TODO: Hash password securely and create user in MongoDB
    // const hashedPassword = await hashPassword(userData.password);
    
    // Mock user creation - replace with actual MongoDB insert
    const newUser = {
      id: '3', // Replace with actual MongoDB generated ID
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user',
      avatar: userData.avatar || null,
      bio: userData.bio || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Return created user metadata
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
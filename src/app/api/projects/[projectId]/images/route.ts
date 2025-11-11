// Template routes: Images collection within a project (list, create)
import { NextResponse } from 'next/server';

export async function GET(_request: Request, context: { params: { projectId: string } }): Promise<Response> {
  try {
    // TODO: Authenticate and authorize access to the project
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const projectId = context.params.projectId;

    // TODO: Parse query params (pagination, filters)
    const { searchParams } = new URL(_request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || ''; // Filter by image type
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // TODO: Load images for the given projectId from MongoDB
    // Mock images data - replace with actual MongoDB query
    const mockImages = [
      {
        id: 'img1',
        projectId: projectId,
        name: 'generated_image_001.png',
        type: 'synthetic',
        url: '/images/project1/img1.png',
        metadata: {
          width: 256,
          height: 256,
          format: 'png',
          size: 102400,
          labels: ['cat', 'animal']
        },
        status: 'processed',
        createdAt: new Date().toISOString(),
        createdBy: 'user1'
      },
      {
        id: 'img2',
        projectId: projectId,
        name: 'uploaded_photo_002.jpg',
        type: 'real',
        url: '/images/project1/img2.jpg',
        metadata: {
          width: 512,
          height: 512,
          format: 'jpg',
          size: 204800,
          labels: ['dog', 'animal']
        },
        status: 'processed',
        createdAt: new Date().toISOString(),
        createdBy: 'user1'
      }
    ];

    // Mock pagination
    const totalImages = 2; // Replace with actual count from MongoDB
    const totalPages = Math.ceil(totalImages / limit);

    // TODO: Return paginated list of images
    return NextResponse.json({
      images: mockImages,
      pagination: {
        page,
        limit,
        totalImages,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching project images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: { params: { projectId: string } }): Promise<Response> {
  try {
    // TODO: Authenticate and authorize write access to the project
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const projectId = context.params.projectId;

    // TODO: Validate request body (image metadata, storage location)
    const imageData = await request.json();
    
    const requiredFields = ['name', 'type', 'url'];
    const missingFields = requiredFields.filter(field => !imageData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate image type
    const allowedTypes = ['synthetic', 'real', 'augmented'];
    if (!allowedTypes.includes(imageData.type)) {
      return NextResponse.json(
        { error: `Invalid image type. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate metadata structure
    if (imageData.metadata) {
      const requiredMetadata = ['width', 'height', 'format', 'size'];
      const missingMetadata = requiredMetadata.filter(field => !imageData.metadata[field]);
      if (missingMetadata.length > 0) {
        return NextResponse.json(
          { error: `Missing required metadata: ${missingMetadata.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // TODO: Create image under projectId in MongoDB
    // Mock image creation - replace with actual MongoDB insert
    const newImage = {
      id: 'img3', // Replace with actual MongoDB generated ID
      projectId: projectId,
      name: imageData.name,
      type: imageData.type,
      url: imageData.url,
      metadata: imageData.metadata || {
        width: 256,
        height: 256,
        format: 'png',
        size: 102400
      },
      status: imageData.status || 'uploaded',
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id' // Replace with session.user.id
    };

    // TODO: Return created image
    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error('Error creating project image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { getCollection } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { imageSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { Project, ProjectImage } from '@/app/types';
import { ObjectId } from 'mongodb';

async function authorizeProjectAccess(
  projectId: string,
  userId: string,
  userRole?: string,
  requireWrite = false
): Promise<Project | null> {
  const projectsCollection = await getCollection<Project>('projects');
  const project = await projectsCollection.findOne({
    _id: new ObjectId(projectId),
  });

  if (!project) {
    return null;
  }

  // Admin can access any project
  if (userRole === 'admin') {
    return project;
  }

  // Owner can access their project
  if (project.ownerId === userId) {
    return project;
  }

  // Otherwise, no access
  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  try {
    const { projectId } = await context.params;
    const payload = await getAuthenticatedUser(_request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const project = await authorizeProjectAccess(projectId, payload.sub, payload.role);

    if (!project) {
      return createErrorResponse('Project not found or access denied', 404);
    }

    // Parse query params
    const { searchParams } = new URL(_request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const imagesCollection = await getCollection<ProjectImage>('images');

    // Get total count
    const total = await imagesCollection.countDocuments({ projectId });

    // Fetch images
    const images = await imagesCollection
      .find({ projectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format response
    const formattedImages = images.map((image) => ({
      id: image._id?.toString() || image.id,
      projectId: image.projectId,
      url: image.url,
      metadata: image.metadata,
      annotations: image.annotations,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    }));

    return createSuccessResponse({
      images: formattedImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get images error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  try {
    const { projectId } = await context.params;
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const project = await authorizeProjectAccess(projectId, payload.sub, payload.role, true);

    if (!project) {
      return createErrorResponse('Project not found or access denied', 404);
    }

    const body = await request.json();
    const validationResult = imageSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const { url, metadata } = validationResult.data;

    const imagesCollection = await getCollection<ProjectImage>('images');

    const now = new Date();
    const image: Omit<ProjectImage, 'id'> & { _id?: string } = {
      projectId,
      url,
      metadata: metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    const result = await imagesCollection.insertOne(image);
    const imageId = result.insertedId.toString();

    const imageResponse = {
      id: imageId,
      projectId: image.projectId,
      url: image.url,
      metadata: image.metadata,
      annotations: image.annotations,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };

    return createSuccessResponse(imageResponse, 201);
  } catch (error) {
    console.error('Create image error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

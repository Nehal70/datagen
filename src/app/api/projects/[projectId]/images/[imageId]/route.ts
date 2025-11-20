import { getCollection } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { imageUpdateSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
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
  context: { params: Promise<{ projectId: string; imageId: string }> }
): Promise<Response> {
  try {
    const { projectId, imageId } = await context.params;
    const payload = await getAuthenticatedUser(_request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const project = await authorizeProjectAccess(projectId, payload.sub, payload.role);

    if (!project) {
      return createErrorResponse('Project not found or access denied', 404);
    }

    const imagesCollection = await getCollection<ProjectImage>('images');
    const image = await imagesCollection.findOne({
      _id: new ObjectId(imageId),
      projectId,
    });

    if (!image) {
      return createErrorResponse('Image not found', 404);
    }

    const imageResponse = {
      id: image._id?.toString() || image.id,
      projectId: image.projectId,
      url: image.url,
      metadata: image.metadata,
      annotations: image.annotations,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };

    return createSuccessResponse(imageResponse);
  } catch (error) {
    console.error('Get image error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string; imageId: string }> }
): Promise<Response> {
  try {
    const { projectId, imageId } = await context.params;
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const project = await authorizeProjectAccess(projectId, payload.sub, payload.role, true);

    if (!project) {
      return createErrorResponse('Project not found or access denied', 404);
    }

    const body = await request.json();
    const validationResult = imageUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const updates = validationResult.data;
    const imagesCollection = await getCollection<ProjectImage>('images');

    // Verify image exists and belongs to project
    const existingImage = await imagesCollection.findOne({
      _id: new ObjectId(imageId),
      projectId,
    });

    if (!existingImage) {
      return createErrorResponse('Image not found', 404);
    }

    const updateData: Partial<ProjectImage> = {
      updatedAt: new Date(),
    };

    if (updates.url !== undefined) {
      updateData.url = updates.url;
    }
    if (updates.metadata !== undefined) {
      updateData.metadata = {
        ...existingImage.metadata,
        ...updates.metadata,
      };
    }
    if (updates.annotations !== undefined) {
      updateData.annotations = {
        ...existingImage.annotations,
        ...updates.annotations,
      };
    }

    await imagesCollection.updateOne(
      { _id: new ObjectId(imageId) },
      { $set: updateData }
    );

    const updatedImage = await imagesCollection.findOne({
      _id: new ObjectId(imageId),
    });

    if (!updatedImage) {
      return createErrorResponse('Image not found', 404);
    }

    const imageResponse = {
      id: updatedImage._id?.toString() || updatedImage.id,
      projectId: updatedImage.projectId,
      url: updatedImage.url,
      metadata: updatedImage.metadata,
      annotations: updatedImage.annotations,
      createdAt: updatedImage.createdAt,
      updatedAt: updatedImage.updatedAt,
    };

    return createSuccessResponse(imageResponse);
  } catch (error) {
    console.error('Update image error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string; imageId: string }> }
): Promise<Response> {
  try {
    const { projectId, imageId } = await context.params;
    const payload = await getAuthenticatedUser(_request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const project = await authorizeProjectAccess(projectId, payload.sub, payload.role, true);

    if (!project) {
      return createErrorResponse('Project not found or access denied', 404);
    }

    const imagesCollection = await getCollection<ProjectImage>('images');

    // Verify image exists and belongs to project
    const image = await imagesCollection.findOne({
      _id: new ObjectId(imageId),
      projectId,
    });

    if (!image) {
      return createErrorResponse('Image not found', 404);
    }

    // Delete image
    await imagesCollection.deleteOne({ _id: new ObjectId(imageId) });

    return createSuccessResponse({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

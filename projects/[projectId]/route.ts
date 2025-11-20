import { getCollection } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { projectUpdateSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { Project } from '@/app/types';
import { ObjectId } from 'mongodb';

async function authorizeProjectAccess(
  projectId: string,
  userId: string,
  userRole?: string
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

    const projectResponse = {
      id: project._id?.toString() || project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      settings: project.settings,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    return createSuccessResponse(projectResponse);
  } catch (error) {
    console.error('Get project error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ projectId: string }> }
): Promise<Response> {
  try {
    const { projectId } = await context.params;
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const project = await authorizeProjectAccess(projectId, payload.sub, payload.role);

    if (!project) {
      return createErrorResponse('Project not found or access denied', 404);
    }

    const body = await request.json();
    const validationResult = projectUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const updates = validationResult.data;
    const projectsCollection = await getCollection<Project>('projects');

    const updateData: Partial<Project> = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.settings !== undefined) {
      updateData.settings = updates.settings;
    }

    await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $set: updateData }
    );

    const updatedProject = await projectsCollection.findOne({
      _id: new ObjectId(projectId),
    });

    if (!updatedProject) {
      return createErrorResponse('Project not found', 404);
    }

    const projectResponse = {
      id: updatedProject._id?.toString() || updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      ownerId: updatedProject.ownerId,
      settings: updatedProject.settings,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    };

    return createSuccessResponse(projectResponse);
  } catch (error) {
    console.error('Update project error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function DELETE(
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

    // Only owner or admin can delete
    if (project.ownerId !== payload.sub && payload.role !== 'admin') {
      return createErrorResponse('Forbidden', 403);
    }

    const projectsCollection = await getCollection<Project>('projects');
    const imagesCollection = await getCollection('images');

    // Delete associated images
    await imagesCollection.deleteMany({ projectId });

    // Delete project
    await projectsCollection.deleteOne({ _id: new ObjectId(projectId) });

    return createSuccessResponse({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

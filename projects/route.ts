import { getCollection } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';
import { projectSchema, createErrorResponse, createSuccessResponse } from '@/lib/validation';
import { Project } from '@/app/types';
import { ObjectId } from 'mongodb';

export async function GET(request: Request): Promise<Response> {
  try {
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const userId = payload.sub;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const ownerFilter = searchParams.get('owner');

    // Build query
    const query: any = {};
    if (ownerFilter === 'me' || !ownerFilter) {
      query.ownerId = userId;
    } else if (ownerFilter === 'all' && payload.role === 'admin') {
      // Admin can see all projects
    } else {
      query.ownerId = ownerFilter;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const projectsCollection = await getCollection<Project>('projects');

    // Get total count
    const total = await projectsCollection.countDocuments(query);

    // Fetch projects
    const projects = await projectsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format response
    const formattedProjects = projects.map((project) => ({
      id: project._id?.toString() || project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      settings: project.settings,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    return createSuccessResponse({
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await getAuthenticatedUser(request);

    if (!payload) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const validationResult = projectSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        validationResult.error.errors.map(e => e.message).join(', '),
        400
      );
    }

    const { name, description, settings } = validationResult.data;
    const userId = payload.sub;

    const projectsCollection = await getCollection<Project>('projects');

    const now = new Date();
    const project: Omit<Project, 'id'> & { _id?: string } = {
      name,
      description,
      ownerId: userId,
      settings: settings || {},
      createdAt: now,
      updatedAt: now,
    };

    const result = await projectsCollection.insertOne(project);
    const projectId = result.insertedId.toString();

    const projectResponse = {
      id: projectId,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      settings: project.settings,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    return createSuccessResponse(projectResponse, 201);
  } catch (error) {
    console.error('Create project error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

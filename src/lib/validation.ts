import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(1, 'Project name is required').optional(),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

const boundingBoxSchema = z.object({
  id: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
  label: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const imageSchema = z.object({
  url: z.string().url('Invalid URL'),
  metadata: z.object({
    filename: z.string().optional(),
    size: z.number().optional(),
    mimeType: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    labels: z.array(z.string()).optional(),
    description: z.string().optional(),
  }).optional(),
  annotations: z.object({
    boundingBoxes: z.array(boundingBoxSchema).optional(),
  }).optional(),
});

export const imageUpdateSchema = z.object({
  url: z.string().url('Invalid URL').optional(),
  metadata: z.object({
    filename: z.string().optional(),
    size: z.number().optional(),
    mimeType: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    labels: z.array(z.string()).optional(),
    description: z.string().optional(),
  }).optional(),
  annotations: z.object({
    boundingBoxes: z.array(boundingBoxSchema).optional(),
  }).optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export function createErrorResponse(message: string, status: number = 400): Response {
  return Response.json({ error: message }, { status });
}

export function createSuccessResponse<T>(data: T, status: number = 200): Response {
  return Response.json(data, { status });
}




export interface User {
  _id?: string;
  id: string;
  email: string;
  name: string;
  password?: string; // Only in database, never returned in API
  role?: 'user' | 'admin';
  createdAt: Date;
  updatedAt?: Date;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  userId: string;
  imageCount: number;
  createdAt: Date;
}

export interface ImageData {
  id: string;
  url: string;
  datasetId: string;
  liked: boolean | null;
  createdAt: Date;
}

export interface Project {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface BoundingBox {
  id: string;
  x: number; // x coordinate (0-1 normalized)
  y: number; // y coordinate (0-1 normalized)
  width: number; // width (0-1 normalized)
  height: number; // height (0-1 normalized)
  label?: string; // object class/label
  confidence?: number; // detection confidence (0-1)
}

export interface ProjectImage {
  _id?: string;
  id: string;
  projectId: string;
  url: string;
  metadata?: {
    filename?: string;
    size?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    labels?: string[];
    description?: string;
  };
  annotations?: {
    boundingBoxes?: BoundingBox[];
  };
  createdAt: Date;
  updatedAt?: Date;
}

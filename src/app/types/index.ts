export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
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

// Template types for the new CRUD
export interface Project {
  // TODO: Define project fields (e.g., id, name, description, ownerId, createdAt)
  [key: string]: unknown;
}

export interface ProjectImage {
  // TODO: Define image fields (e.g., id, projectId, url, metadata, createdAt)
  [key: string]: unknown;
}
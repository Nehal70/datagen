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

export interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedImages: string[];
  detectedObjects: DetectedObject[];
  scrapedImages: ScrapedImage[];
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface DetectedObject {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface ScrapedImage {
  id: string;
  url: string;
  source: string;
  similarity: number;
  detectedObjects: DetectedObject[];
  savedPath?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  polygonPoints?: Array<{
    x: number;
    y: number;
  }>;
}

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

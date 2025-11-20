import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';
import { ScrapedImage } from '@/app/types';

/**
 * Save scraped image to PACE storage
 */
export async function saveToPACEStorage(
  image: ScrapedImage,
  jobId: string
): Promise<string | null> {
  try {
    // Determine storage path
    const paceStorageBase = process.env.PACE_STORAGE_BASE || '/storage/hpc/pace';
    const storagePath = path.join(paceStorageBase, 'datagen', jobId, 'images');
    
    // Create directory if it doesn't exist
    await fs.mkdir(storagePath, { recursive: true });
    
    // Download image
    const response = await axios.get(image.url, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });
    
    // Determine file extension
    const urlPath = new URL(image.url).pathname;
    const ext = path.extname(urlPath) || '.jpg';
    const filename = `${image.id}${ext}`;
    const filepath = path.join(storagePath, filename);
    
    // Save to PACE storage
    await fs.writeFile(filepath, Buffer.from(response.data));
    
    // Return relative path
    return path.join('datagen', jobId, 'images', filename);
  } catch (error) {
    console.error(`Error saving image ${image.id} to PACE storage:`, error);
    return null;
  }
}

/**
 * Save image locally (fallback if PACE storage unavailable)
 */
export async function saveLocally(
  image: ScrapedImage,
  jobId: string
): Promise<string | null> {
  try {
    const localStoragePath = path.join(process.cwd(), 'storage', jobId, 'images');
    await fs.mkdir(localStoragePath, { recursive: true });
    
    const response = await axios.get(image.url, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });
    
    const urlPath = new URL(image.url).pathname;
    const ext = path.extname(urlPath) || '.jpg';
    const filename = `${image.id}${ext}`;
    const filepath = path.join(localStoragePath, filename);
    
    await fs.writeFile(filepath, Buffer.from(response.data));
    
    return filepath;
  } catch (error) {
    console.error(`Error saving image locally:`, error);
    return null;
  }
}

/**
 * Get image URL from storage path
 */
export function getImageUrl(storagePath: string): string {
  // If it's already a URL, return it
  if (storagePath.startsWith('http')) {
    return storagePath;
  }
  
  // Otherwise, construct URL from storage path
  const baseUrl = process.env.STORAGE_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/storage/${storagePath}`;
}


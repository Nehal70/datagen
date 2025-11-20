import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedImage, DetectedObject } from '@/app/types';

/**
 * Scrape similar images from various sources based on object class
 */
export async function scrapeSimilarImages(
  objectClass: string,
  maxImages: number = 40
): Promise<ScrapedImage[]> {
  const scrapedImages: ScrapedImage[] = [];
  
  // Try multiple sources - prioritize search-based APIs
  // Increase per-source count to get more images
  const perSource = Math.ceil(maxImages / 4);
  const sources = [
    () => scrapeFromBing(objectClass, perSource),
    () => scrapeFromGoogle(objectClass, perSource),
    () => scrapeFromDuckDuckGo(objectClass, perSource),
    () => scrapeFromUnsplash(objectClass, perSource),
  ];

  // Try all sources in parallel for speed
  const sourcePromises = sources.map(source => 
    source().catch(error => {
      console.error(`Error scraping from source:`, error);
      return [];
    })
  );
  
  const results = await Promise.all(sourcePromises);
  for (const images of results) {
    scrapedImages.push(...images);
    if (scrapedImages.length >= maxImages) {
      break;
    }
  }

  // Add similarity scores (simplified - in production, use actual image similarity)
  return scrapedImages
    .slice(0, maxImages)
    .map((img, idx) => ({
      ...img,
      similarity: 0.75 + (Math.random() * 0.2), // Simulated similarity
    }));
}

/**
 * Scrape images from Unsplash (using their API or web scraping)
 */
async function scrapeFromUnsplash(
  query: string,
  count: number
): Promise<ScrapedImage[]> {
  const images: ScrapedImage[] = [];
  
  try {
    // Using Unsplash API (requires API key)
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (apiKey) {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query,
          per_page: Math.min(count, 30),
          client_id: apiKey,
        },
      });

      response.data.results.forEach((photo: any, idx: number) => {
        images.push({
          id: `unsplash-${photo.id}`,
          url: photo.urls.regular,
          source: 'Unsplash',
          similarity: 0.8,
          detectedObjects: [],
        });
      });
    } else {
      // Fallback: web scraping (be respectful of rate limits)
      const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      $('img[src*="unsplash"]').slice(0, count).each((idx, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('data-src');
        if (src && !src.includes('logo')) {
          images.push({
            id: `unsplash-${idx}`,
            url: src.startsWith('http') ? src : `https:${src}`,
            source: 'Unsplash',
            similarity: 0.75,
            detectedObjects: [],
          });
        }
      });
    }
  } catch (error) {
    console.error('Error scraping Unsplash:', error);
  }

  return images;
}

/**
 * Scrape images from Pexels
 */
async function scrapeFromPexels(
  query: string,
  count: number
): Promise<ScrapedImage[]> {
  const images: ScrapedImage[] = [];
  
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    if (apiKey) {
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query,
          per_page: Math.min(count, 80),
        },
        headers: {
          Authorization: apiKey,
        },
      });

      response.data.photos.forEach((photo: any) => {
        images.push({
          id: `pexels-${photo.id}`,
          url: photo.src.large,
          source: 'Pexels',
          similarity: 0.8,
          detectedObjects: [],
        });
      });
    }
  } catch (error) {
    console.error('Error scraping Pexels:', error);
  }

  return images;
}

/**
 * Scrape images from Pixabay
 */
async function scrapeFromPixabay(
  query: string,
  count: number
): Promise<ScrapedImage[]> {
  const images: ScrapedImage[] = [];
  
  try {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (apiKey) {
      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: apiKey,
          q: query,
          image_type: 'photo',
          per_page: Math.min(count, 200),
        },
      });

      response.data.hits.forEach((hit: any) => {
        images.push({
          id: `pixabay-${hit.id}`,
          url: hit.largeImageURL || hit.webformatURL,
          source: 'Pixabay',
          similarity: 0.75,
          detectedObjects: [],
        });
      });
    }
  } catch (error) {
    console.error('Error scraping Pixabay:', error);
  }

  return images;
}

/**
 * Scrape images from DuckDuckGo Image Search (free, no API key needed)
 */
async function scrapeFromDuckDuckGo(
  query: string,
  count: number
): Promise<ScrapedImage[]> {
  const images: ScrapedImage[] = [];
  
  try {
    // DuckDuckGo image search via web scraping
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}+images&iax=images&ia=images`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    // DuckDuckGo uses vqd token for image search - try to extract images
    $('img[data-src], img[src]').slice(0, count).each((idx, elem) => {
      const src = $(elem).attr('data-src') || $(elem).attr('src');
      if (src && src.includes('http') && !src.includes('logo') && !src.includes('icon')) {
        images.push({
          id: `duckduckgo-${idx}`,
          url: src,
          source: 'DuckDuckGo',
          similarity: 0.75 + Math.random() * 0.15,
          detectedObjects: [],
        });
      }
    });
  } catch (error) {
    console.error('Error scraping DuckDuckGo:', error);
  }
  
  return images;
}

/**
 * Scrape images from Bing Image Search (free tier, no API key for basic scraping)
 */
async function scrapeFromBing(
  query: string,
  count: number
): Promise<ScrapedImage[]> {
  const images: ScrapedImage[] = [];
  
  try {
    // Bing image search via web scraping - try multiple pages
    const pages = Math.ceil(count / 35);
    for (let page = 0; page < pages && images.length < count; page++) {
      const first = page * 35;
      const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&count=35&first=${first}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      $('img.mimg, img[data-src]').each((idx, elem) => {
        if (images.length >= count) return false;
        const src = $(elem).attr('src') || $(elem).attr('data-src');
        if (src && (src.startsWith('http') || src.startsWith('//')) && !src.includes('logo') && !src.includes('icon')) {
          const imageUrl = src.startsWith('//') ? `https:${src}` : src;
          images.push({
            id: `bing-${page}-${idx}`,
            url: imageUrl,
            source: 'Bing',
            similarity: 0.8 + Math.random() * 0.15,
            detectedObjects: [],
          });
        }
      });
      
      // Small delay between pages
      if (page < pages - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.error('Error scraping Bing:', error);
  }
  
  return images;
}

/**
 * Scrape images from Google Images (via web scraping, no API key)
 */
async function scrapeFromGoogle(
  query: string,
  count: number
): Promise<ScrapedImage[]> {
  const images: ScrapedImage[] = [];
  
  try {
    // Google Images search
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&num=${Math.min(count, 20)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    // Google Images uses base64 encoded data in script tags, but we can try img tags
    $('img').slice(0, count).each((idx, elem) => {
      const src = $(elem).attr('src');
      if (src && (src.startsWith('http') || src.startsWith('data:')) && !src.includes('logo') && !src.includes('icon')) {
        images.push({
          id: `google-${idx}`,
          url: src.startsWith('data:') ? `https://via.placeholder.com/400x300?text=${encodeURIComponent(query)}` : src,
          source: 'Google',
          similarity: 0.85 + Math.random() * 0.1,
          detectedObjects: [],
        });
      }
    });
  } catch (error) {
    console.error('Error scraping Google:', error);
  }
  
  return images;
}

/**
 * Calculate image similarity (simplified - in production use perceptual hashing or deep learning)
 */
export function calculateSimilarity(
  image1Url: string,
  image2Url: string
): Promise<number> {
  // Placeholder - implement actual similarity calculation
  return Promise.resolve(0.7 + Math.random() * 0.3);
}


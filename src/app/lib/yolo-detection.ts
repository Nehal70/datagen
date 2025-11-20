import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectedObject } from '@/app/types';
import * as fs from 'fs/promises';
import * as path from 'path';

let model: cocoSsd.ObjectDetection | null = null;

/**
 * Load YOLO/COCO-SSD model (runs once, cached)
 */
async function loadModel(): Promise<cocoSsd.ObjectDetection> {
  if (!model) {
    console.log('Loading COCO-SSD model...');
    model = await cocoSsd.load({
      base: 'mobilenet_v2',
    });
    console.log('Model loaded successfully');
  }
  return model;
}

/**
 * Detect objects in an image using YOLO/COCO-SSD
 */
export async function detectObjectsInImage(
  imagePath: string
): Promise<DetectedObject[]> {
  try {
    const model = await loadModel();
    
    // Read image file
    const imageBuffer = await fs.readFile(imagePath);
    const imageTensor = tf.node.decodeImage(imageBuffer, 3) as tf.Tensor3D;
    
    // Run detection
    const predictions = await model.detect(imageTensor);
    
    // Clean up tensor
    imageTensor.dispose();
    
    // Convert to our format
    const detections: DetectedObject[] = predictions.map((pred) => ({
      class: pred.class,
      confidence: pred.score,
      bbox: [
        pred.bbox[0], // x
        pred.bbox[1], // y
        pred.bbox[2], // width
        pred.bbox[3], // height
      ] as [number, number, number, number],
    }));
    
    // Filter low confidence detections
    return detections.filter((d) => d.confidence > 0.3);
  } catch (error) {
    console.error(`Error detecting objects in ${imagePath}:`, error);
    return [];
  }
}

/**
 * Get unique object classes from detections
 */
export function getUniqueClasses(detections: DetectedObject[]): string[] {
  const classes = new Set(detections.map((d) => d.class));
  return Array.from(classes);
}

/**
 * Get top N most confident detections
 */
export function getTopDetections(
  detections: DetectedObject[],
  topN: number = 5
): DetectedObject[] {
  return detections
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topN);
}


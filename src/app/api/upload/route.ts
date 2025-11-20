import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { processLocally } from '@/app/lib/pace-ice-local';
import { ProcessingJob } from '@/app/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory job store (in production, use a database)
declare global {
  var jobStore: Map<string, ProcessingJob & { paceJobId?: string }> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 });
    }

    // Create uploads directory
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Save uploaded images
    const savedPaths: string[] = [];
    const jobId = uuidv4();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${jobId}-${file.name}`;
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);
      savedPaths.push(filepath);
    }

    // Create initial job
    const job: ProcessingJob = {
      id: jobId,
      status: 'pending',
      uploadedImages: savedPaths,
      detectedObjects: [],
      scrapedImages: [],
      progress: 0,
      createdAt: new Date(),
    };

    // Process locally (CPU-based, works immediately - no PACE needed!)
    console.log('Processing locally...');
    
    // Start processing in background (don't wait)
    processLocally(jobId, savedPaths).then((processedJob) => {
      global.jobStore = global.jobStore || new Map();
      global.jobStore.set(jobId, processedJob);
    }).catch((error) => {
      console.error('Processing error:', error);
      if (global.jobStore) {
        const failedJob = global.jobStore.get(jobId);
        if (failedJob) {
          failedJob.status = 'failed';
          failedJob.error = error.message;
          global.jobStore.set(jobId, failedJob);
        }
      }
    });
    
    // Return immediately with pending status
    job.status = 'processing';
    global.jobStore = global.jobStore || new Map();
    global.jobStore.set(jobId, job);
    
    return NextResponse.json({ jobId, mode: 'local' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { ProcessingJob } from '@/app/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory job store (in production, use a database)
declare global {
  var jobStore: Map<string, ProcessingJob & { paceJobId?: string }> | undefined;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!global.jobStore) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = global.jobStore.get(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Job status is updated by the background processing
    // Just return the current job state
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}


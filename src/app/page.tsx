'use client';

import { useState, useCallback } from 'react';
import ImageUpload from './components/ImageUpload';
import ProcessingStatus from './components/ProcessingStatus';
import ScrapedImagesGallery from './components/ScrapedImagesGallery';
import { ProcessingJob } from './types';

export default function HomePage() {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const handleUploadComplete = useCallback((jobId: string) => {
    // Poll for job status
    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const data = await response.json();
        setJob(data);
        
        if (data.status === 'processing' || data.status === 'pending') {
          setTimeout(pollJobStatus, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    };
    
    pollJobStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Dataset Tinder</h1>
          <p className="text-xl text-gray-600 mb-2">
            Upload 10 images, get 100-200 similar images using YOLO & AI
          </p>
          <p className="text-sm text-gray-500">
            Powered by PACE ICE GPU acceleration
          </p>
        </div>

        {!job && (
          <ImageUpload
            onUploadComplete={handleUploadComplete}
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
          />
        )}

        {job && (
          <>
            <ProcessingStatus job={job} />
            {job.status === 'completed' && job.scrapedImages.length > 0 && (
              <ScrapedImagesGallery 
                images={job.scrapedImages}
                onImagesUpdate={(updatedImages) => {
                  // Update job with new bounding boxes
                  setJob({ ...job, scrapedImages: updatedImages });
                }}
              />
            )}
            {job.status === 'failed' && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">Processing Failed</p>
                <p>{job.error || 'Unknown error occurred'}</p>
                <button
                  onClick={() => setJob(null)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

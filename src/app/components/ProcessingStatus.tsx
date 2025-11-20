'use client';

import { ProcessingJob } from '../types';

interface ProcessingStatusProps {
  job: ProcessingJob;
}

export default function ProcessingStatus({ job }: ProcessingStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing on PACE ICE...';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Processing Status</h2>
        <span className={`px-4 py-2 rounded-full text-white ${getStatusColor(job.status)}`}>
          {getStatusText(job.status)}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getStatusColor(job.status)}`}
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Job ID:</span>
            <span className="ml-2 font-mono text-xs">{job.id}</span>
          </div>
          <div>
            <span className="text-gray-600">Uploaded Images:</span>
            <span className="ml-2 font-semibold">{job.uploadedImages.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Detected Objects:</span>
            <span className="ml-2 font-semibold">{job.detectedObjects.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Scraped Images:</span>
            <span className="ml-2 font-semibold">{job.scrapedImages.length}</span>
          </div>
        </div>

        {job.status === 'processing' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current Step:</strong> {job.progress < 30 ? 'Running YOLO object detection...' : 
                                               job.progress < 80 ? 'Scraping similar images from web...' : 
                                               'Processing and saving images to PACE storage...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


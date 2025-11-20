'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiRequest, ApiError } from '@/lib/api-client';
import { ProjectImage, BoundingBox } from '@/app/types';
import BoundingBoxEditor from '@/components/BoundingBoxEditor';
import Link from 'next/link';

export default function AnnotationPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [images, setImages] = useState<ProjectImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const currentImage = images[currentImageIndex];

  useEffect(() => {
    if (projectId) {
      loadImages();
    }
  }, [projectId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError('');

      const imagesData = await apiRequest<{
        images: ProjectImage[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/api/projects/${projectId}/images`);

      setImages(imagesData.images);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
      } else {
        setError(err instanceof ApiError ? err.message : 'Failed to load images');
      }
    } finally {
      setLoading(false);
    }
  };

  const detectObjects = async () => {
    if (!currentImage) return;

    try {
      setDetecting(true);
      setError('');

      const detectionResult = await apiRequest<{
        boundingBoxes: BoundingBox[];
      }>(`/api/projects/${projectId}/images/${currentImage.id}/detect`, {
        method: 'POST',
      });

      const updatedBoxes = detectionResult.boundingBoxes || [];
      const updatedImages = [...images];
      updatedImages[currentImageIndex] = {
        ...currentImage,
        annotations: {
          ...currentImage.annotations,
          boundingBoxes: updatedBoxes,
        },
      };
      setImages(updatedImages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to detect objects');
    } finally {
      setDetecting(false);
    }
  };

  const saveAnnotations = async () => {
    if (!currentImage) return;

    try {
      setSaving(true);
      setError('');

      await apiRequest(`/api/projects/${projectId}/images/${currentImage.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          annotations: currentImage.annotations,
        }),
      });

      // Update the image in the list
      const updatedImages = [...images];
      updatedImages[currentImageIndex] = currentImage;
      setImages(updatedImages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save annotations');
    } finally {
      setSaving(false);
    }
  };

  const handleBoundingBoxesChange = (boxes: BoundingBox[]) => {
    if (!currentImage) return;

    const updatedImages = [...images];
    updatedImages[currentImageIndex] = {
      ...currentImage,
      annotations: {
        ...currentImage.annotations,
        boundingBoxes: boxes,
      },
    };
    setImages(updatedImages);
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const addBoundingBox = () => {
    if (!currentImage) return;

    const newBox: BoundingBox = {
      id: `box-${Date.now()}`,
      x: 0.2,
      y: 0.2,
      width: 0.3,
      height: 0.3,
      label: 'Object',
    };

    const currentBoxes = currentImage.annotations?.boundingBoxes || [];
    handleBoundingBoxesChange([...currentBoxes, newBox]);
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white">
        <div className="text-lg text-[#7c3aed]">Loading images...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-xl text-[#7c3aed] mb-4">No images to annotate</p>
          <Link
            href={`/projects/${projectId}`}
            className="text-[#7c3aed] hover:text-[#6b21a8] underline"
          >
            Back to project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white relative overflow-hidden">
      <main className="h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 relative z-10 overflow-y-auto">
        <div className="mb-6">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center text-sm text-[#7c3aed] hover:text-[#6b21a8] transition-colors mb-4"
          >
            ← Back to Project
          </Link>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-5xl font-normal heading-font text-[#8b5cf6]">
              Annotate Images
            </h1>
            <div className="text-sm text-[#7c3aed]/70">
              Image {currentImageIndex + 1} of {images.length}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-300 p-3">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
          {/* Image and annotation area */}
          <div className="mb-6">
            <div className="flex justify-center items-center bg-white rounded-lg p-4 min-h-[400px]">
              {currentImage && (
                <BoundingBoxEditor
                  imageUrl={currentImage.url}
                  boundingBoxes={
                    currentImage.annotations?.boundingBoxes || []
                  }
                  onBoundingBoxesChange={handleBoundingBoxesChange}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentImageIndex === 0}
                className="btn-primary px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentImageIndex === images.length - 1}
                className="btn-primary px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={detectObjects}
                disabled={detecting || !currentImage}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {detecting ? 'Detecting...' : 'Detect Objects'}
              </button>
              <button
                onClick={addBoundingBox}
                disabled={!currentImage}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Box
              </button>
              <button
                onClick={saveAnnotations}
                disabled={saving || !currentImage}
                className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Annotations'}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              How to annotate:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Click "Detect Objects" to automatically identify objects and create initial bounding boxes</li>
              <li>Click and drag bounding boxes to move them</li>
              <li>Click and drag the corner handles to resize boxes</li>
              <li>Click on a box to select it and edit its label</li>
              <li>Click "Add Box" to manually add a new bounding box</li>
              <li>Click "Save Annotations" to save your changes</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}


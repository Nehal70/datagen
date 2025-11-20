'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiRequest, ApiError } from '@/lib/api-client';
import Link from 'next/link';
import { Project, ProjectImage } from '@/app/types';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [addingImage, setAddingImage] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const projectData = await apiRequest<Project>(`/api/projects/${projectId}`);
      setProject(projectData);

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
        setError(err instanceof ApiError ? err.message : 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingImage(true);
    setError('');

    try {
      const newImage = await apiRequest<ProjectImage>(`/api/projects/${projectId}/images`, {
        method: 'POST',
        body: JSON.stringify({
          url: imageUrl,
        }),
      });

      setImages([...images, newImage]);
      setImageUrl('');
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add image');
    } finally {
      setAddingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await apiRequest(`/api/projects/${projectId}/images/${imageId}`, {
        method: 'DELETE',
      });

      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white">
        <div className="text-lg text-[#7c3aed]">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white">
        <div className="text-lg text-red-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white relative overflow-hidden">
      <main className="h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 relative z-10 overflow-y-auto">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-[#7c3aed] hover:text-[#6b21a8] transition-colors mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-5xl font-normal heading-font text-[#8b5cf6] mb-2">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-base text-[#7c3aed] mb-4">{project.description}</p>
          )}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-[#7c3aed]/70">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              {images.length > 0 && (
                <Link
                  href={`/projects/${projectId}/annotate`}
                  className="btn-primary px-6 py-2.5 text-sm font-semibold text-white rounded-lg"
                >
                  Annotate Images
                </Link>
              )}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-primary px-6 py-2.5 text-sm font-semibold text-white rounded-lg"
              >
                {showAddForm ? 'Cancel' : '+ Add Image'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-300 p-3">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
            <form onSubmit={handleAddImage} className="space-y-4">
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-semibold text-[#6b21a8] mb-2">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="block w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] bg-white text-gray-900"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <button
                type="submit"
                disabled={addingImage}
                className="btn-primary px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              >
                {addingImage ? 'Adding...' : 'Add Image'}
              </button>
            </form>
          </div>
        )}

        <h2 className="text-4xl font-normal heading-font text-[#8b5cf6] mb-4">
          Images ({images.length})
        </h2>

        {images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-[#7c3aed] mb-1">
              No images yet.
            </p>
            <p className="text-base text-[#7c3aed]/70">
              Add your first image to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-[#7c3aed] rounded-xl overflow-hidden text-white"
              >
                <div className="aspect-w-16 aspect-h-9 bg-white/20">
                  <img
                    src={image.url}
                    alt={image.metadata?.description || 'Project image'}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23fff" width="400" height="300"/%3E%3Ctext fill="%237c3aed" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="p-4">
                  {image.metadata?.description && (
                    <p className="text-sm opacity-90 mb-2">
                      {image.metadata.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <p className="text-xs opacity-75">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

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
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-violet-100">
        <div className="flex items-center gap-3 text-[#7c3aed]">
          <div className="h-5 w-5 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
          <span className="text-sm sm:text-base">Loading project...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-violet-100">
        <div className="rounded-2xl bg-white/90 px-6 py-4 text-sm font-medium text-red-600 shadow">
          Project not found
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-sky-50 via-white to-violet-100 px-4 py-8 sm:px-6 lg:px-10 min-h-[calc(100vh-6rem)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-[#7c3aed] hover:text-[#6b21a8] transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <p className="text-xs text-[#6b7280]">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-gray-100 sm:p-7">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h1 className="heading-font text-3xl sm:text-4xl tracking-wide text-[#111827]">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-sm sm:text-base text-[#4b5563]">{project.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {images.length > 0 && (
                <Link
                  href={`/projects/${projectId}/annotate`}
                  className="btn-primary inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold"
                >
                  Annotate Images
                </Link>
              )}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-secondary inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold"
              >
                {showAddForm ? 'Cancel' : '+ Add Image'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {showAddForm && (
            <div className="mb-6 rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200">
              <form onSubmit={handleAddImage} className="space-y-4">
                <div>
                  <label
                    htmlFor="imageUrl"
                    className="mb-2 block text-sm font-semibold text-[#6b21a8]"
                  >
                    Image URL
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/60"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingImage}
                  className="btn-primary inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingImage ? 'Adding...' : 'Add Image'}
                </button>
              </form>
            </div>
          )}

          <h2 className="heading-font text-2xl sm:text-3xl tracking-wide text-[#111827] mb-4">
            Images ({images.length})
          </h2>

          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <p className="text-lg font-medium text-[#7c3aed]">No images yet.</p>
              <p className="text-sm text-[#6b7280]">
                Add your first image to start curating this dataset.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group rounded-2xl bg-gradient-to-b from-[#f5f3ff] to-white p-[1px] shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white">
                    <div className="relative h-40 w-full bg-slate-100">
                      <img
                        src={image.url}
                        alt={image.metadata?.description || 'Project image'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23fff" width="400" height="300"/%3E%3Ctext fill="%237c3aed" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {image.metadata?.description && (
                        <p className="mb-2 text-sm text-[#374151]">
                          {image.metadata.description}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <p className="text-xs text-[#9ca3af]">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

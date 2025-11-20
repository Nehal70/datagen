'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/lib/api-client';
import Link from 'next/link';
import { Project } from '@/app/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const userData = await apiRequest<{
        id: string;
        email: string;
        name: string;
      }>('/api/auth/me');

      setUser(userData);

      const projectsData = await apiRequest<{
        projects: Project[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>('/api/projects');

      setProjects(projectsData.projects);
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

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('accessToken');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('accessToken');
      router.push('/login');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProject(true);
    setError('');

    try {
      const newProject = await apiRequest<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: projectName,
          description: projectDescription || undefined,
        }),
      });

      setProjects([newProject, ...projects]);
      setProjectName('');
      setProjectDescription('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const getDaysAgoText = (createdAt: Date) => {
    const created = new Date(createdAt);
    const diffMs = Date.now() - created.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return `Created ${days} day${days === 1 ? '' : 's'} ago`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-violet-100">
        <div className="flex items-center gap-3 text-[#7c3aed]">
          <div className="h-5 w-5 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
          <span className="text-sm sm:text-base">Loading your projects...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-sky-50 via-white to-violet-100 px-4 py-8 sm:px-6 lg:px-10 min-h-[calc(100vh-6rem)]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h2 className="heading-font text-3xl sm:text-4xl tracking-wide text-[#111827]">
            Welcome back, {user?.name || 'Demo'}!
          </h2>
          <p className="text-sm sm:text-base text-[#4b5563]">
            Continue building your custom datasets with AI-powered generation.
          </p>
        </div>

        {/* Top stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="text-xs font-medium text-[#6b7280]">Total Datasets</div>
            <div className="mt-4 text-3xl font-semibold text-[#111827]">3</div>
            <p className="mt-1 text-xs text-[#6b7280]">Active projects</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="text-xs font-medium text-[#6b7280]">Data Points</div>
            <div className="mt-4 text-3xl font-semibold text-[#111827]">5,705</div>
            <p className="mt-1 text-xs text-[#6b7280]">Generated items</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="text-xs font-medium text-[#6b7280]">Avg. Accuracy</div>
            <div className="mt-4 text-3xl font-semibold text-[#111827]">93%</div>
            <p className="mt-1 text-xs text-[#6b7280]">Model performance</p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="heading-font text-2xl sm:text-3xl tracking-wide text-[#111827]">
            Your Datasets
          </h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            {showCreateForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {showCreateForm && (
          <div className="rounded-2xl bg-white/90 p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label
                  htmlFor="projectName"
                  className="mb-2 block text-sm font-semibold text-[#6b21a8]"
                >
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/60"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label
                  htmlFor="projectDescription"
                  className="mb-2 block text-sm font-semibold text-[#6b21a8]"
                >
                  Description (optional)
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={2}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/60"
                  placeholder="Enter project description"
                />
              </div>
              <button
                type="submit"
                disabled={creatingProject}
                className="btn-primary inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingProject ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm font-medium text-[#7c3aed]">No datasets yet.</p>
            <p className="text-xs text-[#6b7280]">
              Create your first project to start generating custom datasets.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-5 shadow-sm transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-semibold text-[#111827]">
                    {project.name}
                  </h4>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    {getDaysAgoText(project.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white">
                    Continue Training
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

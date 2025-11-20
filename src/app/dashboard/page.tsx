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

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white">
        <div className="text-lg text-[#7c3aed]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white relative overflow-hidden">
      <main className="h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 relative z-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-5xl font-normal heading-font text-[#8b5cf6] mb-1">My Projects</h2>
            <p className="text-base text-[#7c3aed]">Manage and organize your data generation projects</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary px-6 py-2.5 text-sm font-semibold text-white rounded-lg"
          >
            {showCreateForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border-2 border-red-300 p-3">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {showCreateForm && (
          <div className="mb-6 bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-semibold text-[#6b21a8] mb-2">
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="block w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] bg-white text-gray-900"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label htmlFor="projectDescription" className="block text-sm font-semibold text-[#6b21a8] mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={2}
                  className="block w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] bg-white text-gray-900"
                  placeholder="Enter project description"
                />
              </div>
              <button
                type="submit"
                disabled={creatingProject}
                className="btn-primary px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              >
                {creatingProject ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-[#7c3aed] mb-1">
              No projects yet.
            </p>
            <p className="text-base text-[#7c3aed]/70">
              Create your first project to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-[#7c3aed] block p-6 rounded-xl text-white hover:bg-[#6b21a8] transition-all duration-300"
              >
                <h3 className="text-xl font-bold mb-2">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm opacity-90 mb-3">
                    {project.description}
                  </p>
                )}
                <p className="text-xs opacity-75">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/lib/api-client';

interface MeResponse {
  id: string;
  email: string;
  name: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const me = await apiRequest<MeResponse>('/api/auth/me');
        setUserId(me.id);
        setName(me.name);
        setEmail(me.email);

        const storedAvatar =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(`avatarUrl:${me.id}`) || ''
            : '';
        setAvatarUrl(storedAvatar);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.push('/login');
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await apiRequest(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, email }),
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`avatarUrl:${userId}`, avatarUrl);
      }

      setSuccess('Profile updated');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayInitial = name?.charAt(0).toUpperCase() || 'D';

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-violet-100">
        <div className="flex items-center gap-3 text-[#7c3aed]">
          <div className="h-5 w-5 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
          <span className="text-sm sm:text-base">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-sky-50 via-white to-violet-100 px-4 py-8 sm:px-6 lg:px-10 min-h-[calc(100vh-6rem)]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="heading-font text-3xl sm:text-4xl tracking-wide text-[#111827]">
              Edit Profile
            </h1>
            <p className="text-sm sm:text-base text-[#4b5563]">
              Update your name, email, and profile picture for your DataGen account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#111827] shadow-sm hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="rounded-3xl bg-white/95 p-6 shadow-lg ring-1 ring-gray-100 sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#ede9fe] text-lg font-semibold text-[#7c3aed]">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={() => setAvatarUrl('')}
                  />
                ) : (
                  <span>{displayInitial}</span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-medium text-[#4b5563]">
                  Profile picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="block w-full text-xs text-[#4b5563] file:mr-3 file:rounded-md file:border-0 file:bg-[#7c3aed] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#6b21a8]"
                />
                <p className="text-[11px] text-[#9ca3af]">
                  Upload a square image for best results. Changes are stored locally in this
                  browser.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-[#4b5563] mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/60"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#4b5563] mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/60"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#111827] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}



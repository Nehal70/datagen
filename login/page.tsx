'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/lib/api-client';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiRequest<{
        id: string;
        email: string;
        name: string;
        accessToken: string;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
      }

      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-sky-50 via-white to-violet-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#8b5cf6] p-[1px] shadow-lg">
            <div className="rounded-3xl bg-white/95 p-8 sm:p-9">
              <div className="mb-6 space-y-2 text-center">
                <h1 className="heading-font text-4xl tracking-wide text-[#8b5cf6]">Sign In</h1>
                <p className="text-sm text-[#7c3aed]">
                  Or{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-[#6b21a8] hover:text-[#7c3aed] underline"
                  >
                    create a new account
                  </Link>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/60"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/60"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary mt-2 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-base font-semibold text-white shadow-md focus:outline-none focus:ring-4 focus:ring-[#7c3aed]/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

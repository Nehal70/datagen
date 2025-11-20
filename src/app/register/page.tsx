'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, ApiError } from '@/lib/api-client';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{
        id: string;
        email: string;
        name: string;
        accessToken: string;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
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
    <div className="h-[calc(100vh-8rem)] bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="text-center text-5xl font-normal heading-font text-[#8b5cf6] mb-2">
            Create Account
          </h2>
          <p className="text-center text-base text-[#7c3aed]">
            Or{' '}
            <Link
              href="/login"
              className="font-semibold text-[#6b21a8] hover:text-[#7c3aed] transition-colors underline"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 border-2 border-red-300 p-3">
              <div className="text-sm font-medium text-red-600">
                {error}
              </div>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm bg-white"
                placeholder="Full name"
              />
            </div>
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
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm bg-white"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm bg-white"
                placeholder="Password (min. 6 characters)"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm bg-white"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary group relative w-full flex justify-center py-3 px-4 text-base font-semibold rounded-lg text-white focus:outline-none focus:ring-4 focus:ring-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

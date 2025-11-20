'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiRequest, ApiError } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check auth if not on public pages
    if (pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const userData = await apiRequest<{ id: string; name: string; email: string }>('/api/auth/me');
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('accessToken');
      router.push('/');
    } catch (err) {
      localStorage.removeItem('accessToken');
      router.push('/');
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <span className="text-xl font-normal heading-font text-gray-900">DataGen</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-base font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={`text-base font-medium transition-all duration-300 ${
                      isActive('/dashboard') 
                        ? 'text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <span className="hidden sm:block text-sm text-gray-600">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="group inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-all"
                >
                  Get Started
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


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
    <nav className="bg-white border-b-2 border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-2xl font-normal heading-font text-[#8b5cf6]">DATAGEN</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-base font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-[#6b21a8] border-b-2 border-[#7c3aed] pb-1' 
                    : 'text-[#7c3aed] hover:text-[#6b21a8]'
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
                        ? 'text-[#6b21a8] border-b-2 border-[#7c3aed] pb-1' 
                        : 'text-[#7c3aed] hover:text-[#6b21a8]'
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
              <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <span className="hidden sm:block text-sm text-[#7c3aed]">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#7c3aed] rounded-lg hover:bg-[#6b21a8] transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#7c3aed] hover:text-[#6b21a8] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary px-4 py-2 text-sm font-medium rounded-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


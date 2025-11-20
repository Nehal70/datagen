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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
      if (typeof window !== 'undefined') {
        const storedAvatar = window.localStorage.getItem(`avatarUrl:${userData.id}`) || '';
        setAvatarUrl(storedAvatar || null);
      }
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

  return (
    <nav className="bg-white border-b-2 border-gray-200 relative z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-2xl font-normal heading-font text-[#8b5cf6]">DATAGEN</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu((open) => !open)}
                  className="flex items-center gap-3 rounded-full bg-white/80 px-3 py-1.5 shadow-sm ring-1 ring-gray-100 hover:bg-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#ede9fe] text-xs font-semibold text-[#7c3aed]">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="hidden flex-col items-start sm:flex">
                    <span className="text-xs font-medium text-[#111827]">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-[#6b7280] line-clamp-1">{user.email}</span>
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white py-1.5 text-sm text-[#111827] shadow-lg ring-1 ring-gray-100">
                    <Link
                      href="/profile"
                      className="block px-3 py-1.5 text-xs hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Edit profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
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


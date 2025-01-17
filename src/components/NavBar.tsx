'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700';
  };

  return (
    <nav className="w-64 bg-gray-100 h-screen overflow-y-auto flex-shrink-0 border-r border-gray-200">
      <div className="p-4">
        {/* Public Routes */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Public</h3>
          <div className="space-y-1">
            <Link
              href="/"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/'
              )}`}
            >
              Home
            </Link>
            <Link
              href="/landingpage"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/landingpage'
              )}`}
            >
              Landing
            </Link>
          </div>
        </div>

        {/* Protected Routes */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Protected</h3>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/dashboard'
              )}`}
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/profile'
              )}`}
            >
              Profile
            </Link>
            <Link
              href="/admin"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/admin'
              )}`}
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Auth Routes */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Auth</h3>
          <div className="space-y-1">
            <Link
              href="/auth/login"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/auth/login'
              )}`}
            >
              Login
            </Link>
            <Link
              href="/auth/error"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/auth/error'
              )}`}
            >
              Error
            </Link>
          </div>
        </div>

        {/* API Routes */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">API</h3>
          <div className="space-y-1">
            <Link
              href="/api/auth/session"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/api/auth/session'
              )}`}
            >
              Session
            </Link>
            <Link
              href="/api/protected"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/api/protected'
              )}`}
            >
              Protected
            </Link>
          </div>
        </div>

        {/* Non-existent Routes */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">404s</h3>
          <div className="space-y-1">
            <Link
              href="/not-found-page"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/not-found-page'
              )}`}
            >
              404
            </Link>
            <Link
              href="/random-route"
              className={`block px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                '/random-route'
              )}`}
            >
              Random
            </Link>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

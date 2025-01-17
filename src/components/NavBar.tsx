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
    <nav className="w-fit bg-gray-100 h-screen overflow-y-auto flex-shrink-0 border-r border-gray-200 pr-4">
      <div className="p-2 min-h-full flex flex-col">
        <div className="flex-1 space-y-6">
          {/* Public Routes */}
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-1.5 mb-2 border-b border-gray-200 pb-1">
              Public
            </h3>
            <div className="space-y-0.5 pl-2">
              <Link
                href="/"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/'
                )}`}
              >
                Home
              </Link>
              <Link
                href="/landingpage"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/landingpage'
                )}`}
              >
                Landing
              </Link>
            </div>
          </div>

          {/* Protected Routes */}
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-1.5 mb-2 border-b border-gray-200 pb-1">
              Protected
            </h3>
            <div className="space-y-0.5 pl-2">
              <Link
                href="/dashboard"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/dashboard'
                )}`}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/profile'
                )}`}
              >
                Profile
              </Link>
              <Link
                href="/admin"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/admin'
                )}`}
              >
                Admin
              </Link>
            </div>
          </div>

          {/* Auth Routes */}
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-1.5 mb-2 border-b border-gray-200 pb-1">
              Auth
            </h3>
            <div className="space-y-0.5 pl-2">
              <Link
                href="/auth/login"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/auth/login'
                )}`}
              >
                Login
              </Link>
              <Link
                href="/auth/error"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/auth/error'
                )}`}
              >
                Error
              </Link>
            </div>
          </div>

          {/* API Routes */}
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-1.5 mb-2 border-b border-gray-200 pb-1">
              API
            </h3>
            <div className="space-y-0.5 pl-2">
              <Link
                href="/api/auth/session"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/api/auth/session'
                )}`}
              >
                Session
              </Link>
              <Link
                href="/api/protected"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/api/protected'
                )}`}
              >
                Protected
              </Link>
            </div>
          </div>

          {/* Non-existent Routes */}
          <div>
            <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-1.5 mb-2 border-b border-gray-200 pb-1">
              404s
            </h3>
            <div className="space-y-0.5 pl-2">
              <Link
                href="/not-found-page"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/not-found-page'
                )}`}
              >
                404
              </Link>
              <Link
                href="/random-route"
                className={`block pl-1.5 pr-4 py-1 text-xs font-medium rounded hover:bg-blue-600 hover:text-white transition-colors ${isActive(
                  '/random-route'
                )}`}
              >
                Random
              </Link>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut({ 
            callbackUrl: '/',
            redirect: true 
          })}
          className="mt-4 w-full text-xs text-gray-700 font-medium bg-gray-200 px-3 py-1.5 rounded hover:bg-red-500 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}

'use client';

import { useAuth } from "@/auth/use-auth";

export default function Home() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {auth.error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      {auth.isAuthenticated ? (
        <div className="space-y-6 w-full max-w-md">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
            <div className="space-y-2">
              <p className="text-gray-600">Email: {auth.user?.profile.email}</p>
              <p className="text-gray-600">Name: {auth.user?.profile.name}</p>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to Demo App</h1>
            <p className="text-gray-600 mt-2">Please sign in to continue</p>
          </div>
          <button
            onClick={() => auth.signinRedirect()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In with Cognito
          </button>
        </div>
      )}
    </div>
  );
}

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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {auth.isAuthenticated ? (
        <div className="space-y-6 w-full max-w-md">
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
            <p className="text-gray-600">You are now signed in to the application.</p>
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
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Cognito Authentication Demo</h2>
            <p className="text-gray-600">Click the button below to sign in with your Cognito user pool account.</p>
            <button
              onClick={() => auth.signinRedirect()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

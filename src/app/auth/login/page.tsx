'use client';

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSignIn = async () => {
    await signIn('keycloak', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Welcome Back</h2>
          <p className="text-gray-600 text-center">Sign in to continue to your account</p>
          {error === "RefreshTokenError" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">Your session has expired. Please sign in again.</span>
            </div>
          )}
          <button
            onClick={handleSignIn}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign in with Keycloak
          </button>
        </div>
      </div>
    </div>
  );
}

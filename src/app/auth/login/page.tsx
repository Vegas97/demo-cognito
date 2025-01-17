'use client';

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="space-y-6 w-full max-w-md">
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Welcome Back</h2>
          <p className="text-gray-600 text-center">Sign in to continue to your account</p>
          <button
            onClick={() => signIn('keycloak', { callbackUrl })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign in with Keycloak
          </button>
        </div>
      </div>
    </div>
  );
}

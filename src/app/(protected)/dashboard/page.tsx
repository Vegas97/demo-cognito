'use client';

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: You must be signed in to view this page</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="space-y-6 w-full max-w-md">
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {session?.user?.name || 'User'}!</h2>
          <div className="flex items-center space-x-4">
            {session?.user?.image && (
              <div className="relative w-12 h-12">
                <Image 
                  src={session.user.image}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-gray-600">{session?.user?.email}</p>
              <p className="text-sm text-gray-500">Signed in successfully</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

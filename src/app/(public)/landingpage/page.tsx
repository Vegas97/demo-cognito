'use client';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="space-y-6 w-full max-w-md">
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Our Platform</h2>
          <p className="text-gray-600">
            This is a public landing page that anyone can access. Sign in to access your dashboard.
          </p>
          <a
            href="/auth/login"
            className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

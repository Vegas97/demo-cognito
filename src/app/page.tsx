'use client';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Cognito Auth Demo</h1>
        <p className="text-gray-600">Welcome to our authentication demo using AWS Cognito</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/landingpage"
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Landing Page
          </a>
          <a
            href="/auth/login"
            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

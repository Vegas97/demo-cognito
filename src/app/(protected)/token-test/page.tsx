'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function TokenTestPage() {
  const { data: session, update } = useSession();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (session?.timing?.accessTokenExpiresAt) {
      const interval = setInterval(() => {
        const expiresAt = session.timing.accessTokenExpiresAt * 1000; // Convert to milliseconds
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleForceRefresh = async () => {
    await update();
    setLastRefresh(new Date());
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Token Refresh Test Page</h1>
      
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Access Token Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Time until token expires:</p>
              <p className="text-2xl font-mono">
                {timeLeft !== null ? formatTime(timeLeft) : 'Loading...'}
              </p>
            </div>
            
            {lastRefresh && (
              <div>
                <p className="text-gray-600">Last manual refresh:</p>
                <p className="font-mono">{lastRefresh.toLocaleTimeString()}</p>
              </div>
            )}

            <button
              onClick={handleForceRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Force Token Refresh
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Watch the countdown timer above - it shows when your access token will expire</li>
            <li>The token should automatically refresh when it expires</li>
            <li>Use the &quot;Force Token Refresh&quot; button to manually trigger a refresh</li>
            <li>Check the session data below to see the updated tokens and timing information</li>
            <li>If refresh fails, you&apos;ll be redirected to the login page</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

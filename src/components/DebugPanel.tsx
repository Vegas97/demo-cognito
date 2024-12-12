'use client';

import { useAuth } from '@/auth/use-auth';

const jsonTheme = {
  scheme: 'monokai',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

export function DebugPanel() {
  const auth = useAuth();

  return (
    <div className="h-full space-y-6 p-6 bg-gray-50">
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Authentication Status</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-[30%_1fr] gap-x-4">
            <p className="text-gray-600">Is Authenticated:</p>
            <p>{auth.isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p className="text-gray-600">Is Loading:</p>
            <p>{auth.isLoading ? '⏳' : 'No'}</p>
            <p className="text-gray-600">Auth Method:</p>
            <p>{auth.isAuthenticated ? 'Cognito User Pool' : 'Not logged in'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">User Pool Info</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-[30%_1fr] gap-x-4">
            <p className="text-gray-600">Pool ID:</p>
            <p className="break-all">{process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}</p>
            <p className="text-gray-600">Client ID:</p>
            <p className="break-all">{process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID}</p>
            <p className="text-gray-600">Region:</p>
            <p>{process.env.NEXT_PUBLIC_COGNITO_REGION}</p>
          </div>
        </div>
      </div>

      {auth.isAuthenticated && auth.user && (
        <>
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">User Info</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-[30%_1fr] gap-x-4">
                <p className="text-gray-600">Sub:</p>
                <p className="break-all">{auth.user.profile.sub}</p>
                <p className="text-gray-600">Email:</p>
                <p className="break-all">{auth.user.profile.email}</p>
                <p className="text-gray-600">Token Type:</p>
                <p>{auth.user.token_type}</p>
                <p className="text-gray-600">Expires At:</p>
                <p>{new Date(auth.user.expires_at * 1000).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Raw Auth Data</h2>
            <div className="p-4 bg-gray-900 rounded-lg overflow-auto max-h-[500px]">
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(auth, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

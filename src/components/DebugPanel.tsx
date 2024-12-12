'use client';

import { useAuth } from '@/auth/use-auth';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

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
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-6 py-6 bg-gray-50 space-y-6">
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
              <div className="flex flex-col gap-4">
                <Drawer>
                  <DrawerTrigger asChild>
                    <div className="bg-white shadow rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Raw Auth Data</h2>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-500"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    </div>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-4xl">
                      <DrawerHeader>
                        <DrawerTitle>Authentication Object</DrawerTitle>
                        <DrawerDescription>
                          Full authentication state and user information
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 bg-gray-900 rounded-lg overflow-auto max-h-[500px] mx-4">
                        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                          {JSON.stringify(auth, null, 2)}
                        </pre>
                      </div>
                      <div className="p-4 mt-2 flex justify-end">
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

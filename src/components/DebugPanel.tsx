'use client';

import { useSession } from 'next-auth/react';
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
import { JsonView, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { publicRoutes, authRoutes, apiAuthPrefix } from '@/routes';

export function DebugPanel() {
  const { data: session, status } = useSession();
  const [isExpanded, setIsExpanded] = useState(true); // Set to true by default
  const pathname = usePathname();

  const getRouteType = (path: string) => {
    if (path.startsWith(apiAuthPrefix)) return 'API Auth Route';
    if (publicRoutes.includes(path)) return 'Public Route';
    if (authRoutes.includes(path)) return 'Auth Route';
    return 'Protected Route';
  };

  const shouldExpandNode = (level: number) => {
    if (isExpanded) return true;
    return level === 0; // Only expand first level by default
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-6 py-6 bg-gray-50 space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Route Information</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-[30%_1fr] gap-x-4">
              <p className="text-gray-600">Current Path:</p>
              <p className="font-mono text-sm">{pathname}</p>
              <p className="text-gray-600">Route Type:</p>
              <p>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                  getRouteType(pathname) === 'Protected Route' 
                    ? 'bg-green-50 text-green-800 ring-1 ring-inset ring-green-600/20' 
                    : getRouteType(pathname) === 'Public Route'
                    ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
                    : getRouteType(pathname) === 'Auth Route'
                    ? 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-600/20'
                    : 'bg-gray-50 text-gray-800 ring-1 ring-inset ring-gray-600/20'
                }`}>
                  {getRouteType(pathname)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Authentication Status</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-[30%_1fr] gap-x-4">
              <p className="text-gray-600">Is Authenticated:</p>
              <p>{status === "authenticated" ? '✅ Yes' : '❌ No'}</p>
              <p className="text-gray-600">Status:</p>
              <p>{status === "loading" ? '⏳' : status}</p>
              <p className="text-gray-600">Auth Method:</p>
              <p>{status === "authenticated" ? 'Next Auth' : 'Not logged in'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Auth Configuration</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-[30%_1fr] gap-x-4">
              <p className="text-gray-600">Provider:</p>
              <p className="break-all">Keycloak</p>
              <p className="text-gray-600">Client ID:</p>
              <p className="break-all">{process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID}</p>
              <p className="text-gray-600">Issuer:</p>
              <p className="break-all">{process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER}</p>
            </div>
          </div>
        </div>

        {session && (
          <>
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">User Info</h2>
              <div className="space-y-2">
                <div className="grid grid-cols-[30%_1fr] gap-x-4">
                  <p className="text-gray-600">Name:</p>
                  <p className="break-all">{session.user?.name}</p>
                  <p className="text-gray-600">Email:</p>
                  <p className="break-all">{session.user?.email}</p>
                  <p className="text-gray-600">Image:</p>
                  <p className="break-all">{session.user?.image || 'N/A'}</p>
                  <p className="text-gray-600">Provider:</p>
                  <p className="break-all">{session.provider || 'N/A'}</p>
                  <p className="text-gray-600">Provider ID:</p>
                  <p className="break-all">{session.providerAccountId || 'N/A'}</p>
                  <p className="text-gray-600">Access Token:</p>
                  <p className="break-all line-clamp-1 hover:line-clamp-none">
                    {session.accessToken || 'N/A'}
                  </p>
                  <p className="text-gray-600">ID Token:</p>
                  <p className="break-all line-clamp-1 hover:line-clamp-none">
                    {session.idToken || 'N/A'}
                  </p>
                  <p className="text-gray-600">Expires:</p>
                  <p>{session.expires ? new Date(session.expires).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-col gap-4">
                <Drawer>
                  <DrawerTrigger asChild>
                    <div className="bg-white shadow rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Raw Session Data</h2>
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
                      <div className="flex items-center justify-between p-4 border-b">
                        <div>
                          <DrawerTitle>Session Object</DrawerTitle>
                          <DrawerDescription>
                            Full session state and user information
                          </DrawerDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? 'Collapse All' : 'Expand All'}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {isExpanded ? (
                                <>
                                  <line x1="18" y1="12" x2="6" y2="12" />
                                </>
                              ) : (
                                <>
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
                                </>
                              )}
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(session, null, 2));
                            }}
                            title="Copy JSON"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const jsonString = JSON.stringify(session, null, 2);
                              const blob = new Blob([jsonString], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              window.open(url, '_blank');
                              // Clean up the URL after opening
                              setTimeout(() => URL.revokeObjectURL(url), 100);
                            }}
                            title="View Raw JSON"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </Button>
                          <DrawerClose asChild>
                            <Button variant="ghost" size="icon" title="Close">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </Button>
                          </DrawerClose>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-900 rounded-lg overflow-auto max-h-[500px] mx-4">
                        <JsonView 
                          data={session} 
                          style={darkStyles}
                          shouldExpandNode={shouldExpandNode}
                        />
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

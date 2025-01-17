'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { publicRoutes, authRoutes, apiAuthPrefix } from '@/routes';

const darkStyles = {
  container: "bg-gray-900 text-gray-100",
  basicChildStyle: "whitespace-pre-wrap break-all pl-6",
  label: "text-blue-300",
  nullValue: "text-gray-500",
  stringValue: "text-green-300",
  numberValue: "text-yellow-300",
  booleanValue: "text-purple-300",
  objectBrace: "text-blue-200 font-medium",
  arrayBracket: "text-blue-200 font-medium",
  comma: "text-blue-200",
  colon: "text-blue-200",
};

const customStyles = `
  .react-json-view-lite {
    padding-left: 1rem;
  }
  .react-json-view-lite-node {
    position: relative;
  }
  .react-json-view-lite-node::before {
    content: '';
    position: absolute;
    left: -1rem;
    top: 0.7rem;
    height: calc(100% - 1rem);
    width: 1px;
    background-color: rgb(75, 85, 99);
  }
  .react-json-view-lite-node:last-child::before {
    height: 0;
  }
  .react-json-view-lite-node::after {
    content: '';
    position: absolute;
    left: -1rem;
    top: 0.7rem;
    width: 0.75rem;
    height: 1px;
    background-color: rgb(75, 85, 99);
  }
  .react-json-view-lite-arrow {
    color: rgb(147, 197, 253) !important;
    font-size: 0.8rem !important;
    margin-right: 0.5rem !important;
    transition: transform 0.2s ease;
  }
  .react-json-view-lite-arrow.react-json-view-lite-arrow-collapsed {
    transform: rotate(-90deg);
  }
  .react-json-view-lite-arrow:hover {
    color: rgb(59, 130, 246) !important;
  }
`;

export function DebugPanel() {
  const { data: session, status } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const pathname = usePathname();

  const getRouteType = (path: string) => {
    if (path.startsWith(apiAuthPrefix)) return "API Auth";
    if (publicRoutes.includes(path)) return "Public";
    if (authRoutes.includes(path)) return "Auth";
    return "Protected";
  };

  const handleCopyToken = (token: string, type: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(type);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const shouldExpandNode = () => {
    return true; // Always expand nodes
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
                  getRouteType(pathname) === 'Protected' 
                    ? 'bg-green-50 text-green-800 ring-1 ring-inset ring-green-600/20' 
                    : getRouteType(pathname) === 'Public'
                    ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20'
                    : getRouteType(pathname) === 'Auth'
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
                  <p className="text-gray-600">User ID:</p>
                  <p className="break-all">{session.userId || 'N/A'}</p>
                  <p className="text-gray-600">Role:</p>
                  <p className="break-all">{session.role || 'N/A'}</p>
                  <p className="text-gray-600">Groups:</p>
                  <div className="text-sm font-mono bg-gray-50 p-2 rounded-md">
                    {session.profile?.groups?.sort()?.map((group, index) => (
                      <div key={index} className="text-gray-800">
                        {group}
                      </div>
                    )) || 'N/A'}
                  </div>
                  <p className="text-gray-600">Custom Roles:</p>
                  <div className="text-sm font-mono bg-gray-50 p-2 rounded-md max-h-40 overflow-y-auto">
                    {session.profile?.realm_access?.roles
                      ?.filter(role => role.startsWith('ROLE_'))
                      ?.sort()
                      ?.map((role, index) => (
                        <div key={index} className="text-gray-800">
                          {role}
                        </div>
                      )) || 'N/A'}
                  </div>
                  <p className="text-gray-600">System Roles:</p>
                  <div className="text-sm font-mono bg-gray-50 p-2 rounded-md max-h-40 overflow-y-auto">
                    {session.profile?.realm_access?.roles
                      ?.filter(role => !role.startsWith('ROLE_'))
                      ?.sort()
                      ?.map((role, index) => (
                        <div key={index} className="text-gray-800">
                          {role}
                        </div>
                      )) || 'N/A'}
                  </div>
                  <p className="text-gray-600">Provider:</p>
                  <p className="break-all">{session.provider || 'N/A'}</p>
                  <p className="text-gray-600">Provider ID:</p>
                  <p className="break-all">{session.providerAccountId || 'N/A'}</p>
                  <p className="text-gray-600">Token Type:</p>
                  <p className="break-all">{session.tokenType || 'N/A'}</p>
                  <p className="text-gray-600">Scope:</p>
                  <p className="break-all">{session.scope || 'N/A'}</p>
                  <p className="text-gray-600">Expires At:</p>
                  <p className="break-all">
                    {session.expiresAt 
                      ? new Date(session.expiresAt * 1000).toLocaleString()
                      : 'N/A'
                    }
                  </p>
                  <p className="text-gray-600">Session State:</p>
                  <p className="break-all">{session.profile?.session_state || 'N/A'}</p>
                  <p className="text-gray-600">Access Token:</p>
                  <div className="group relative">
                    <p className="break-all line-clamp-1 group-hover:text-gray-400 transition-colors duration-200">
                      {session.accessToken || 'N/A'}
                    </p>
                    {session.accessToken && (
                      <button
                        onClick={() => handleCopyToken(session.accessToken || '', 'access')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white/90 px-2 py-1 rounded text-sm text-gray-600 hover:text-gray-900"
                      >
                        {copiedToken === 'access' ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-green-500"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <span className="text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
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
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600">ID Token:</p>
                  <div className="group relative">
                    <p className="break-all line-clamp-1 group-hover:text-gray-400 transition-colors duration-200">
                      {session.idToken || 'N/A'}
                    </p>
                    {session.idToken && (
                      <button
                        onClick={() => handleCopyToken(session.idToken || '', 'id')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white/90 px-2 py-1 rounded text-sm text-gray-600 hover:text-gray-900"
                      >
                        {copiedToken === 'id' ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-green-500"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <span className="text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
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
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600">Refresh Token:</p>
                  <div className="group relative">
                    <p className="break-all line-clamp-1 group-hover:text-gray-400 transition-colors duration-200">
                      {session.refreshToken || 'N/A'}
                    </p>
                    {session.refreshToken && (
                      <button
                        onClick={() => handleCopyToken(session.refreshToken || '', 'refresh')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white/90 px-2 py-1 rounded text-sm text-gray-600 hover:text-gray-900"
                      >
                        {copiedToken === 'refresh' ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-green-500"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <span className="text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
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
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full py-3 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 12v5h16a2 2 0 0 1 0 4H3v-4" />
                </svg>
                <span className="text-sm text-gray-600">View Raw Session Data</span>
              </Button>
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
                  <style>{customStyles}</style>
                  {session && (
                    <JsonView 
                      data={session} 
                      style={darkStyles}
                      shouldExpandNode={shouldExpandNode}
                    />
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}

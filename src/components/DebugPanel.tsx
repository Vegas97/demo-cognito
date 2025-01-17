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
import { TokenTimers } from "./TokenTimer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const darkStyles = {
  container: "bg-gray-900 text-gray-100",
  basicChildStyle: "bg-gray-900 text-gray-100",
  bigBrace: "text-gray-100",
  brace: "text-gray-100",
  colon: "text-gray-100",
  comma: "text-gray-100",
  objectKey: "text-blue-400",
  nullValue: "text-gray-500",
  primitiveValue: "text-green-400",
  primitiveString: "text-yellow-400",
  ellipsis: "text-gray-500",
};

export function DebugPanel() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    // Try to get the saved tab from localStorage, default to "routes"
    if (typeof window !== 'undefined') {
      return localStorage.getItem('debugPanelTab') || 'routes';
    }
    return 'routes';
  });

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isApiAuthRoute = pathname?.startsWith(apiAuthPrefix) ?? false;

  const routeType = isPublicRoute
    ? 'Public'
    : isAuthRoute
    ? 'Auth'
    : isApiAuthRoute
    ? 'API Auth'
    : 'Protected';

  const shouldExpandNode = (keyPath: string[], value: unknown) => {
    return true; // Always expand nodes
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('debugPanelTab', value);
  };

  return (
    <div className="h-full overflow-hidden relative">
      <div className="h-full overflow-y-auto px-6 py-6 bg-gray-50 space-y-6 pb-16">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="routes">Routes & Auth</TabsTrigger>
            <TabsTrigger value="session">User & Session</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routes" className="space-y-6 mt-6">
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Route Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Current Path:</p>
                  <p className="font-mono text-sm">{pathname}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Route Type:</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    routeType === 'Protected'
                      ? 'bg-green-100 text-green-800'
                      : routeType === 'Public'
                      ? 'bg-blue-100 text-blue-800'
                      : routeType === 'Auth'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {routeType}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Authentication Status</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Is Authenticated:</p>
                  <div className="flex items-center">
                    {session ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium">{session ? 'authenticated' : 'unauthenticated'}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Auth Method:</p>
                  <p className="font-medium">Next Auth</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Auth Configuration</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Provider:</p>
                  <p className="font-medium">Keycloak</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Client ID:</p>
                  <p className="font-medium">nextjs</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Issuer:</p>
                  <p className="break-all text-sm">http://localhost:8080/realms/demorealm</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="session" className="space-y-6 mt-6">
            {session && (
              <>
                <div className="bg-white shadow rounded-lg p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">User Information</h2>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Info</h3>
                    <div className="grid grid-cols-[30%_1fr] gap-x-4">
                      <p className="text-gray-600">Name:</p>
                      <p className="break-all">{session.user.name || 'N/A'}</p>
                      <p className="text-gray-600">Username:</p>
                      <p className="break-all">{session.user.username || 'N/A'}</p>
                      <p className="text-gray-600">Email:</p>
                      <p className="break-all">{session.user.email || 'N/A'}</p>
                      <p className="text-gray-600">Email Verified:</p>
                      <p className="break-all">{session.user.emailVerified ? 'Yes' : 'No'}</p>
                      <p className="text-gray-600">User ID:</p>
                      <p className="break-all">{session.user.id || 'N/A'}</p>
                      <p className="text-gray-600">Profile Access (Groups):</p>
                      <p className="break-all">{session.user.profileAccess || 'N/A'}</p>
                      <p className="text-gray-600">Custom Roles:</p>
                      <div className="text-sm font-mono bg-gray-50 p-2 rounded-md max-h-40 overflow-y-auto">
                        {session.user.roles?.sort()?.map((role, index) => (
                          <div key={index} className="text-gray-800">
                            {role}
                          </div>
                        )) || 'N/A'}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mt-6">Additional Details</h3>
                    <div className="grid grid-cols-[30%_1fr] gap-x-4">
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
                          : 'N/A'}
                      </p>
                      <p className="text-gray-600">Session State:</p>
                      <p className="break-all">{session.sessionState || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Token Timers</h2>
                  <div className="space-y-2">
                    <TokenTimers session={session} />
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-white border-t shadow-lg z-10">
        <div className="px-0">
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
                  className="lucide lucide-code-2"
                >
                  <path d="m18 16 4-4-4-4" />
                  <path d="m6 8-4 4 4 4" />
                  <path d="m14.5 4-5 16" />
                </svg>
                View Raw Session Data
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-4xl p-6">
                <DrawerTitle>Session Data</DrawerTitle>
                <DrawerDescription>Raw session data from NextAuth.js</DrawerDescription>
                <div className="mt-4 rounded-lg bg-gray-900 p-4 overflow-auto max-h-[60vh]">
                  <JsonView 
                    data={session || {}} 
                    shouldExpandNode={shouldExpandNode} 
                    style={darkStyles}
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}

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
import { X, Copy, Maximize2, Minimize2, ExternalLink } from "lucide-react";

interface DebugSectionProps {
  title: string;
  data: unknown;
  onClose?: () => void;
}

function DebugSection({ title, data }: DebugSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <div className="border rounded-lg p-4 bg-background shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-foreground">{title}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
          <JsonView data={data} style={{ background: 'transparent' }} />
        </div>
      )}
    </div>
  );
}

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('debugPanelTab', value);
  };

  // Monokai-inspired theme
  const darkStyles = {
    container: "bg-[#1e1e1e] text-[#f8f8f2]",
    basicChildStyle: "bg-[#1e1e1e] text-[#f8f8f2] pl-4",
    advancedChildStyle: "bg-[#1e1e1e] text-[#f8f8f2]",
    buttonStyle: "text-[#f8f8f2]",
    closeButtonStyle: "text-[#f8f8f2]",
    bigBrace: "text-[#ff79c6] font-medium",
    brace: "text-[#ff79c6] font-medium",
    colon: "text-[#ff79c6]",
    comma: "text-[#ff79c6]",
    label: "text-[#ff9d00] font-semibold",
    objectKey: "text-[#ff9d00] font-semibold",
    nullValue: "text-[#bd93f9] font-medium",
    primitiveValue: "text-[#50fa7b] font-medium",
    primitiveString: "text-[#f1fa8c] font-medium",
    ellipsis: "text-[#6272a4]",
  };

  const [isExpanded, setIsExpanded] = useState(true);

  // Function to copy JSON to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(session, null, 2));
  };

  // Function to open JSON in new tab
  const openInNewTab = () => {
    const jsonString = JSON.stringify(session, null, 2);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Session Data</title>
            <style>
              body { background: #1e1e1e; color: #f8f8f2; font-family: monospace; padding: 20px; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${jsonString}</pre>
          </body>
        </html>
      `);
    }
  };

  // Function to determine node expansion
  const shouldExpandNode = (level: number) => {
    if (isExpanded) {
      return true;
    }
    // When collapsed, only show first level objects/arrays
    return level === 0;
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
          {session ? (
            <div className="space-y-6 p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Debug Information</h2>
              
              {/* Token Timers */}
              <div className="bg-white shadow-sm rounded-lg p-6 border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Token Timers</h3>
                <TokenTimers session={session} />
              </div>

              {/* User Information */}
              <DebugSection
                title="User Information"
                data={session.user}
              />

              {/* Token Information */}
              <DebugSection
                title="Token Information"
                data={session.tokens}
              />

              {/* Timing Information */}
              <DebugSection
                title="Timing Information"
                data={session.timing}
              />

              {/* Extra Information */}
              <DebugSection
                title="Extra Information"
                data={session.extra}
              />
            </div>
          ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Signed In</h3>
                <p className="text-gray-600">Sign in to view session information and debug data.</p>
              </div>
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
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <DrawerTitle>Session Data</DrawerTitle>
                    <DrawerDescription>Raw session data from NextAuth.js</DrawerDescription>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-2 hover:bg-[#2a2a2a] rounded-md text-gray-400 hover:text-white transition-colors"
                      title={isExpanded ? "Collapse All" : "Expand All"}
                    >
                      {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-[#2a2a2a] rounded-md text-gray-400 hover:text-white transition-colors"
                      title="Copy to Clipboard"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={openInNewTab}
                      className="p-2 hover:bg-[#2a2a2a] rounded-md text-gray-400 hover:text-white transition-colors"
                      title="Open in New Tab"
                    >
                      <ExternalLink size={18} />
                    </button>
                    <DrawerClose className="p-2 hover:bg-[#2a2a2a] rounded-md text-gray-400 hover:text-white transition-colors">
                      <X size={18} />
                    </DrawerClose>
                  </div>
                </div>
                <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg overflow-auto max-h-[60vh]">
                  <JsonView 
                    data={session || {}} 
                    shouldExpandNode={shouldExpandNode}
                    style={darkStyles}
                  />
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}

'use client';

import { DebugPanel } from '@/components/DebugPanel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function ResizableLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen"
    >
      <ResizablePanel defaultSize={55} minSize={30}>
        {children}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={45} minSize={30}>
        <DebugPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

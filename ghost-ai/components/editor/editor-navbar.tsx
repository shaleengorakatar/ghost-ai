"use client";

import { PanelLeftClose, PanelLeftOpen, Share2, PanelRightOpen, PanelRightClose } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  projectName?: string;
  aiSidebarOpen?: boolean;
  onToggleAISidebar?: () => void;
}

export function EditorNavbar({
  sidebarOpen,
  onToggleSidebar,
  projectName,
  aiSidebarOpen,
  onToggleAISidebar,
}: EditorNavbarProps) {
  return (
    <header className="fixed top-0 inset-x-0 h-12 z-50 flex items-center justify-between px-3 bg-background border-b border-border">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        {projectName && (
          <span className="text-sm font-medium truncate max-w-[200px]">{projectName}</span>
        )}
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        {onToggleAISidebar && (
          <>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" disabled>
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAISidebar}
              aria-label={aiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            >
              {aiSidebarOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          </>
        )}
        <UserButton />
      </div>
    </header>
  );
}

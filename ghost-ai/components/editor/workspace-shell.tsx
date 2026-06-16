"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Share2, PanelLeftClose, PanelLeftOpen, LayoutTemplate } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { AISidebar } from "@/components/editor/ai-sidebar";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { useProjectActions, Project } from "@/hooks/use-project-actions";
import type { SaveStatus } from "@/hooks/use-autosave";

interface WorkspaceShellProps {
  project: { id: string; name: string; ownerId: string };
  initialProjects: Project[];
  isOwner: boolean;
}

export function WorkspaceShell({ project, initialProjects, isOwner }: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSidebarOpen, setAISidebarOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateToLoad, setTemplateToLoad] = useState<{ template: CanvasTemplate; ts: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveFnRef = useRef<(() => void) | null>(null);
  const handleSaveFn = useCallback((fn: () => void) => { saveFnRef.current = fn; }, []);

  useEffect(() => {
    if (saveStatus === "saved" || saveStatus === "error") {
      const t = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  const actions = useProjectActions(initialProjects);

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* Navbar */}
      <header className="h-12 shrink-0 flex items-center justify-between px-3 border-b border-border z-50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold">{project.name}</span>
            <span className="text-[11px] text-muted-foreground">Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setTemplatesOpen(true)}>
            <LayoutTemplate className="h-3.5 w-3.5" />
            Templates
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs min-w-[60px]"
            onClick={() => saveFnRef.current?.()}
            disabled={saveStatus === "saving"}
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Error" : "Save"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShareOpen(true)}>
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <button
            onClick={() => setAISidebarOpen((o) => !o)}
            aria-label="Toggle AI sidebar"
            className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
              aiSidebarOpen
                ? "bg-[#0d9488] text-white hover:bg-[#0f766e]"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI
          </button>
          <UserButton />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewProject={actions.openCreate}
          onRename={actions.openRename}
          onDelete={actions.openDelete}
          projects={actions.projects}
          activeProjectId={project.id}
        />

        {/* Canvas */}
        <main className="flex-1 min-w-0 relative overflow-hidden bg-[#0d0d0f] m-2 rounded-xl">
          <CanvasWrapper roomId={project.id} templateToLoad={templateToLoad} onSaveStatus={setSaveStatus} onSaveFn={handleSaveFn} />
          <AISidebar open={aiSidebarOpen} onClose={() => setAISidebarOpen(false)} />
        </main>
      </div>

      <CreateProjectDialog {...actions} />
      <RenameProjectDialog {...actions} />
      <DeleteProjectDialog {...actions} />
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectId={project.id}
        isOwner={isOwner}
      />
      <StarterTemplatesModal
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onImport={(template) => setTemplateToLoad({ template, ts: Date.now() })}
      />
    </div>
  );
}

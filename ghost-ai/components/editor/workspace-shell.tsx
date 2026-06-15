"use client";

import { useState } from "react";
import { Compass, Sparkles, Share2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { useProjectActions, Project } from "@/hooks/use-project-actions";

interface WorkspaceShellProps {
  project: { id: string; name: string; ownerId: string };
  initialProjects: Project[];
  isOwner: boolean;
}

export function WorkspaceShell({ project, initialProjects, isOwner }: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSidebarOpen, setAISidebarOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
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
        <main className="flex-1 min-w-0 relative overflow-hidden bg-[#0d0d0f] m-2 rounded-xl flex items-center justify-center">
          {/* Radial glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.08)_0%,transparent_70%)]" />
          </div>

          <div className="relative flex flex-col items-center gap-4 text-center px-6 max-w-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#0d9488]/40 bg-[#0d9488]/10">
              <Compass className="h-7 w-7 text-[#2dd4bf]" />
            </div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Workspace Shell
            </p>
            <h1 className="text-2xl font-semibold leading-snug">
              Canvas and collaboration tooling land here next.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This room is ready for the shared architecture canvas, durable AI workflows, and
              real-time presence. For now, the shell is wired with project context and navigation
              only.
            </p>
          </div>
        </main>

        {/* AI Sidebar */}
        {aiSidebarOpen && (
          <aside className="w-72 shrink-0 m-2 ml-0 flex flex-col gap-3 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">AI Copilot</p>
                <p className="text-[11px] text-muted-foreground">Placeholder panel</p>
              </div>
              <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5" />
            </div>

            <div className="rounded-xl border border-border bg-card p-4 flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Chat surface pending</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The toggle is wired. Messaging and generation are intentionally out of scope here.
                </p>
              </div>
            </div>

            <div className="mt-auto rounded-xl border border-border bg-card p-4 space-y-1.5">
              <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                Future Hooks
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prompt composer, run status, and architecture guidance will attach to this sidebar.
              </p>
            </div>
          </aside>
        )}
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
    </div>
  );
}

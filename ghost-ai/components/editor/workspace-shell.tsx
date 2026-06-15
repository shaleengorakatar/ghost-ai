"use client";

import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { useProjectActions, Project } from "@/hooks/use-project-actions";

interface WorkspaceShellProps {
  project: { id: string; name: string };
  initialProjects: Project[];
}

export function WorkspaceShell({ project, initialProjects }: WorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiSidebarOpen, setAISidebarOpen] = useState(false);
  const actions = useProjectActions(initialProjects);

  return (
    <>
      <EditorNavbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        projectName={project.name}
        aiSidebarOpen={aiSidebarOpen}
        onToggleAISidebar={() => setAISidebarOpen((o) => !o)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewProject={actions.openCreate}
        onRename={actions.openRename}
        onDelete={actions.openDelete}
        projects={actions.projects}
        activeProjectId={project.id}
      />

      <div className="pt-12 h-dvh flex overflow-hidden">
        <main className="flex-1 bg-[#111111] flex items-center justify-center min-w-0">
          <p className="text-sm text-muted-foreground select-none">Canvas coming soon</p>
        </main>

        {aiSidebarOpen && (
          <aside className="w-80 shrink-0 border-l border-border bg-card flex items-center justify-center">
            <p className="text-sm text-muted-foreground select-none">AI chat coming soon</p>
          </aside>
        )}
      </div>

      <CreateProjectDialog {...actions} />
      <RenameProjectDialog {...actions} />
      <DeleteProjectDialog {...actions} />
    </>
  );
}

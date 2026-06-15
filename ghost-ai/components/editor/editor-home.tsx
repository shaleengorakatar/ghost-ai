"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { Button } from "@/components/ui/button";
import { useProjectActions, Project } from "@/hooks/use-project-actions";

interface EditorHomeProps {
  initialProjects: Project[];
}

export function EditorHome({ initialProjects }: EditorHomeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const actions = useProjectActions(initialProjects);

  return (
    <>
      <EditorNavbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewProject={actions.openCreate}
        onRename={actions.openRename}
        onDelete={actions.openDelete}
        projects={actions.projects}
      />

      <main className="pt-12 min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create a project or open an existing one
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button onClick={actions.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>

      <CreateProjectDialog {...actions} />
      <RenameProjectDialog {...actions} />
      <DeleteProjectDialog {...actions} />
    </>
  );
}

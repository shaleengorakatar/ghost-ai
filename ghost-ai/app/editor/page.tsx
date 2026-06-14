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
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dialogs = useProjectDialogs();

  return (
    <>
      <EditorNavbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewProject={dialogs.openCreate}
        onRename={dialogs.openRename}
        onDelete={dialogs.openDelete}
      />

      <main className="pt-12 min-h-dvh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create a project or open an existing one
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button onClick={dialogs.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>

      <CreateProjectDialog {...dialogs} />
      <RenameProjectDialog {...dialogs} />
      <DeleteProjectDialog {...dialogs} />
    </>
  );
}

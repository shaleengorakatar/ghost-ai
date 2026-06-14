"use client";

import { X, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/hooks/use-project-dialogs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewProject: () => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
  projects: Project[];
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  onRename,
  onDelete,
  projects,
}: ProjectSidebarProps) {
  const myProjects = projects.filter((p) => p.owned);
  const sharedProjects = projects.filter((p) => !p.owned);
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 hidden sm:block"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-12 left-0 h-[calc(100dvh-3rem)] w-72 z-50 flex flex-col bg-card border-r border-border transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">Projects</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-4 mt-3">
            <TabsTrigger value="my-projects" className="flex-1">My Projects</TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">Shared</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="flex-1 overflow-hidden">
            {myProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No projects yet.</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <ul className="px-2 py-2 space-y-0.5">
                  {myProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ))}
                </ul>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="shared" className="flex-1 overflow-hidden">
            {sharedProjects.length === 0 ? (
              <div className="flex flex-1 items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Nothing shared with you yet.</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <ul className="px-2 py-2 space-y-0.5">
                  {sharedProjects.map((project) => (
                    <ProjectItem key={project.id} project={project} />
                  ))}
                </ul>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-border">
          <Button className="w-full gap-2" onClick={onNewProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}

interface ProjectItemProps {
  project: Project;
  onRename?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

function ProjectItem({ project, onRename, onDelete }: ProjectItemProps) {
  return (
    <li className="group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer">
      <span className="flex-1 text-sm truncate">{project.name}</span>
      {project.owned && onRename && onDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                aria-label="Project actions"
              />
            }
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRename(project)}>
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

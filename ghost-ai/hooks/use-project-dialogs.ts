"use client";

import { useState } from "react";

export interface Project {
  id: string;
  name: string;
  owned: boolean;
}

const INITIAL_PROJECTS: Project[] = [
  { id: "1", name: "My Architecture", owned: true },
  { id: "2", name: "Cloud Infra Design", owned: true },
  { id: "3", name: "Shared Diagram", owned: false },
];

type DialogType = "create" | "rename" | "delete" | null;

export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setNameInput("");
    setTargetProject(null);
    setDialog("create");
  }

  function openRename(project: Project) {
    setNameInput(project.name);
    setTargetProject(project);
    setDialog("rename");
  }

  function openDelete(project: Project) {
    setTargetProject(project);
    setDialog("delete");
  }

  function close() {
    setDialog(null);
    setTargetProject(null);
    setNameInput("");
  }

  function handleCreate() {
    setLoading(true);
    setTimeout(() => {
      setProjects((prev) => [
        ...prev,
        { id: Date.now().toString(), name: nameInput.trim(), owned: true },
      ]);
      setLoading(false);
      close();
    }, 400);
  }

  function handleRename() {
    setLoading(true);
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === targetProject?.id ? { ...p, name: nameInput.trim() } : p
        )
      );
      setLoading(false);
      close();
    }, 400);
  }

  function handleDelete() {
    setLoading(true);
    setTimeout(() => {
      setProjects((prev) => prev.filter((p) => p.id !== targetProject?.id));
      setLoading(false);
      close();
    }, 400);
  }

  const slug = nameInput
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    projects,
    dialog,
    targetProject,
    nameInput,
    setNameInput,
    loading,
    slug,
    openCreate,
    openRename,
    openDelete,
    close,
    handleCreate,
    handleRename,
    handleDelete,
  };
}

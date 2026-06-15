"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface Project {
  id: string;
  name: string;
  owned: boolean;
}

type DialogType = "create" | "rename" | "delete" | null;

export function useProjectActions(initialProjects: Project[]) {
  const router = useRouter();
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [targetProject, setTargetProject] = useState<Project | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomSuffix, setRoomSuffix] = useState(() => Math.random().toString(36).slice(2, 7));

  function openCreate() {
    setNameInput("");
    setTargetProject(null);
    setRoomSuffix(Math.random().toString(36).slice(2, 7));
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
    setError(null);
  }

  const slug = nameInput
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const roomId = slug ? `${slug}-${roomSuffix}` : "";

  async function handleCreate() {
    if (!slug) return;
    const id = roomId;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim(), roomId: id }),
      });
      if (res.ok) {
        close();
        router.push(`/editor/${id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create project");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRename() {
    if (!targetProject) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${targetProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === targetProject.id ? { ...p, name: nameInput.trim() } : p
          )
        );
        close();
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to rename project");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!targetProject) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${targetProject.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== targetProject.id));
        close();
        if (pathname?.includes(targetProject.id)) {
          router.push("/editor");
        } else {
          router.refresh();
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete project");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    projects,
    dialog,
    targetProject,
    nameInput,
    setNameInput,
    loading,
    error,
    slug,
    roomId,
    openCreate,
    openRename,
    openDelete,
    close,
    handleCreate,
    handleRename,
    handleDelete,
  };
}

"use client";

import { useEffect } from "react";
import type { ReactFlowInstance, Node, Edge } from "@xyflow/react";

interface KeyboardShortcutsOptions {
  flow: ReactFlowInstance<Node, Edge> | null;
  undo: () => void;
  redo: () => void;
}

function isEditableTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({ flow, undo, redo }: KeyboardShortcutsOptions) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e)) return;

      const meta = e.metaKey || e.ctrlKey;

      if (!meta && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        flow?.zoomIn({ duration: 200 });
        return;
      }
      if (!meta && e.key === "-") {
        e.preventDefault();
        flow?.zoomOut({ duration: 200 });
        return;
      }
      if (meta && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (meta && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo();
        return;
      }
      if (meta && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flow, undo, redo]);
}

"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

type Props = ReturnType<typeof useProjectDialogs>;

export function CreateProjectDialog(props: Props) {
  const { dialog, nameInput, setNameInput, slug, loading, close, handleCreate } = props;

  return (
    <Dialog open={dialog === "create"} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Give your project a name.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Project name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
          />
          {nameInput.trim() && (
            <p className="text-xs text-muted-foreground">
              Slug: <span className="font-mono">{slug}</span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!nameInput.trim() || !slug || loading}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RenameProjectDialog(props: Props) {
  const { dialog, targetProject, nameInput, setNameInput, loading, close, handleRename } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialog === "rename") {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [dialog]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && nameInput.trim()) handleRename();
  }

  return (
    <Dialog open={dialog === "rename"} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Renaming &ldquo;{targetProject?.name}&rdquo;.
          </DialogDescription>
        </DialogHeader>
        <Input
          ref={inputRef}
          placeholder="Project name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={!nameInput.trim() || loading}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteProjectDialog(props: Props) {
  const { dialog, targetProject, loading, close, handleDelete } = props;

  return (
    <Dialog open={dialog === "delete"} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{targetProject?.name}&rdquo;? This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Link, Loader2, Trash2, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Member {
  email: string;
  name: string;
  avatar: string | null;
}

interface Collaborator extends Member {
  id: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  isOwner: boolean;
}

function RoleBadge({ role }: { role: "Owner" | "Editor" }) {
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
      {role}
    </span>
  );
}

function MemberRow({
  member,
  role,
  onRemove,
  removing,
  canRemove,
}: {
  member: Member & { id?: string };
  role: "Owner" | "Editor";
  onRemove?: () => void;
  removing?: boolean;
  canRemove: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      <Avatar className="h-7 w-7 shrink-0">
        {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
        <AvatarFallback className="text-[10px]">
          {member.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-none truncate">{member.name}</p>
        {member.name !== member.email && (
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        )}
      </div>
      <RoleBadge role={role} />
      {canRemove && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          disabled={removing}
          onClick={onRemove}
          aria-label={`Remove ${member.name}`}
        >
          {removing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </li>
  );
}

export function ShareDialog({ open, onOpenChange, projectId, isOwner }: ShareDialogProps) {
  const [owner, setOwner] = useState<Member | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchCollaborators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setOwner(data.owner);
        setCollaborators(data.collaborators);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      fetchCollaborators();
      setInviteEmail("");
      setInviteError(null);
    }
  }, [open, fetchCollaborators]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError(null);
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to invite");
      } else {
        setInviteEmail("");
        await fetchCollaborators();
      }
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(collaboratorId: string) {
    setRemovingId(collaboratorId);
    try {
      await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId }),
      });
      await fetchCollaborators();
    } finally {
      setRemovingId(null);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasMembers = owner || collaborators.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
        </DialogHeader>

        {/* Copy link */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground truncate">
            <Link className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {typeof window !== "undefined"
                ? `${window.location.origin}/editor/${projectId}`
                : ""}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {/* Invite form (owner only) */}
        {isOwner && (
          <form onSubmit={handleInvite} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="email"
                placeholder="Invite by email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  setInviteError(null);
                }}
                className="flex-1 h-9 text-sm"
                disabled={inviting}
              />
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 h-9"
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
                Invite
              </Button>
            </div>
            {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
          </form>
        )}

        {/* People list */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            People with access
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {owner && (
                <MemberRow
                  member={owner}
                  role="Owner"
                  canRemove={false}
                />
              )}
              {collaborators.map((c) => (
                <MemberRow
                  key={c.id}
                  member={c}
                  role="Editor"
                  canRemove={isOwner}
                  removing={removingId === c.id}
                  onRemove={() => handleRemove(c.id)}
                />
              ))}
              {!hasMembers && (
                <li className="text-xs text-muted-foreground py-1">No members yet.</li>
              )}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

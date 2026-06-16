"use client";

import { useOthers, useSelf } from "@liveblocks/react";
import { UserButton } from "@clerk/nextjs";

export function PresenceAvatars() {
  const self = useSelf();
  const others = useOthers();

  // Exclude the current user from the collaborator list
  const collaborators = others.filter((o) => o.id !== self?.id);
  const visible = collaborators.slice(0, 5);
  const overflow = collaborators.length - visible.length;

  return (
    <div className="flex items-center gap-2">
      {collaborators.length > 0 && (
        <>
          <div className="flex items-center">
            {visible.map((other, i) => (
              <CollaboratorAvatar
                key={other.connectionId}
                name={other.info?.name ?? ""}
                avatar={other.info?.avatar ?? ""}
                color={other.info?.cursorColor ?? "#6366f1"}
                offset={i}
              />
            ))}
            {overflow > 0 && (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0d0d0f] bg-white/10 text-[10px] font-medium text-white/70"
                style={{ zIndex: 10, marginLeft: -8 }}
              >
                +{overflow}
              </div>
            )}
          </div>
          <div className="h-4 w-px bg-white/20" />
        </>
      )}
      <UserButton />
    </div>
  );
}

function CollaboratorAvatar({
  name,
  avatar,
  color,
  offset,
}: {
  name: string;
  avatar: string;
  color: string;
  offset: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      title={name}
      style={{
        zIndex: offset,
        marginLeft: offset === 0 ? 0 : -8,
        boxShadow: `0 0 0 2px #0d0d0f, 0 0 0 3px ${color}44`,
      }}
      className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full"
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-[10px] font-semibold"
          style={{ background: color + "33", color }}
        >
          {initials || "?"}
        </div>
      )}
    </div>
  );
}

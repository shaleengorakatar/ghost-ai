"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";

function ShapeOutline({
  shape,
  selected,
  color,
}: {
  shape: string;
  selected: boolean;
  color?: string;
}) {
  const stroke = selected ? "#6366f1" : (color ?? "#4b5563");
  const fill = "#1e1e24";
  const sw = selected ? 2 : 1.5;

  if (shape === "circle") {
    return (
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <ellipse
          cx="50%"
          cy="50%"
          rx="calc(50% - 1px)"
          ry="calc(50% - 1px)"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        {selected && (
          <ellipse cx="50%" cy="50%" rx="calc(50% - 1px)" ry="calc(50% - 1px)" fill="none" stroke="#6366f1" strokeWidth={4} strokeOpacity={0.3} />
        )}
      </svg>
    );
  }

  if (shape === "diamond") {
    return (
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <polygon
          points="50%,2 calc(100% - 2px),50% 50%,calc(100% - 2px) 2px,50%"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }

  if (shape === "pill") {
    return (
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="9999"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }

  if (shape === "cylinder") {
    return (
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }} preserveAspectRatio="none">
        <rect x="1" y="12%" width="calc(100% - 2px)" height="76%" fill={fill} stroke="none" />
        <ellipse cx="50%" cy="88%" rx="calc(50% - 1px)" ry="12%" fill={fill} stroke={stroke} strokeWidth={sw} />
        <line x1="1" y1="12%" x2="1" y2="88%" stroke={stroke} strokeWidth={sw} />
        <line x1="calc(100% - 1px)" y1="12%" x2="calc(100% - 1px)" y2="88%" stroke={stroke} strokeWidth={sw} />
        <ellipse cx="50%" cy="12%" rx="calc(50% - 1px)" ry="12%" fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  }

  if (shape === "hexagon") {
    return (
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }} viewBox="0 0 120 104" preserveAspectRatio="none">
        <polygon
          points="30,2 90,2 118,52 90,102 30,102 2,52"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw * 1.5}
        />
      </svg>
    );
  }

  // default: rectangle
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <rect
        x="1"
        y="1"
        width="calc(100% - 2px)"
        height="calc(100% - 2px)"
        rx="4"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />
      {selected && (
        <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="4" fill="none" stroke="#6366f1" strokeWidth={4} strokeOpacity={0.3} />
      )}
    </svg>
  );
}

export function CanvasNodeRenderer({ id, data, selected }: NodeProps<CanvasNode>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateNodeData } = useReactFlow();

  useEffect(() => {
    if (!editing) setDraft(data.label ?? "");
  }, [data.label, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitLabel = useCallback(() => {
    setEditing(false);
    updateNodeData(id, { label: draft });
  }, [draft, id, updateNodeData]);

  const shape = data.shape ?? "rectangle";

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      style={{ position: "relative", width: "100%", height: "100%", minWidth: 80, minHeight: 40 }}
    >
      <ShapeOutline shape={shape} selected={!!selected} color={data.color} />

      <Handle type="target" position={Position.Top} style={{ background: "rgba(255,255,255,0.3)", border: "none" }} />
      <Handle type="source" position={Position.Bottom} style={{ background: "rgba(255,255,255,0.3)", border: "none" }} />
      <Handle type="target" position={Position.Left} style={{ background: "rgba(255,255,255,0.3)", border: "none" }} />
      <Handle type="source" position={Position.Right} style={{ background: "rgba(255,255,255,0.3)", border: "none" }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 8px",
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitLabel}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitLabel();
              if (e.key === "Escape") { setEditing(false); setDraft(data.label ?? ""); }
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e5e7eb",
              fontSize: 13,
              textAlign: "center",
              width: "100%",
              caretColor: "#6366f1",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 13,
              color: data.label ? "#e5e7eb" : "rgba(255,255,255,0.25)",
              fontStyle: data.label ? "normal" : "italic",
              userSelect: "none",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            {data.label || "label"}
          </span>
        )}
      </div>
    </div>
  );
}

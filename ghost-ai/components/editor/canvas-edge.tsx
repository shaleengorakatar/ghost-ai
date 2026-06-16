"use client";

import { useState, useRef, useEffect, useCallback, useContext } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
} from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import type { CanvasEdge } from "@/types/canvas";
import { OnEdgesChangeContext } from "@/components/editor/canvas-context";

export function CanvasEdgeRenderer({
  id,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data?.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const onEdgesChange = useContext(OnEdgesChangeContext);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const isActive = selected || hovered;
  const strokeColor = isActive ? "rgba(160,160,180,0.9)" : "rgba(120,120,140,0.45)";

  useEffect(() => {
    if (!editing) setDraft(data?.label ?? "");
  }, [data?.label, editing]);

  useEffect(() => {
    if (editing) requestAnimationFrame(() => inputRef.current?.focus());
  }, [editing]);

  const commitLabel = useCallback(() => {
    setEditing(false);
    onEdgesChange?.([{
      type: "replace",
      id,
      item: {
        id,
        source,
        target,
        sourceHandle: sourceHandleId ?? null,
        targetHandle: targetHandleId ?? null,
        type: "canvasEdge",
        data: { ...data, label: draft.trim() },
        markerEnd,
      } as CanvasEdge,
    }]);
  }, [id, source, target, sourceHandleId, targetHandleId, data, draft, markerEnd, onEdgesChange]);

  const label = data?.label ?? "";
  const showHint = isActive && !label && !editing;

  return (
    <>
      {/* Wide invisible hit area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        style={{ cursor: "pointer" }}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: 1.5,
          strokeLinecap: "round",
          transition: "stroke 0.15s ease",
          pointerEvents: "none",
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nopan"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitLabel(); }
                if (e.key === "Escape") { setEditing(false); setDraft(data?.label ?? ""); }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#18181c",
                border: "1px solid rgba(99,102,241,0.5)",
                borderRadius: 9999,
                color: "#e2e2e8",
                fontSize: 13,
                padding: "2px 8px",
                outline: "none",
                width: Math.max(60, draft.length * 8 + 20),
                textAlign: "center",
                fontFamily: "inherit",
              }}
            />
          ) : label ? (
            <span
              style={{
                background: "#18181c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 9999,
                color: "#a0a0b0",
                fontSize: 13,
                padding: "2px 8px",
                userSelect: "none",
                whiteSpace: "nowrap",
                cursor: "pointer",
                display: "block",
              }}
            >
              {label}
            </span>
          ) : showHint ? (
            <span
              style={{
                color: "rgba(160,160,180,0.35)",
                fontSize: 11,
                userSelect: "none",
                whiteSpace: "nowrap",
                cursor: "text",
                fontStyle: "italic",
              }}
            >
              label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

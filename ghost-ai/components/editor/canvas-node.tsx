"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, NodeResizer, useReactFlow, useStoreApi } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { NODE_COLORS, DEFAULT_NODE_COLOR } from "@/types/canvas";

function ColorToolbar({
  activeBg,
  onSelect,
}: {
  activeBg: string;
  onSelect: (bg: string, text: string) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 5,
        padding: "6px 8px",
        background: "#18181c",
        border: "1px solid #2a2a30",
        borderRadius: 9999,
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        zIndex: 1000,
        pointerEvents: "all",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map((pair) => {
        const isActive = pair.bg === activeBg;
        return (
          <button
            key={pair.bg}
            title={pair.bg}
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onClick={(e) => { e.stopPropagation(); onSelect(pair.bg, pair.text); }}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: pair.bg,
              border: isActive ? `2px solid ${pair.text}` : "2px solid transparent",
              cursor: "pointer",
              padding: 0,
              outline: "none",
              flexShrink: 0,
              transition: "box-shadow 0.12s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px ${pair.text}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          />
        );
      })}
    </div>
  );
}

function ShapeOutline({
  shape,
  selected,
  bgColor,
  children,
}: {
  shape: string;
  selected: boolean;
  bgColor: string;
  children: React.ReactNode;
}) {
  const stroke = selected ? "#6366f1" : "#4b5563";
  const sw = selected ? 2 : 1.5;
  const glowStyle = selected ? { boxShadow: "0 0 0 3px rgba(99,102,241,0.3)" } : {};

  if (shape === "rectangle") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 4,
          border: `${sw}px solid ${stroke}`,
          background: bgColor,
          ...glowStyle,
        }}
      >
        {children}
      </div>
    );
  }

  if (shape === "pill") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 9999,
          border: `${sw}px solid ${stroke}`,
          background: bgColor,
          ...glowStyle,
        }}
      >
        {children}
      </div>
    );
  }

  if (shape === "circle") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `${sw}px solid ${stroke}`,
          background: bgColor,
          ...glowStyle,
        }}
      >
        {children}
      </div>
    );
  }

  if (shape === "diamond") {
    return (
      <div style={{ position: "absolute", inset: 0 }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <polygon
            points="50%,2 calc(100% - 2px),50% 50%,calc(100% - 2px) 2px,50%"
            fill={bgColor}
            stroke={stroke}
            strokeWidth={sw}
          />
          {selected && (
            <polygon
              points="50%,2 calc(100% - 2px),50% 50%,calc(100% - 2px) 2px,50%"
              fill="none"
              stroke="#6366f1"
              strokeWidth={4}
              strokeOpacity={0.3}
            />
          )}
        </svg>
        {children}
      </div>
    );
  }

  if (shape === "cylinder") {
    return (
      <div style={{ position: "absolute", inset: 0 }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }} preserveAspectRatio="none">
          <rect x="1" y="12%" width="calc(100% - 2px)" height="76%" fill={bgColor} stroke="none" />
          <ellipse cx="50%" cy="88%" rx="calc(50% - 1px)" ry="12%" fill={bgColor} stroke={stroke} strokeWidth={sw} />
          <line x1="1" y1="12%" x2="1" y2="88%" stroke={stroke} strokeWidth={sw} />
          <line x1="calc(100% - 1px)" y1="12%" x2="calc(100% - 1px)" y2="88%" stroke={stroke} strokeWidth={sw} />
          <ellipse cx="50%" cy="12%" rx="calc(50% - 1px)" ry="12%" fill={bgColor} stroke={stroke} strokeWidth={sw} />
        </svg>
        {children}
      </div>
    );
  }

  if (shape === "hexagon") {
    return (
      <div style={{ position: "absolute", inset: 0 }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }} viewBox="0 0 120 104" preserveAspectRatio="none">
          <polygon
            points="30,2 90,2 118,52 90,102 30,102 2,52"
            fill={bgColor}
            stroke={stroke}
            strokeWidth={sw * 1.5}
          />
          {selected && (
            <polygon
              points="30,2 90,2 118,52 90,102 30,102 2,52"
              fill="none"
              stroke="#6366f1"
              strokeWidth={6}
              strokeOpacity={0.3}
            />
          )}
        </svg>
        {children}
      </div>
    );
  }

  // fallback: rectangle
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 4,
        border: `${sw}px solid ${stroke}`,
        background: bgColor,
        ...glowStyle,
      }}
    >
      {children}
    </div>
  );
}

const MIN_WIDTH = 80;
const MIN_HEIGHT = 40;

export function CanvasNodeRenderer({ id, data, selected }: NodeProps<CanvasNode>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getNode } = useReactFlow<CanvasNode>();
  const store = useStoreApi<CanvasNode>();

  const bgColor = data.bgColor ?? DEFAULT_NODE_COLOR.bg;
  const textColor = data.textColor ?? DEFAULT_NODE_COLOR.text;

  useEffect(() => {
    if (!editing) setDraft(data.label ?? "");
  }, [data.label, editing]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (editing) {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.select();
      autoResize();
    }
  }, [editing, autoResize]);

  const updateNode = useCallback((patch: Partial<typeof data>) => {
    const node = getNode(id);
    if (!node) return;
    store.getState().triggerNodeChanges([{
      type: "replace",
      id,
      item: { ...node, data: { ...node.data, ...patch } },
    }]);
  }, [id, getNode, store]);

  const commitLabel = useCallback(() => {
    setEditing(false);
    updateNode({ label: draft });
  }, [draft, updateNode]);

  const handleColorSelect = useCallback((bg: string, text: string) => {
    updateNode({ bgColor: bg, textColor: text });
  }, [updateNode]);

  const shape = data.shape ?? "rectangle";

  const handleStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#ffffff",
    border: "1.5px solid #1a1a1f",
    opacity: 0,
    transition: "opacity 0.15s ease",
    zIndex: 10,
  };

  return (
    <div
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className="group/node"
      style={{ position: "relative", width: "100%", height: "100%", minWidth: MIN_WIDTH, minHeight: MIN_HEIGHT, overflow: "visible" }}
    >
      {selected && (
        <ColorToolbar activeBg={bgColor} onSelect={handleColorSelect} />
      )}
      <NodeResizer
        isVisible={!!selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        lineStyle={{ borderColor: "rgba(99,102,241,0.4)" }}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: "#1e1e24",
          border: "1.5px solid #6366f1",
        }}
      />
      <ShapeOutline shape={shape} selected={!!selected} bgColor={bgColor}>
        <Handle type="source" position={Position.Top} id="top" style={handleStyle} className="!opacity-0 group-hover/node:!opacity-100" />
        <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} className="!opacity-0 group-hover/node:!opacity-100" />
        <Handle type="source" position={Position.Left} id="left" style={handleStyle} className="!opacity-0 group-hover/node:!opacity-100" />
        <Handle type="source" position={Position.Right} id="right" style={handleStyle} className="!opacity-0 group-hover/node:!opacity-100" />

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
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => { setDraft(e.target.value); autoResize(); }}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setEditing(false); setDraft(data.label ?? ""); }
                e.stopPropagation();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: textColor,
                fontSize: 13,
                textAlign: "center",
                width: "100%",
                resize: "none",
                overflow: "hidden",
                caretColor: "#6366f1",
                lineHeight: 1.4,
                fontFamily: "inherit",
                display: "block",
                padding: 0,
                margin: 0,
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 13,
                color: data.label ? textColor : "rgba(255,255,255,0.25)",
                fontStyle: data.label ? "normal" : "italic",
                userSelect: "none",
                textAlign: "center",
                pointerEvents: "none",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {data.label || "label"}
            </span>
          )}
        </div>
      </ShapeOutline>
    </div>
  );
}

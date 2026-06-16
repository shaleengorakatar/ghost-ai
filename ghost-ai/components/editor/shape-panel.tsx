"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ShapeType } from "@/types/canvas";

type ShapeDef = {
  type: ShapeType;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  icon: React.ReactNode;
};

const SHAPES: ShapeDef[] = [
  {
    type: "rectangle",
    label: "Rectangle",
    defaultWidth: 160,
    defaultHeight: 80,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="5" width="16" height="10" rx="1" />
      </svg>
    ),
  },
  {
    type: "diamond",
    label: "Diamond",
    defaultWidth: 140,
    defaultHeight: 120,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="10,2 18,10 10,18 2,10" />
      </svg>
    ),
  },
  {
    type: "circle",
    label: "Circle",
    defaultWidth: 100,
    defaultHeight: 100,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="8" />
      </svg>
    ),
  },
  {
    type: "pill",
    label: "Pill",
    defaultWidth: 160,
    defaultHeight: 72,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="16" height="8" rx="4" />
      </svg>
    ),
  },
  {
    type: "cylinder",
    label: "Cylinder",
    defaultWidth: 100,
    defaultHeight: 120,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="10" cy="5" rx="7" ry="2.5" />
        <ellipse cx="10" cy="15" rx="7" ry="2.5" />
        <line x1="3" y1="5" x2="3" y2="15" />
        <line x1="17" y1="5" x2="17" y2="15" />
      </svg>
    ),
  },
  {
    type: "hexagon",
    label: "Hexagon",
    defaultWidth: 120,
    defaultHeight: 120,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="10,1 17.66,5.5 17.66,14.5 10,19 2.34,14.5 2.34,5.5" />
      </svg>
    ),
  },
];

function ShapePreview({ shape, width, height }: { shape: ShapeType; width: number; height: number }) {
  const fill = "rgba(30,30,36,0.85)";
  const stroke = "#6366f1";
  const sw = 1.5;

  if (shape === "rectangle") {
    return (
      <div style={{ width, height, borderRadius: 4, border: `${sw}px solid ${stroke}`, background: fill, opacity: 0.8 }} />
    );
  }
  if (shape === "pill") {
    return (
      <div style={{ width, height, borderRadius: 9999, border: `${sw}px solid ${stroke}`, background: fill, opacity: 0.8 }} />
    );
  }
  if (shape === "circle") {
    return (
      <div style={{ width, height, borderRadius: "50%", border: `${sw}px solid ${stroke}`, background: fill, opacity: 0.8 }} />
    );
  }
  if (shape === "diamond") {
    return (
      <svg width={width} height={height} style={{ opacity: 0.8 }} viewBox={`0 0 ${width} ${height}`}>
        <polygon
          points={`${width / 2},2 ${width - 2},${height / 2} ${width / 2},${height - 2} 2,${height / 2}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  }
  if (shape === "hexagon") {
    return (
      <svg width={width} height={height} style={{ opacity: 0.8 }} viewBox="0 0 120 104" preserveAspectRatio="none">
        <polygon points="30,2 90,2 118,52 90,102 30,102 2,52" fill={fill} stroke={stroke} strokeWidth={2} />
      </svg>
    );
  }
  if (shape === "cylinder") {
    const ry = height * 0.12;
    return (
      <svg width={width} height={height} style={{ opacity: 0.8 }} preserveAspectRatio="none">
        <rect x="1" y={ry} width={width - 2} height={height - ry * 2} fill={fill} stroke="none" />
        <ellipse cx={width / 2} cy={height - ry} rx={width / 2 - 1} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
        <line x1="1" y1={ry} x2="1" y2={height - ry} stroke={stroke} strokeWidth={sw} />
        <line x1={width - 1} y1={ry} x2={width - 1} y2={height - ry} stroke={stroke} strokeWidth={sw} />
        <ellipse cx={width / 2} cy={ry} rx={width / 2 - 1} ry={ry} fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  }
  return null;
}

type DragState = { shape: ShapeDef; x: number; y: number } | null;

export function ShapePanel() {
  const [drag, setDrag] = useState<DragState>(null);
  const dragRef = useRef<DragState>(null);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    function onDragOver(e: DragEvent) {
      if (!dragRef.current) return;
      setDrag((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
    function onDragEnd() {
      setDrag(null);
    }
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragend", onDragEnd);
    window.addEventListener("drop", onDragEnd);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragend", onDragEnd);
      window.removeEventListener("drop", onDragEnd);
    };
  }, []);

  function handleDragStart(e: React.DragEvent, shape: ShapeDef) {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/ghost-shape",
      JSON.stringify({
        shape: shape.type,
        width: shape.defaultWidth,
        height: shape.defaultHeight,
      }),
    );
    // Use blank drag image so our custom preview is the only ghost
    const blank = document.createElement("div");
    blank.style.width = "1px";
    blank.style.height = "1px";
    blank.style.position = "fixed";
    blank.style.top = "-9999px";
    document.body.appendChild(blank);
    e.dataTransfer.setDragImage(blank, 0, 0);
    setTimeout(() => document.body.removeChild(blank), 0);

    setDrag({ shape, x: e.clientX, y: e.clientY });
  }

  return (
    <>
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#1a1a1f]/90 px-3 py-2 shadow-xl backdrop-blur-sm">
          {SHAPES.map((shape) => (
            <button
              key={shape.type}
              draggable
              onDragStart={(e) => handleDragStart(e, shape)}
              title={shape.label}
              className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white active:cursor-grabbing"
            >
              {shape.icon}
            </button>
          ))}
        </div>
      </div>

      {drag &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: drag.x - drag.shape.defaultWidth / 2,
              top: drag.y - drag.shape.defaultHeight / 2,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <ShapePreview
              shape={drag.shape.type}
              width={drag.shape.defaultWidth}
              height={drag.shape.defaultHeight}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

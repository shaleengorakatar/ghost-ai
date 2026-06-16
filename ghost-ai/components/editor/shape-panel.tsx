"use client";

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

export function ShapePanel() {
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
  }

  return (
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
  );
}

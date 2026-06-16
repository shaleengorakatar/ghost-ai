"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates";
import type { CanvasNode, ShapeType } from "@/types/canvas";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

// ── Lightweight SVG preview ──────────────────────────────────────────────────

const VB_W = 400;
const VB_H = 340;
const PAD = 16;

function TemplatePreview({ nodes, edges }: Pick<CanvasTemplate, "nodes" | "edges">) {
  if (nodes.length === 0) return null;

  // Compute bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const node of nodes) {
    const w = (node.width as number) ?? 160;
    const h = (node.height as number) ?? 80;
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + w);
    maxY = Math.max(maxY, node.position.y + h);
  }

  const contentW = maxX - minX || 1;
  const contentH = maxY - minY || 1;
  const scaleX = (VB_W - PAD * 2) / contentW;
  const scaleY = (VB_H - PAD * 2) / contentH;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = PAD + ((VB_W - PAD * 2) - contentW * scale) / 2;
  const offsetY = PAD + ((VB_H - PAD * 2) - contentH * scale) / 2;

  function px(x: number) { return (x - minX) * scale + offsetX; }
  function py(y: number) { return (y - minY) * scale + offsetY; }

  // Build center map for edges
  const centers: Record<string, { cx: number; cy: number }> = {};
  for (const node of nodes) {
    const w = ((node.width as number) ?? 160);
    const h = ((node.height as number) ?? 80);
    centers[node.id] = {
      cx: px(node.position.x + w / 2),
      cy: py(node.position.y + h / 2),
    };
  }

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      className="block rounded-lg"
      style={{ background: "#0d0d0f", aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      {/* Edges first */}
      {edges.map((edge) => {
        const s = centers[edge.source];
        const t = centers[edge.target];
        if (!s || !t) return null;
        return (
          <line
            key={edge.id}
            x1={s.cx} y1={s.cy}
            x2={t.cx} y2={t.cy}
            stroke="rgba(120,120,140,0.5)"
            strokeWidth={1}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const w = ((node.width as number) ?? 160) * scale;
        const h = ((node.height as number) ?? 80) * scale;
        const x = px(node.position.x);
        const y = py(node.position.y);
        const bg = node.data.bgColor ?? "#1f1f1f";
        const stroke = node.data.textColor ?? "#ededed";
        const shape = (node.data.shape ?? "rectangle") as ShapeType;

        return (
          <NodeShape key={node.id} shape={shape} x={x} y={y} w={w} h={h} bg={bg} stroke={stroke} />
        );
      })}
    </svg>
  );
}

function NodeShape({
  shape, x, y, w, h, bg, stroke,
}: {
  shape: ShapeType; x: number; y: number; w: number; h: number; bg: string; stroke: string;
}) {
  const sw = 0.8;

  if (shape === "rectangle") {
    return <rect x={x} y={y} width={w} height={h} rx={2} fill={bg} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />;
  }
  if (shape === "pill") {
    return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={bg} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />;
  }
  if (shape === "circle") {
    const r = Math.min(w, h) / 2;
    return <circle cx={x + w / 2} cy={y + h / 2} r={r} fill={bg} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />;
  }
  if (shape === "diamond") {
    const pts = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
    return <polygon points={pts} fill={bg} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />;
  }
  if (shape === "hexagon") {
    const pts = [
      [x + w * 0.25, y], [x + w * 0.75, y],
      [x + w, y + h / 2], [x + w * 0.75, y + h],
      [x + w * 0.25, y + h], [x, y + h / 2],
    ].map(([a, b]) => `${a},${b}`).join(" ");
    return <polygon points={pts} fill={bg} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />;
  }
  if (shape === "cylinder") {
    const ry = h * 0.15;
    return (
      <g>
        <rect x={x} y={y + ry} width={w} height={h - ry * 2} fill={bg} stroke="none" />
        <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} fill={bg} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />
        <ellipse cx={x + w / 2} cy={y + h - ry} rx={w / 2} ry={ry} fill={bg} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />
        <line x1={x} y1={y + ry} x2={x} y2={y + h - ry} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />
        <line x1={x + w} y1={y + ry} x2={x + w} y2={y + h - ry} stroke={stroke} strokeWidth={sw} strokeOpacity={0.6} />
      </g>
    );
  }
  return null;
}

// ── Modal ────────────────────────────────────────────────────────────────────

export function StarterTemplatesModal({ open, onOpenChange, onImport }: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden" style={{ width: "min(90vw, 1200px)", maxWidth: "none" }}>
        <DialogHeader className="px-8 pt-7 pb-5 border-b border-border">
          <DialogTitle className="text-base font-semibold">Starter Templates</DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pick a template to pre-fill the canvas. Your current diagram will be replaced.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 p-8 max-h-[80vh] overflow-y-auto">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-white/20 transition-colors"
            >
              {/* Preview */}
              <div className="shrink-0 overflow-hidden">
                <TemplatePreview nodes={template.nodes} edges={template.edges} />
              </div>

              {/* Info + button */}
              <div className="flex flex-col gap-2 p-3">
                <div>
                  <p className="text-sm font-medium leading-snug">{template.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                    {template.description}
                  </p>
                </div>
                <button
                  onClick={() => handleImport(template)}
                  className="mt-auto w-full rounded-lg border border-border bg-background py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-white/5 hover:border-white/20"
                >
                  Import
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useCallback, useEffect } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense, useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, useReactFlow, MarkerType, ConnectionMode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { NodeTypes, EdgeTypes, DefaultEdgeOptions } from "@xyflow/react";
import type { CanvasNode, CanvasEdge, ShapeType } from "@/types/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { ShapePanel } from "@/components/editor/shape-panel";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";

const nodeTypes: NodeTypes = {
  canvasNode: CanvasNodeRenderer as NodeTypes["canvasNode"],
};

const edgeTypes: EdgeTypes = {
  canvasEdge: CanvasEdgeRenderer as EdgeTypes["canvasEdge"],
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 12,
    height: 12,
    color: "rgba(120,120,140,0.7)",
  },
};

let nodeCounter = 0;

function generateNodeId(shape: ShapeType): string {
  return `${shape}-${Date.now()}-${++nodeCounter}`;
}

function FlowCanvas({ templateToLoad }: { templateToLoad: { template: CanvasTemplate; ts: number } | null }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const flow = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition, addNodes } = flow;

  useEffect(() => {
    if (!templateToLoad) return;
    flow.setNodes(templateToLoad.template.nodes as CanvasNode[]);
    flow.setEdges(templateToLoad.template.edges as CanvasEdge[]);
    requestAnimationFrame(() => flow.fitView({ duration: 300 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateToLoad?.ts]);
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ flow: flow as never, undo, redo });

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/ghost-shape")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/ghost-shape");
      if (!raw) return;

      const { shape, width, height } = JSON.parse(raw) as {
        shape: ShapeType;
        width: number;
        height: number;
      };

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      const newNode: CanvasNode = {
        id: generateNodeId(shape),
        type: "canvasNode",
        position: {
          x: position.x - width / 2,
          y: position.y - height / 2,
        },
        data: { label: "", shape },
        width,
        height,
      };

      addNodes(newNode);
    },
    [screenToFlowPosition, addNodes],
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow<CanvasNode, CanvasEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        connectOnClick={false}
        onDragOver={onDragOver}
        onDrop={onDrop}
        minZoom={0.05}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        panOnScroll
        panOnScrollMode={"free" as never}
        zoomOnScroll={false}
        zoomOnPinch
        selectionOnDrag={false}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a35" />
      </ReactFlow>
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-0 rounded-full border border-white/10 bg-[#0d0d0f]/90 px-1.5 py-1.5 shadow-lg backdrop-blur-sm">
        <button
          onClick={() => flow.zoomOut({ duration: 200 })}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => flow.fitView({ duration: 200 })}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          title="Fit view"
        >
          <Maximize2 size={13} />
        </button>
        <button
          onClick={() => flow.zoomIn({ duration: 200 })}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <div className="mx-1.5 h-4 w-px bg-white/10" />
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          title="Undo"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          title="Redo"
        >
          <Redo2 size={14} />
        </button>
      </div>
      <ShapePanel />
    </div>
  );
}

interface CanvasWrapperProps {
  roomId: string;
  templateToLoad?: { template: CanvasTemplate; ts: number } | null;
}

export function CanvasWrapper({ roomId, templateToLoad }: CanvasWrapperProps) {
  const authEndpoint = useCallback(async (room?: string) => {
    const res = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: room }),
    });
    return res.json();
  }, []);

  return (
    <LiveblocksProvider authEndpoint={authEndpoint}>
      <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
        <ClientSideSuspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Connecting...
            </div>
          }
        >
          {() => (
            <ReactFlowProvider>
              <FlowCanvas templateToLoad={templateToLoad ?? null} />
            </ReactFlowProvider>
          )}

        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

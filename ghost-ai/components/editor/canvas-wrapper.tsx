"use client";

import { useCallback } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { ReactFlow, ReactFlowProvider, Background, BackgroundVariant, MiniMap, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { NodeTypes } from "@xyflow/react";
import type { CanvasNode, CanvasEdge, ShapeType } from "@/types/canvas";
import { ShapePanel } from "@/components/editor/shape-panel";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";

const nodeTypes: NodeTypes = {
  canvasNode: CanvasNodeRenderer as NodeTypes["canvasNode"],
};

let nodeCounter = 0;

function generateNodeId(shape: ShapeType): string {
  return `${shape}-${Date.now()}-${++nodeCounter}`;
}

function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const { screenToFlowPosition, addNodes } = useReactFlow<CanvasNode, CanvasEdge>();
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
        <MiniMap
          style={{ background: "#0d0d0f", border: "1px solid rgba(255,255,255,0.08)" }}
          maskColor="rgba(255,255,255,0.04)"
          nodeColor="#2a2a35"
        />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

interface CanvasWrapperProps {
  roomId: string;
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
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
              <FlowCanvas />
            </ReactFlowProvider>
          )}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

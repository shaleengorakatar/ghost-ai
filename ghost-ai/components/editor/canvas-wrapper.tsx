"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useOthers,
  useUpdateMyPresence,
  useMutation,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useReactFlow,
  useViewport,
  MarkerType,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { NodeTypes, EdgeTypes, DefaultEdgeOptions } from "@xyflow/react";
import type { CanvasNode, CanvasEdge, ShapeType } from "@/types/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { OnEdgesChangeContext } from "@/components/editor/canvas-context";
import { PresenceAvatars } from "@/components/editor/presence-avatars";
import { ShapePanel } from "@/components/editor/shape-panel";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAutosave, SaveStatus } from "@/hooks/use-autosave";
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

// Renders live cursors for all other participants using flow→screen coordinate conversion
function LiveCursors() {
  const others = useOthers();
  const { x: vpX, y: vpY, zoom } = useViewport();

  return (
    <>
      {others.map((other) => {
        const cursor = other.presence.cursor;
        if (!cursor) return null;
        const screenX = cursor.x * zoom + vpX;
        const screenY = cursor.y * zoom + vpY;
        const color = other.info?.cursorColor ?? "#6366f1";
        const name = other.info?.name ?? "";
        return (
          <div
            key={other.connectionId}
            className="pointer-events-none absolute"
            style={{ left: screenX, top: screenY, zIndex: 50 }}
          >
            {/* SVG pointer */}
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.4))` }}
            >
              <path
                d="M0 0L0 16L4.5 12L7.5 19L9.5 18L6.5 11L12 11Z"
                fill={color}
              />
            </svg>
            {/* Name badge */}
            {name && (
              <div
                className="absolute left-3 top-4 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{ background: color }}
              >
                {name}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function FlowCanvas({
  templateToLoad,
  projectId,
  onSaveStatus,
  onSaveFn,
}: {
  templateToLoad: { template: CanvasTemplate; ts: number } | null;
  projectId: string;
  onSaveStatus: (s: SaveStatus) => void;
  onSaveFn?: (fn: () => void) => void;
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      edges: {
        sync: {
          canvasEdge: { label: "atomic" },
        },
      },
    });
  const flow = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition, addNodes } = flow;
  const updatePresence = useUpdateMyPresence();

  // Load saved canvas only when room is empty
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    if (nodes.length > 0 || edges.length > 0) {
      loadedRef.current = true;
      return;
    }
    loadedRef.current = true;
    fetch(`/api/projects/${projectId}/canvas`)
      .then((r) => r.json())
      .then(({ canvas }) => {
        if (!canvas || !canvas.nodes?.length) return;
        const addNodeChanges = (canvas.nodes as CanvasNode[]).map((n) => ({ type: "add" as const, item: n }));
        const addEdgeChanges = (canvas.edges as CanvasEdge[]).map((e) => ({ type: "add" as const, item: e }));
        onNodesChange(addNodeChanges);
        onEdgesChange(addEdgeChanges);
        requestAnimationFrame(() => flow.fitView({ duration: 300 }));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { status: saveStatus, save } = useAutosave(projectId, nodes, edges);
  useEffect(() => { onSaveStatus(saveStatus); }, [saveStatus, onSaveStatus]);
  useEffect(() => { onSaveFn?.(save); }, [save, onSaveFn]);

  useEffect(() => {
    if (!templateToLoad) return;
    const removeNodes = nodes.map((n) => ({ type: "remove" as const, id: n.id }));
    const removeEdges = edges.map((e) => ({ type: "remove" as const, id: e.id }));
    const addNodeChanges = templateToLoad.template.nodes.map((n) => ({ type: "add" as const, item: n as CanvasNode }));
    const addEdgeChanges = templateToLoad.template.edges.map((e) => ({ type: "add" as const, item: e as CanvasEdge }));
    onNodesChange([...removeNodes, ...addNodeChanges]);
    onEdgesChange([...removeEdges, ...addEdgeChanges]);
    requestAnimationFrame(() => flow.fitView({ duration: 300 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateToLoad?.ts]);

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const deleteSelected = useMutation(({ storage }) => {
    const flowStorage = storage.get("flow");
    if (!flowStorage) return;
    const nodesMap = flowStorage.get("nodes");
    const edgesMap = flowStorage.get("edges");
    const selectedNodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
    selectedNodeIds.forEach((id) => nodesMap.delete(id));
    edges.forEach((e) => {
      if (e.selected || selectedNodeIds.has(e.source) || selectedNodeIds.has(e.target)) {
        edgesMap.delete(e.id);
      }
    });
  }, [nodes, edges]);

  const deleteSelectedRef = useRef(deleteSelected);
  useEffect(() => { deleteSelectedRef.current = deleteSelected; }, [deleteSelected]);
  const stableDelete = useCallback(() => deleteSelectedRef.current(), []);

  useKeyboardShortcuts({ flow: flow as never, undo, redo, deleteSelected: stableDelete });

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

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      updatePresence({ cursor: { x: pos.x, y: pos.y } });
    },
    [screenToFlowPosition, updatePresence],
  );

  const onMouseLeave = useCallback(() => {
    updatePresence({ cursor: null });
  }, [updatePresence]);

  return (
    <OnEdgesChangeContext.Provider value={onEdgesChange}>
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
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          minZoom={0.05}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          fitViewOnInit={false}
          panOnScroll
          panOnScrollMode={"free" as never}
          zoomOnScroll={false}
          zoomOnPinch
          selectionOnDrag={false}
          deleteKeyCode={null}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a35" />
        </ReactFlow>

        {/* Live cursors overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <LiveCursors />
        </div>

        {/* Presence avatars — top-right of canvas */}
        <div className="absolute right-3 top-3 z-20">
          <PresenceAvatars />
        </div>

        {/* Zoom / undo controls */}
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
    </OnEdgesChangeContext.Provider>
  );
}

interface CanvasWrapperProps {
  roomId: string;
  templateToLoad?: { template: CanvasTemplate; ts: number } | null;
  onSaveStatus?: (s: SaveStatus) => void;
  onSaveFn?: (fn: () => void) => void;
}

export function CanvasWrapper({ roomId, templateToLoad, onSaveStatus, onSaveFn }: CanvasWrapperProps) {
  const authEndpoint = useCallback(async (room?: string) => {
    const res = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: room }),
    });
    return res.json();
  }, []);

  const handleSaveStatus = useCallback((s: SaveStatus) => {
    onSaveStatus?.(s);
  }, [onSaveStatus]);

  const handleSaveFn = useCallback((fn: () => void) => {
    onSaveFn?.(fn);
  }, [onSaveFn]);

  return (
    <LiveblocksProvider authEndpoint={authEndpoint}>
      <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }}>
        <ClientSideSuspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Connecting...
            </div>
          }
        >
          {() => (
            <ReactFlowProvider>
              <FlowCanvas
                templateToLoad={templateToLoad ?? null}
                projectId={roomId}
                onSaveStatus={handleSaveStatus}
                onSaveFn={handleSaveFn}
              />
            </ReactFlowProvider>
          )}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

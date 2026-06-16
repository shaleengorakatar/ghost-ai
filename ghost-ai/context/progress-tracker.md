# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Design System

## Current Goal

- Feature 19 (TBD)

## Completed

- Feature 01: Design System — shadcn/ui initialized (Radix/Nova preset, Tailwind v4), components Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added, lucide-react installed.
- Feature 02: Editor — EditorNavbar (fixed top bar with sidebar toggle), ProjectSidebar (floating overlay with Tabs + New Project button), dialog pattern ready via existing shadcn Dialog.
- Feature 03: Auth — @clerk/nextjs + @clerk/ui installed; ClerkProvider with dark theme + CSS variable overrides wraps root layout; proxy.ts at root protects all routes except /sign-in and /sign-up; two-panel sign-in/sign-up pages (left: logo + feature list, right: Clerk form; mobile: form only); / redirects auth→/editor, unauth→/sign-in; UserButton added to EditorNavbar right section; editor stub page at /editor.
- Feature 04: Project Dialogs — editor home (heading + description + New Project button), useProjectDialogs hook (dialog/form/loading state), Create dialog (name input + live slug preview), Rename dialog (prefilled, auto-focus, Enter submits), Delete dialog (destructive confirm), sidebar project items with Rename/Delete dropdown (owned only), mobile backdrop scrim, mock project data.
- Feature 05: Prisma — multi-file schema (prisma/schema.prisma + prisma/models/project.prisma) with Project and ProjectCollaborator models; Prisma client generated to app/generated/prisma; lib/prisma.ts cached singleton branching on DATABASE_URL (prisma+postgres:// → Accelerate via accelerateUrl + withAccelerate(), else → @prisma/adapter-pg); migration SQL created and applied; npm run build passes.
- Feature 06: Projects APIs — REST route handlers for GET /api/projects (list), POST /api/projects (create, defaults name to "Untitled Project"), PATCH /api/projects/[projectId] (rename, owner-only), DELETE /api/projects/[projectId] (delete, owner-only); 401 for unauthenticated, 403 for non-owner mutations; lib/prisma.ts return typed as PrismaClient to resolve Accelerate union type issue; npm run build passes.
- Feature 07: Wire Editor Home — editor page converted to async server component fetching owned projects via lib/projects.ts (getOwnedProjects); EditorHome client component receives initialProjects; useProjectActions hook (replaces useProjectDialogs) generates slug+unique suffix as roomId, POSTs with roomId used as project ID, navigates to /editor/[roomId] on create, redirects to /editor if deleting active workspace otherwise router.refresh(); create dialog shows Room ID preview; npm run build passes.
- Feature 08: Editor Workspace Shell — lib/project-access.ts with getCurrentUser (Clerk userId + primary email) and getProjectWithAccess (owner or collaborator by email); AccessDenied component (centred, lock icon, back link via Button render prop); app/editor/[roomId]/page.tsx server component (redirect unauth → /sign-in, show AccessDenied for missing/unauthorized projects); WorkspaceShell client component (full-viewport layout: navbar with project name + Share button + AI sidebar toggle, ProjectSidebar with activeProjectId highlight, canvas placeholder, collapsible AI sidebar placeholder); EditorNavbar extended with optional projectName/aiSidebarOpen/onToggleAISidebar; ProjectSidebar extended with optional activeProjectId; no TypeScript errors in new files.
- Feature 09: Share Dialog — GET/POST/DELETE /api/projects/[projectId]/collaborators route; collaborator list enriched with Clerk display name + avatar via getUserList; ShareDialog client component (copy link with Copied! feedback, invite-by-email form owner-only, collaborator list with avatars, remove button owner-only); shadcn Avatar component added; WorkspaceShell Share button wired to open dialog; isOwner passed from server page; npm run build passes.
- Feature 10: Liveblocks Setup — liveblocks.config.ts defines Presence (cursor + isThinking) and UserMeta (name, avatar, cursorColor); cached Liveblocks node client in lib/liveblocks.ts with Proxy pattern to defer secret key validation to runtime; getCursorColor helper maps userId to deterministic color from fixed palette; POST /api/liveblocks-auth verifies Clerk auth + project access, ensures room exists (create if missing), returns prepareSession token with user name/avatar/cursorColor; @liveblocks/node installed; npm run build passes.
- Feature 11: Base Canvas — types/canvas.ts defines NodeData (label, color, shape), CanvasNode, CanvasEdge; CanvasWrapper client component sets up LiveblocksProvider (/api/liveblocks-auth) + RoomProvider (initialPresence cursor:null) + ClientSideSuspense with error fallback; FlowCanvas uses useLiveblocksFlow with suspense:true and renders ReactFlow with dot-pattern Background, MiniMap, fitView, and connectOnClick loose connections; WorkspaceShell canvas placeholder replaced with CanvasWrapper; npm run build passes.
- Feature 12: Shape Panel — ShapeType extended to rectangle/diamond/circle/pill/cylinder/hexagon in types/canvas.ts; ShapePanel floating pill toolbar at bottom-center with draggable SVG icon buttons for all six shapes (drag payload: shape name + default size via application/ghost-shape data transfer); CanvasNodeRenderer custom node type renders bordered rectangle with centered label and top/bottom handles; FlowCanvas wired with nodeTypes, onDragOver, onDrop (screenToFlowPosition, onNodesChange add change); node IDs use shape+timestamp+counter; npm run build passes.

- Feature 13: Node Shape Rendering — CanvasNodeRenderer ShapeOutline refactored: rectangle/pill/circle use CSS border+border-radius, diamond/hexagon/cylinder use SVG scaled to node size; selection glow via boxShadow for CSS shapes and strokeOpacity overlay for SVG shapes; ShapePanel adds drag ghost preview via createPortal (blank drag image suppresses browser ghost, window dragover updates cursor position, preview cleared on dragend/drop); npm run build passes.
- Feature 14: Node Editing — NodeResizer added to CanvasNodeRenderer (visible when selected, minWidth 80, minHeight 40, subtle indigo handles); label input replaced with textarea (resize:none, transparent, centered); onPointerDown+onMouseDown+onClick stop propagation to prevent canvas drag/pan during text editing; Escape cancels and restores previous label, blur commits; label updates flow through updateNodeData into existing collaborative state; npm run build passes.
- Feature 15: Node Color Toolbar — NODE_COLORS palette (8 bg/text pairs) defined in types/canvas.ts per ui-context.md; NodeData updated with bgColor/textColor (replaces old color field); ColorToolbar floating pill renders above selected nodes with one swatch per color pair, active swatch highlighted with text-color border, hover shows tight glow via inline onMouseEnter/Leave; swatch clicks update both bgColor and textColor through existing triggerNodeChanges collaborative state; ShapeOutline uses bgColor for all shape fills; text label color reflects active textColor; all toolbar interactions stop propagation to prevent canvas drag/pan; npm run build passes.

- Feature 16: Edge Behaviour — CanvasEdge type extended with EdgeData (label field); handles on all four sides (top/right/bottom/left) as subtle white dots with dark border, hidden by default and fade in on node hover via Tailwind group-hover; CanvasEdgeRenderer custom edge using getSmoothStepPath for right-angle routing, BaseEdge for the visible stroke, wide transparent hit path for easy clicking; dimmed at rest, brightened on hover/selection; EdgeLabelRenderer positions label at path midpoint; double-click opens input that grows with text, saves on blur/Enter/Escape; saved labels shown as pill badges; faint hint when active edge has no label; all interactions stop propagation; defaultEdgeOptions sets type+arrowhead for new connections; npm run build passes.
- Feature 17: Canvas Ergonomics — floating pill control bar at bottom-left with zoom out/fit view/zoom in and undo/redo groups separated by a divider; zoom actions use ReactFlow instance with 200ms animation; undo/redo wired to Liveblocks useUndo/useRedo hooks; undo/redo buttons disabled (dimmed) when canUndo/canRedo is false; useKeyboardShortcuts hook in hooks/ listens on window, skips editable fields, handles +/= zoom in, - zoom out, Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z redo, Cmd/Ctrl+Y redo; MiniMap removed; npm run build passes.
- Feature 18: Starter Templates — starter-templates.ts defines CanvasTemplate type and CANVAS_TEMPLATES array (Microservices, CI/CD Pipeline, Event-Driven System) using shared NodeData/EdgeData types and NODE_COLORS palette; StarterTemplatesModal renders a scrollable grid of template cards each with a lightweight SVG preview (bounds-fitted, shape-accurate, edges as lines between centers); "Templates" button added to workspace navbar; onImport clears and replaces canvas nodes+edges via flow.setNodes/setEdges through existing Liveblocks collaborative state, then fitView; stamped { template, ts } state ensures re-importing the same template re-fires the effect; npm run build passes.

## In Progress

- None yet.

## Next Up

- Feature 19 (TBD)

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/* files after shadcn installation.
- Next.js 16 uses proxy.ts (not middleware.ts) — same API, renamed to reflect its purpose.
- Prisma multi-file schema (prisma/schema.prisma + prisma/models/*.prisma); client generated to app/generated/prisma (not node_modules).
- lib/prisma.ts branches on DATABASE_URL prefix: prisma+postgres:// → Accelerate adapter; else → @prisma/adapter-pg. Return type cast to PrismaClient to resolve Accelerate union type issue.
- Liveblocks node client in lib/liveblocks.ts uses a Proxy to defer secret key validation to runtime (avoids build-time errors when env vars are absent).
- roomId doubles as Prisma project ID — generated as slug + unique suffix at create time and used as the Liveblocks room ID.
- CanvasNode and CanvasEdge are typed generics over NodeData/EdgeData with literal type discriminants ("canvasNode" / "canvasEdge") so nodeTypes/edgeTypes stay fully typed without casting beyond the registration site.
- Edge labels are stored in EdgeData.label and updated via setEdges — not through Liveblocks triggerEdgeChanges — because useLiveblocksFlow exposes setEdges and the collaborative sync happens automatically through the same flow state.
- Handles are typed as source-only on all four sides; React Flow allows connecting any source→source pair, so target discrimination is unnecessary and avoids double-handle overlap.

## Session Notes

- Using Next.js 16.2.6 with React 19 and Tailwind CSS v4.
- shadcn version 4.5.0 was used; it auto-detected Tailwind v4.
- lucide-react ^1.11.0 installed as a direct dependency.
- @clerk/nextjs ^7.2.7 and @clerk/ui ^1.6.7 installed.
- @liveblocks/node installed alongside @liveblocks/client, @liveblocks/react, @liveblocks/react-flow, @liveblocks/react-ui. Liveblocks client uses lazy init (getLiveblocks()) to avoid key validation errors at build time.
- Prisma 7.8.0 — generated client goes to app/generated/prisma/; import PrismaClient from @/app/generated/prisma/client (no index.ts in v7). Constructor always requires { adapter } argument. @prisma/adapter-pg used for all connections.
- prisma.config.ts uses schema: "prisma/" (multi-file schema) and reads DATABASE_URL from .env via dotenv.
- @xyflow/react edges require EdgeLabelRenderer (imported from @xyflow/react) for labels that render outside the SVG layer; label position coordinates come directly from getSmoothStepPath return values — do not compute midpoint manually.
- Tailwind group-hover on ReactFlow nodes: add className="group/node" to the node wrapper div, then use group-hover/node:!opacity-100 on Handle elements; the !important override is needed because ReactFlow sets handle opacity inline.

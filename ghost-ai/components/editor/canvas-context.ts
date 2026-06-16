import { createContext } from "react";
import type { EdgeChange } from "@xyflow/react";
import type { CanvasEdge } from "@/types/canvas";

export const OnEdgesChangeContext = createContext<
  ((changes: EdgeChange<CanvasEdge>[]) => void) | null
>(null);

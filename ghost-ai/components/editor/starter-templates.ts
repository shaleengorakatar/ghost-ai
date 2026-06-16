import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export type CanvasTemplate = {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

function n(
  id: string,
  label: string,
  x: number,
  y: number,
  width = 160,
  height = 80,
  colorIdx = 0,
  shape: CanvasNode["data"]["shape"] = "rectangle",
): CanvasNode {
  const color = NODE_COLORS[colorIdx];
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: { label, bgColor: color.bg, textColor: color.text, shape },
    width,
    height,
  };
}

function e(id: string, source: string, target: string, label?: string): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: { label },
  };
}

const microservices: CanvasTemplate = {
  id: "microservices",
  name: "Microservices Architecture",
  description: "API gateway routing to independent services with a shared data layer.",
  nodes: [
    n("client", "Client", 280, 20, 160, 60, 1, "pill"),
    n("gateway", "API Gateway", 280, 140, 160, 70, 7, "rectangle"),
    n("auth", "Auth Service", 60, 280, 150, 70, 2, "rectangle"),
    n("users", "User Service", 240, 280, 150, 70, 6, "rectangle"),
    n("orders", "Order Service", 430, 280, 150, 70, 3, "rectangle"),
    n("db-users", "Users DB", 240, 420, 140, 70, 0, "cylinder"),
    n("db-orders", "Orders DB", 430, 420, 140, 70, 0, "cylinder"),
    n("queue", "Message Queue", 60, 420, 150, 60, 4, "pill"),
  ],
  edges: [
    e("e1", "client", "gateway"),
    e("e2", "gateway", "auth"),
    e("e3", "gateway", "users"),
    e("e4", "gateway", "orders"),
    e("e5", "users", "db-users"),
    e("e6", "orders", "db-orders"),
    e("e7", "orders", "queue"),
    e("e8", "auth", "queue"),
  ],
};

const cicd: CanvasTemplate = {
  id: "cicd",
  name: "CI/CD Pipeline",
  description: "Source to production deployment pipeline with quality gates.",
  nodes: [
    n("code", "Code Push", 20, 100, 140, 70, 1, "rectangle"),
    n("ci", "CI Server", 200, 100, 140, 70, 7, "rectangle"),
    n("test", "Test Suite", 380, 20, 140, 70, 6, "rectangle"),
    n("lint", "Lint & Type", 380, 120, 140, 70, 3, "rectangle"),
    n("build", "Build Image", 560, 100, 140, 70, 2, "rectangle"),
    n("registry", "Container Registry", 560, 240, 160, 70, 0, "cylinder"),
    n("staging", "Staging Deploy", 380, 240, 140, 70, 4, "rectangle"),
    n("gate", "Manual Gate", 200, 240, 140, 70, 5, "diamond"),
    n("prod", "Production", 200, 380, 140, 70, 6, "pill"),
  ],
  edges: [
    e("e1", "code", "ci", "on push"),
    e("e2", "ci", "test"),
    e("e3", "ci", "lint"),
    e("e4", "test", "build"),
    e("e5", "lint", "build"),
    e("e6", "build", "registry", "push"),
    e("e7", "registry", "staging", "deploy"),
    e("e8", "staging", "gate", "smoke tests"),
    e("e9", "gate", "prod", "approve"),
  ],
};

const eventDriven: CanvasTemplate = {
  id: "event-driven",
  name: "Event-Driven System",
  description: "Publishers emit events to a broker; consumers process independently.",
  nodes: [
    n("web", "Web App", 20, 180, 140, 70, 1, "rectangle"),
    n("mobile", "Mobile App", 20, 300, 140, 70, 1, "rectangle"),
    n("broker", "Event Broker", 220, 240, 160, 80, 7, "hexagon"),
    n("topic-orders", "orders.created", 420, 120, 160, 60, 3, "pill"),
    n("topic-notifs", "notifications.send", 420, 240, 160, 60, 2, "pill"),
    n("topic-analytics", "analytics.track", 420, 360, 160, 60, 6, "pill"),
    n("svc-order", "Order Processor", 640, 120, 160, 70, 0, "rectangle"),
    n("svc-notif", "Notification Svc", 640, 240, 160, 70, 0, "rectangle"),
    n("svc-analytics", "Analytics Svc", 640, 360, 160, 70, 0, "rectangle"),
  ],
  edges: [
    e("e1", "web", "broker", "publish"),
    e("e2", "mobile", "broker", "publish"),
    e("e3", "broker", "topic-orders"),
    e("e4", "broker", "topic-notifs"),
    e("e5", "broker", "topic-analytics"),
    e("e6", "topic-orders", "svc-order", "subscribe"),
    e("e7", "topic-notifs", "svc-notif", "subscribe"),
    e("e8", "topic-analytics", "svc-analytics", "subscribe"),
  ],
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicd, eventDriven];

import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#E57373", // red
  "#FFB74D", // orange
  "#FFF176", // yellow
  "#81C784", // green
  "#4FC3F7", // light blue
  "#7986CB", // indigo
  "#CE93D8", // purple
  "#F06292", // pink
];

export function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

declare global {
  // eslint-disable-next-line no-var
  var __liveblocks: Liveblocks | undefined;
}

function getLiveblocksClient(): Liveblocks {
  if (globalThis.__liveblocks) return globalThis.__liveblocks;
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  const client = new Liveblocks({ secret });
  if (process.env.NODE_ENV !== "production") globalThis.__liveblocks = client;
  return client;
}

const liveblocks = new Proxy({} as Liveblocks, {
  get(_target, prop) {
    const client = getLiveblocksClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default liveblocks;

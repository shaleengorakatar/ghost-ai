import { clerkClient } from "@clerk/nextjs/server";
import { getCurrentUser, getProjectWithAccess } from "@/lib/project-access";
import liveblocks, { getCursorColor } from "@/lib/liveblocks";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const projectId = body.projectId as string | undefined;
  if (!projectId) {
    return Response.json({ error: "projectId required" }, { status: 400 });
  }

  const project = await getProjectWithAccess(projectId, user.userId, user.email);
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure the Liveblocks room exists; ignore 409 if two requests race to create it
  try {
    await liveblocks.getRoom(projectId);
  } catch {
    try {
      await liveblocks.createRoom(projectId, { defaultAccesses: [] });
    } catch {
      // 409 Conflict — room was created by a concurrent request, proceed normally
    }
  }

  // Fetch user profile from Clerk
  let name = user.email ?? user.userId;
  let avatar = "";
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(user.userId);
    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    name = fullName || clerkUser.username || user.email || user.userId;
    avatar = clerkUser.imageUrl ?? "";
  } catch {
    // fall through with defaults
  }

  const cursorColor = getCursorColor(user.userId);

  const session = liveblocks.prepareSession(user.userId, {
    userInfo: {
      name,
      avatar,
      cursorColor,
    },
  });

  session.allow(projectId, session.FULL_ACCESS);

  const { status, body: responseBody } = await session.authorize();
  return new Response(responseBody, { status });
}

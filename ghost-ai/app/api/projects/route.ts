import { auth } from "@clerk/nextjs/server";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let projects;
  try {
    projects = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  return Response.json(projects);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = (body.name as string | undefined)?.trim() || "Untitled Project";
  const rawRoomId = (body.roomId as string | undefined)?.trim();
  const ROOM_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const roomId =
    rawRoomId && rawRoomId.length <= 128 && ROOM_ID_RE.test(rawRoomId)
      ? rawRoomId
      : undefined;

  try {
    const project = await prisma.project.create({
      data: { ...(roomId ? { id: roomId } : {}), ownerId: userId, name },
    });
    return Response.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return Response.json({ error: "Project ID already exists" }, { status: 409 });
      }
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

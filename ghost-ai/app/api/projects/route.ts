import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(projects);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = (body.name as string | undefined)?.trim() || "Untitled Project";
  const roomId = (body.roomId as string | undefined)?.trim() || undefined;

  const project = await prisma.project.create({
    data: { ...(roomId ? { id: roomId } : {}), ownerId: userId, name },
  });

  return Response.json(project, { status: 201 });
}

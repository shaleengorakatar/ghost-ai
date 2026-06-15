import { auth } from "@clerk/nextjs/server";
import { PrismaClientKnownRequestError } from "@prisma/client-runtime-utils";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  let project;
  try {
    project = await prisma.project.findFirst({ where: { id: projectId } });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  if (project.ownerId !== userId)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const name = (body.name as string | undefined)?.trim();
  if (!name) return Response.json({ error: "Name is required" }, { status: 400 });

  try {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name },
    });
    return Response.json(updated);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  let project;
  try {
    project = await prisma.project.findFirst({ where: { id: projectId } });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  if (!project) return Response.json({ error: "Not found" }, { status: 404 });
  if (project.ownerId !== userId)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.project.delete({ where: { id: projectId } });
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

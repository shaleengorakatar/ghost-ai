import { auth } from "@clerk/nextjs/server";
import { put, get } from "@vercel/blob";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/project-access";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findFirst({ where: { id: projectId } }).catch(() => null);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const isCollaborator = await prisma.projectCollaborator
    .findFirst({ where: { projectId } })
    .then(() => true)
    .catch(() => false);

  if (project.ownerId !== userId && !isCollaborator) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid body" }, { status: 400 });

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return Response.json({ url: blob.url });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findFirst({ where: { id: projectId } }).catch(() => null);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  if (!project.canvasJsonPath) return Response.json({ canvas: null });

  const result = await get(project.canvasJsonPath, { access: "private" }).catch(() => null);
  if (!result) return Response.json({ canvas: null });

  const canvas = await new Response(result.stream).json();
  return Response.json({ canvas });
}

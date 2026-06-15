import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

async function getOwnerOrFail(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId } });
  if (!project) return { error: "Not found", status: 404 } as const;
  if (project.ownerId !== userId) return { error: "Forbidden", status: 403 } as const;
  return { project };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: {
      ownerId: true,
      collaborators: { select: { id: true, email: true, createdAt: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const isOwnerOrCollab =
    project.ownerId === userId ||
    project.collaborators.some((c) => {
      // we don't have caller email here — we allow any authenticated project member
      // The page-level access check already guards the workspace; this just gates the API.
      return false;
    });

  // Re-check: owner always allowed; collaborators need email match
  const client = await clerkClient();
  let callerEmail: string | null = null;
  try {
    const user = await client.users.getUser(userId);
    callerEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? null;
  } catch {
    // fall through
  }

  const hasAccess =
    project.ownerId === userId ||
    (callerEmail !== null && project.collaborators.some((c) => c.email === callerEmail));

  if (!hasAccess) return Response.json({ error: "Forbidden" }, { status: 403 });

  // Enrich with Clerk profile data
  const emails = project.collaborators.map((c) => c.email);
  let clerkUsers: Record<string, { name: string; avatar: string | null }> = {};

  if (emails.length > 0) {
    try {
      const results = await client.users.getUserList({
        emailAddress: emails,
        limit: 100,
      });
      for (const u of results.data) {
        const email =
          u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)
            ?.emailAddress;
        if (email) {
          const name =
            [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
            u.username ||
            email;
          clerkUsers[email] = { name, avatar: u.imageUrl ?? null };
        }
      }
    } catch {
      // fall through — show emails only
    }
  }

  const collaborators = project.collaborators.map((c) => ({
    id: c.id,
    email: c.email,
    name: clerkUsers[c.email]?.name ?? c.email,
    avatar: clerkUsers[c.email]?.avatar ?? null,
  }));

  return Response.json({ collaborators, isOwner: project.ownerId === userId });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const check = await getOwnerOrFail(projectId, userId);
  if ("error" in check) return Response.json({ error: check.error }, { status: check.status });

  const body = await request.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Valid email required" }, { status: 400 });
  }

  // Prevent owner from inviting themselves
  const client = await clerkClient();
  try {
    const owner = await client.users.getUser(userId);
    const ownerEmail =
      owner.emailAddresses.find((e) => e.id === owner.primaryEmailAddressId)
        ?.emailAddress ?? null;
    if (ownerEmail && ownerEmail.toLowerCase() === email) {
      return Response.json({ error: "Cannot invite yourself" }, { status: 400 });
    }
  } catch {
    // non-fatal
  }

  try {
    const collab = await prisma.projectCollaborator.create({
      data: { projectId, email },
    });
    return Response.json(collab, { status: 201 });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e?.code === "P2002") {
      return Response.json({ error: "Already a collaborator" }, { status: 409 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const check = await getOwnerOrFail(projectId, userId);
  if ("error" in check) return Response.json({ error: check.error }, { status: check.status });

  const body = await request.json().catch(() => ({}));
  const collaboratorId = body.collaboratorId as string | undefined;
  if (!collaboratorId) return Response.json({ error: "collaboratorId required" }, { status: 400 });

  try {
    await prisma.projectCollaborator.delete({
      where: { id: collaboratorId, projectId },
    });
    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e?.code === "P2025") return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

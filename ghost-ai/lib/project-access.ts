import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? null;

  return { userId, email };
}

export async function getProjectWithAccess(projectId: string, userId: string, email: string | null) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: { select: { email: true } },
    },
  });

  if (!project) return null;

  const hasAccess =
    project.ownerId === userId ||
    (email !== null && project.collaborators.some((c) => c.email === email));

  if (!hasAccess) return null;

  return { id: project.id, name: project.name, ownerId: project.ownerId };
}

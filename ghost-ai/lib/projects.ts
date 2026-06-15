import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getOwnedProjects() {
  const { userId } = await auth();
  if (!userId) return [];
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });
}

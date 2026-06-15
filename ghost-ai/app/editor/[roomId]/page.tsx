import { redirect } from "next/navigation";
import { getCurrentUser, getProjectWithAccess } from "@/lib/project-access";
import { getOwnedProjects } from "@/lib/projects";
import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "@/components/editor/workspace-shell";

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { roomId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const project = await getProjectWithAccess(roomId, user.userId, user.email);
  if (!project) return <AccessDenied />;

  const owned = await getOwnedProjects();
  const projects = owned.map((p) => ({ id: p.id, name: p.name, owned: true }));

  return <WorkspaceShell project={project} initialProjects={projects} />;
}

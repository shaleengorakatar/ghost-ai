import { getOwnedProjects } from "@/lib/projects";
import { EditorHome } from "@/components/editor/editor-home";

export default async function EditorPage() {
  const owned = await getOwnedProjects();
  const projects = owned.map((p) => ({ id: p.id, name: p.name, owned: true }));
  return <EditorHome initialProjects={projects} />;
}

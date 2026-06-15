import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          This project does not exist or you do not have permission to view it.
        </p>
      </div>
      <Button variant="outline" render={<Link href="/editor" />}>
        Back to projects
      </Button>
    </div>
  );
}

import { SignIn } from "@clerk/nextjs";
import { Cpu, Share2, FileText } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex font-sans">
      <aside className="hidden lg:flex lg:w-1/2 flex-col justify-between px-12 py-10 border-r border-border bg-[var(--bg-surface)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)] flex-shrink-0" />
          <span className="text-sm font-semibold text-foreground">Ghost AI</span>
        </div>

        <div className="flex flex-col gap-12">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-foreground mb-4">
              Design systems at the<br />speed of thought.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
            </p>
          </div>

          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--accent-primary-dim)]">
                <Cpu className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">AI Architecture Generation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Describe your system, AI maps it to nodes and edges on a live canvas.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--accent-primary-dim)]">
                <Share2 className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Real-time Collaboration</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Live cursors, presence indicators, and shared node editing across your team.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--accent-primary-dim)]">
                <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Instant Spec Generation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Export a complete Markdown technical spec directly from the canvas graph.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 Ghost AI. All rights reserved.</p>
      </aside>

      <main className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12">
        <SignIn forceRedirectUrl="/editor" />
      </main>
    </div>
  );
}

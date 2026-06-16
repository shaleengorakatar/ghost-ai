"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Bot, X, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8 px-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--accent-primary-dim]">
              <Bot className="h-6 w-6 text-[--accent-primary]" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-primary-text">Ghost AI Architect</p>
              <p className="text-xs text-muted-text leading-relaxed">
                Describe what you want to build and I&apos;ll help design the architecture.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {STARTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="w-full text-left text-xs px-3 py-2 rounded-xl bg-subtle text-accent-text hover:opacity-80 transition-opacity"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] text-xs px-3 py-2 rounded-xl bg-brand-dim border-2 border-[--accent-primary]/50 text-copy-primary">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-start">
                <div className="max-w-[85%] text-xs px-3 py-2 rounded-xl bg-elevated border border-surface-border text-accent-text">
                  {msg.content}
                </div>
              </div>
            )
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 px-3 pb-3 pt-1 border-t border-surface-border">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Ghost AI…"
            className="flex-1 resize-none text-xs min-h-[72px] max-h-[160px] bg-elevated border-surface-border text-foreground placeholder:text-muted-text"
          />
          <Button
            size="sm"
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="shrink-0 bg-[--accent-primary] text-white hover:bg-[--accent-primary]/80 h-8 px-3"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function SpecsTab() {
  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      <Button className="w-full bg-[--accent-primary] text-white hover:bg-[--accent-primary]/80 h-8 text-xs">
        Generate Spec
      </Button>

      {/* Demo spec card */}
      <div className="rounded-2xl border border-surface-border bg-elevated p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[--accent-primary-dim]">
            <FileText className="h-4 w-4 text-[--accent-primary]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-text truncate">Microservices Architecture</p>
            <p className="text-xs text-muted-text leading-relaxed mt-0.5 line-clamp-2">
              API Gateway → Auth Service → Product Catalog → Order Service → Notification Service. Uses event-driven messaging via a shared message broker.
            </p>
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="h-7 gap-1.5 text-xs text-muted-text"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}

interface AISidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AISidebar({ open, onClose }: AISidebarProps) {
  return (
    <aside
      className={`absolute top-0 right-0 h-full w-72 flex flex-col bg-base/95 border-l border-surface-border shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <Bot className="h-4 w-4 text-[--accent-primary]" />
          <div className="leading-none">
            <p className="text-sm font-semibold text-primary-text">AI Workspace</p>
            <p className="text-[11px] text-muted-text mt-0.5">Collaborate with Ghost AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI sidebar"
          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-text hover:text-foreground hover:bg-subtle transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="architect" className="flex flex-col flex-1 min-h-0">
        <TabsList className="shrink-0 mx-3 mt-2 mb-1 h-8 bg-subtle rounded-xl p-0.5">
          <TabsTrigger
            value="architect"
            className="flex-1 h-full text-xs rounded-lg text-muted-text data-[state=active]:bg-[--accent-primary] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="flex-1 h-full text-xs rounded-lg text-muted-text data-[state=active]:bg-[--accent-primary] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architect" className="flex flex-col flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <ChatTab />
        </TabsContent>

        <TabsContent value="specs" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden">
          <SpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}

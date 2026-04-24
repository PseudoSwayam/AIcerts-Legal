import { Sparkles, AlertTriangle, Lightbulb, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiskTag } from "@/components/RiskTag";
import type { Clause } from "@/types";
import { askDocumentQuestion } from "@/services/legalApi";
import { cn } from "@/lib/utils";

interface AIPanelProps {
  clauses: Clause[];
  loading?: boolean;
  contractText?: string;
  className?: string;
}

export function AIPanel({ clauses, loading, contractText = "", className }: AIPanelProps) {
  const [tab, setTab] = useState<"insights" | "chat">("insights");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi! Ask me anything about this contract — risks, clauses, or suggested edits." },
  ]);
  const [thinking, setThinking] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    const q = question;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setThinking(true);
    const ans = await askDocumentQuestion(contractText, q);
    setMessages((m) => [...m, { role: "ai", text: ans }]);
    setThinking(false);
  };

  return (
    <aside className={cn("w-[360px] shrink-0 border-l border-border bg-background flex flex-col", className)}>
      <div className="px-4 h-12 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-brand-soft text-brand flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="text-sm font-semibold">AI Assistant</div>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-secondary p-0.5">
          <button
            onClick={() => setTab("insights")}
            className={cn(
              "px-2.5 py-1 text-xs rounded transition-colors",
              tab === "insights" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            Insights
          </button>
          <button
            onClick={() => setTab("chat")}
            className={cn(
              "px-2.5 py-1 text-xs rounded transition-colors",
              tab === "chat" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            Chat
          </button>
        </div>
      </div>

      {tab === "insights" ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
          {loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-border p-3 animate-pulse space-y-2">
                  <div className="h-3 w-1/3 bg-secondary rounded" />
                  <div className="h-2 w-full bg-secondary rounded" />
                  <div className="h-2 w-4/5 bg-secondary rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && clauses.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <Sparkles className="h-6 w-6 mx-auto mb-2 opacity-50" />
              No analysis yet. Upload or generate a contract to start.
            </div>
          )}

          {!loading &&
            clauses.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-card p-3 hover:border-foreground/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{c.title}</div>
                  <RiskTag level={c.risk} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{c.text}</p>
                <div className="mt-2.5 flex items-start gap-1.5 text-xs text-foreground/80">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{c.explanation}</span>
                </div>
                {c.suggestion && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-md bg-brand-soft px-2 py-1.5 text-xs text-accent-foreground">
                    <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand" />
                    <span>{c.suggestion}</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  m.role === "ai"
                    ? "bg-secondary text-foreground"
                    : "ml-auto bg-primary text-primary-foreground"
                )}
              >
                {m.text}
              </div>
            ))}
            {thinking && (
              <div className="bg-secondary rounded-lg px-3 py-2 text-sm text-muted-foreground inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Thinking…
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="Ask about this contract…"
              className="h-9"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={ask}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}

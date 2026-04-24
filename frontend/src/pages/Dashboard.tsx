import { useNavigate } from "react-router-dom";
import { FilePlus2, Upload, FileText, Clock, ShieldCheck, Sparkles, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  draft: "bg-secondary text-muted-foreground",
  review: "bg-risk-medium-bg text-risk-medium",
  signed: "bg-risk-low-bg text-risk-low",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const documents = useAppStore((s) => s.documents);

  return (
    <div className="pb-12">
      <PageHeader
        title="Welcome back, Alex"
        description="Here's what's happening across your contracts today."
      />

      <div className="px-6 md:px-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active contracts", value: "24", icon: FileText, trend: "+3 this week" },
          { label: "Pending review", value: "7", icon: Clock, trend: "2 overdue" },
          { label: "High-risk flags", value: "5", icon: ShieldCheck, trend: "−2 vs last week" },
          { label: "AI suggestions", value: "132", icon: Sparkles, trend: "Last 30 days" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{s.value}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-6 md:px-8 mt-8">
        <div className="text-sm font-medium text-foreground mb-3">Quick actions</div>
        <div className="grid gap-3 md:grid-cols-3">
          <button
            onClick={() => navigate("/draft")}
            className="group text-left rounded-xl border border-border bg-card p-5 hover:border-foreground/20 hover:shadow-card transition-all"
          >
            <div className="h-9 w-9 rounded-md bg-brand-soft text-brand flex items-center justify-center">
              <FilePlus2 className="h-4 w-4" />
            </div>
            <div className="mt-3 text-sm font-medium text-foreground">Draft a new contract</div>
            <p className="mt-1 text-xs text-muted-foreground">Start from a template — NDA, MSA, employment, and more.</p>
            <div className="mt-3 inline-flex items-center text-xs text-brand font-medium">
              Get started <ArrowUpRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate("/review")}
            className="group text-left rounded-xl border border-border bg-card p-5 hover:border-foreground/20 hover:shadow-card transition-all"
          >
            <div className="h-9 w-9 rounded-md bg-secondary text-foreground flex items-center justify-center">
              <Upload className="h-4 w-4" />
            </div>
            <div className="mt-3 text-sm font-medium text-foreground">Upload & review</div>
            <p className="mt-1 text-xs text-muted-foreground">Drop a contract and let AI analyze risks and clauses.</p>
            <div className="mt-3 inline-flex items-center text-xs text-brand font-medium">
              Upload <ArrowUpRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => navigate("/risk")}
            className="group text-left rounded-xl border border-border bg-card p-5 hover:border-foreground/20 hover:shadow-card transition-all"
          >
            <div className="h-9 w-9 rounded-md bg-risk-high-bg text-risk-high flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="mt-3 text-sm font-medium text-foreground">Run risk analysis</div>
            <p className="mt-1 text-xs text-muted-foreground">See flagged clauses with severity and suggestions.</p>
            <div className="mt-3 inline-flex items-center text-xs text-brand font-medium">
              Open report <ArrowUpRight className="h-3 w-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Recent + Activity */}
      <div className="px-6 md:px-8 mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="text-sm font-medium">Saved contracts</div>
            <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
          </div>
          <ul>
            {documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.type} · Updated {d.updatedAt}</div>
                </div>
                <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium capitalize", statusStyles[d.status])}>
                  {d.status}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-3.5 border-b border-border text-sm font-medium">Recent activity</div>
          <ul className="p-2">
            {[
              { who: "AI Assistant", what: "flagged 2 high-risk clauses in NDA — Acme Corp.", when: "10m ago", color: "bg-risk-high" },
              { who: "You", what: "generated MSA draft for Northwind.", when: "1h ago", color: "bg-brand" },
              { who: "Sarah K.", what: "approved Employment Agreement.", when: "Yesterday", color: "bg-risk-low" },
              { who: "AI Assistant", what: "suggested a liability cap edit.", when: "2 days ago", color: "bg-risk-medium" },
            ].map((a, i) => (
              <li key={i} className="flex gap-3 px-3 py-2.5">
                <div className="relative">
                  <span className={cn("absolute top-1.5 left-1.5 h-2 w-2 rounded-full", a.color)} />
                  <div className="h-5 w-5" />
                </div>
                <div className="text-xs text-foreground/80 leading-relaxed">
                  <span className="font-medium text-foreground">{a.who}</span> {a.what}
                  <div className="text-muted-foreground mt-0.5">{a.when}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Playbooks() {
  const { playbookRules, addPlaybookRule, removePlaybookRule } = useAppStore();
  const [clauseType, setClauseType] = useState("");
  const [preferredCondition, setPreferredCondition] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clauseType.trim() || !preferredCondition.trim()) return;
    addPlaybookRule({
      id: crypto.randomUUID(),
      clauseType,
      preferredCondition,
      notes,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setClauseType("");
    setPreferredCondition("");
    setNotes("");
    toast.success("Rule added to playbook");
  };

  return (
    <div className="pb-12">
      <PageHeader
        title="Playbooks"
        description="Define your firm's preferred positions. AI applies them during every review."
      />

      <div className="px-6 md:px-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={handleAdd} className="rounded-xl border border-border bg-card p-5 h-fit">
          <div className="text-sm font-medium mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add new rule
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ct">Clause type</Label>
              <Input
                id="ct"
                placeholder="e.g. Limitation of Liability"
                value={clauseType}
                onChange={(e) => setClauseType(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pc">Preferred condition</Label>
              <Textarea
                id="pc"
                rows={3}
                placeholder="e.g. Cap at 12 months of fees, mutual."
                value={preferredCondition}
                onChange={(e) => setPreferredCondition(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nt">Notes (optional)</Label>
              <Textarea
                id="nt"
                rows={2}
                placeholder="Internal context or fallback."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Save rule</Button>
          </div>
        </form>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Saved rules
            </div>
            <span className="text-xs text-muted-foreground">{playbookRules.length} total</span>
          </div>
          {playbookRules.length === 0 ? (
            <div className="text-center py-16 text-sm text-muted-foreground">
              No rules yet. Add your first rule on the left.
            </div>
          ) : (
            <ul>
              {playbookRules.map((r) => (
                <li key={r.id} className="px-5 py-4 border-b border-border last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{r.clauseType}</div>
                      <p className="mt-1 text-sm text-foreground/80">{r.preferredCondition}</p>
                      {r.notes && (
                        <p className="mt-1.5 text-xs text-muted-foreground italic">{r.notes}</p>
                      )}
                      <div className="mt-2 text-[11px] text-muted-foreground">Added {r.createdAt}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removePlaybookRule(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { RiskTag } from "@/components/RiskTag";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/store/useAppStore";
import { getRiskAnalysis, sampleContractText } from "@/services/legalApi";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Risk() {
  const { clauses, setClauses, uploadedDocument } = useAppStore();
  const sourceText = uploadedDocument?.text || sampleContractText;

  const refreshAnalysis = async () => {
    const result = await getRiskAnalysis(sourceText);
    setClauses(result);
    toast.success("Risk analysis refreshed");
  };

  const exportReport = () => {
    if (clauses.length === 0) {
      toast.error("No risk analysis to export");
      return;
    }

    const date = new Date().toISOString().slice(0, 10);
    const report = [
      "# Risk Analysis Report",
      "",
      `Date: ${date}`,
      `Document: ${uploadedDocument?.name || "Sample Contract"}`,
      "",
      "## Summary",
      `- High risk clauses: ${summary.high}`,
      `- Medium risk clauses: ${summary.medium}`,
      `- Low risk clauses: ${summary.low}`,
      "",
      "## Clause Findings",
      ...clauses.flatMap((c, idx) => [
        `### ${idx + 1}. ${c.title}`,
        `- Risk: ${c.risk.toUpperCase()}`,
        `- Clause: ${c.text || "N/A"}`,
        `- Explanation: ${c.explanation || "N/A"}`,
        `- Suggestion: ${c.suggestion || "N/A"}`,
        "",
      ]),
    ].join("\n");

    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `risk-analysis-${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Risk report exported");
  };

  useEffect(() => {
    if (clauses.length === 0) {
      getRiskAnalysis(sourceText).then(setClauses);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const c = { low: 0, medium: 0, high: 0 };
    clauses.forEach((cl) => c[cl.risk]++);
    return c;
  }, [clauses]);

  return (
    <div className="pb-12">
      <PageHeader
        title="Risk analysis"
        description="Clause-level risk assessment with explanations and suggested remediations."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refreshAnalysis}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export report
            </Button>
          </>
        }
      />

      <div className="px-6 md:px-8 grid gap-3 sm:grid-cols-3 mb-6">
        <SummaryCard label="High risk" value={summary.high} tone="high" />
        <SummaryCard label="Medium risk" value={summary.medium} tone="medium" />
        <SummaryCard label="Low risk" value={summary.low} tone="low" />
      </div>

      <div className="px-6 md:px-8">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="w-[28%]">Clause</TableHead>
                <TableHead className="w-[14%]">Risk</TableHead>
                <TableHead>Explanation</TableHead>
                <TableHead className="w-[28%]">Suggestion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clauses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-12">
                    No analyzed clauses yet.
                  </TableCell>
                </TableRow>
              )}
              {clauses.map((c) => (
                <TableRow key={c.id} className="align-top">
                  <TableCell>
                    <div className="font-medium text-sm text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.text}</div>
                  </TableCell>
                  <TableCell><RiskTag level={c.risk} /></TableCell>
                  <TableCell className="text-sm text-foreground/80">{c.explanation}</TableCell>
                  <TableCell className="text-sm text-foreground/80">
                    {c.suggestion || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "low" | "medium" | "high" }) {
  const styles = {
    low: { dot: "bg-risk-low", bg: "bg-risk-low-bg", text: "text-risk-low" },
    medium: { dot: "bg-risk-medium", bg: "bg-risk-medium-bg", text: "text-risk-medium" },
    high: { dot: "bg-risk-high", bg: "bg-risk-high-bg", text: "text-risk-high" },
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          {label}
        </div>
        <div className="mt-1.5 text-2xl font-semibold text-foreground">{value}</div>
      </div>
      <div className={`h-10 w-10 rounded-lg ${styles.bg} ${styles.text} flex items-center justify-center text-sm font-semibold`}>
        {value}
      </div>
    </div>
  );
}

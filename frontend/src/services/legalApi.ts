import type { Clause, ContractDocument, DraftRequest, PlaybookRule } from "@/types";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
const apiClient = axios.create({
  baseURL: API,
});

export const mockRecentDocs: ContractDocument[] = [
  { id: "1", title: "Mutual NDA — Acme Corp", type: "NDA", updatedAt: "2h ago", status: "review" },
  { id: "2", title: "SaaS Master Services Agreement", type: "MSA", updatedAt: "Yesterday", status: "draft" },
  { id: "3", title: "Employment Agreement — J. Smith", type: "Employment", updatedAt: "3 days ago", status: "signed" },
  { id: "4", title: "Vendor Services Contract — Northwind", type: "Services", updatedAt: "Last week", status: "review" },
  { id: "5", title: "Independent Contractor Agreement", type: "Contractor", updatedAt: "Last week", status: "draft" },
];

export const sampleContractText = `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of the Effective Date by and between the parties identified below.

1. DEFINITIONS
"Confidential Information" means any non-public information disclosed by one party (the "Disclosing Party") to the other party (the "Receiving Party"), whether orally, in writing, or in any other form, that is designated as confidential or that reasonably should be understood to be confidential.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to (a) hold the Confidential Information in strict confidence; (b) not disclose such Confidential Information to any third parties; and (c) use the Confidential Information solely for the purpose of evaluating the proposed business relationship between the parties.

3. TERM
This Agreement shall remain in effect for a period of five (5) years from the Effective Date, unless earlier terminated in accordance with the terms hereof. The confidentiality obligations herein shall survive the termination of this Agreement indefinitely.

4. INDEMNIFICATION
The Receiving Party shall indemnify, defend, and hold harmless the Disclosing Party from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to any breach of this Agreement.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles.

6. MISCELLANEOUS
This Agreement constitutes the entire understanding between the parties with respect to the subject matter hereof and supersedes all prior agreements, whether written or oral.`;

export const mockClauses: Clause[] = [
  {
    id: "c1",
    title: "Confidentiality Term",
    text: "5-year term with indefinite survival of obligations.",
    risk: "medium",
    explanation: "Indefinite survival of confidentiality obligations is broader than market standard (typically 3–5 years post-termination).",
    suggestion: "Limit survival to 3 years post-termination, except for trade secrets.",
  },
  {
    id: "c2",
    title: "Indemnification",
    text: "Unilateral indemnification by Receiving Party.",
    risk: "high",
    explanation: "Indemnity is one-sided and uncapped. This exposes Receiving Party to unlimited liability.",
    suggestion: "Make indemnification mutual and add a liability cap equal to fees paid in prior 12 months.",
  },
  {
    id: "c3",
    title: "Governing Law",
    text: "Delaware law, no jurisdiction clause.",
    risk: "low",
    explanation: "Delaware is a standard choice. Consider adding an exclusive forum clause.",
    suggestion: "Add: 'Exclusive jurisdiction in the state and federal courts of Delaware.'",
  },
  {
    id: "c4",
    title: "Definition of Confidential Information",
    text: "Broad definition without exclusions.",
    risk: "medium",
    explanation: "Missing standard exclusions (publicly available, independently developed, lawfully received from third parties).",
    suggestion: "Add standard 4-prong carve-outs to the definition.",
  },
  {
    id: "c5",
    title: "Term & Termination",
    text: "5-year fixed term.",
    risk: "low",
    explanation: "Standard duration. No notable concerns.",
  },
];

export async function generateContract(req: DraftRequest): Promise<string> {
  const res = await apiClient.post(`/generate`, {
    type: req.contractType,
    jurisdiction: req.jurisdiction,
    parties: (req.parties || "").slice(0, 200),
    details: req.description.slice(0, 600),
  });
  return res.data?.contract || "";
}

export async function analyzeContract(text: string): Promise<Clause[]> {
  const res = await apiClient.post(`/analyze`, { text });
  return res.data?.clauses || [];
}

export async function getRiskAnalysis(text: string): Promise<Clause[]> {
  const res = await apiClient.post(`/risk`, { text });
  const risks = Array.isArray(res.data?.risks) ? res.data.risks : [];

  return risks.map((item: { clause?: string; riskLevel?: string; reason?: string; suggestedFix?: string }, index: number) => ({
    id: `risk-${index + 1}`,
    title: item.clause || `Risk ${index + 1}`,
    text: item.clause || "",
    risk: normalizeRisk(item.riskLevel),
    explanation: item.reason || "No reason provided",
    suggestion: item.suggestedFix || "",
  }));
}

export async function askDocumentQuestion(text: string, question: string): Promise<string> {
  const res = await apiClient.post(`/ask`, { text, question });
  const answer = res.data?.answer || "No answer returned.";
  const quote = res.data?.quote ? `\n\nQuote: "${res.data.quote}"` : "";
  return `${answer}${quote}`;
}

export async function redlineClause(text: string): Promise<{ improvedClause: string; explanation: string }> {
  const res = await apiClient.post(`/redline`, { text });
  return {
    improvedClause: res.data?.improvedClause || "",
    explanation: res.data?.explanation || "",
  };
}

function normalizeRisk(risk?: string): "low" | "medium" | "high" {
  const value = (risk || "").toLowerCase();
  if (value.includes("high")) return "high";
  if (value.includes("med")) return "medium";
  return "low";
}

export const mockPlaybookRules: PlaybookRule[] = [
  {
    id: "p1",
    clauseType: "Limitation of Liability",
    preferredCondition: "Cap at 12 months of fees paid; mutual.",
    notes: "Required for all vendor agreements.",
    createdAt: "2025-01-12",
  },
  {
    id: "p2",
    clauseType: "Governing Law",
    preferredCondition: "Delaware or New York preferred.",
    createdAt: "2025-02-03",
  },
  {
    id: "p3",
    clauseType: "Auto-Renewal",
    preferredCondition: "Require 60-day opt-out notice; max 1-year renewal.",
    createdAt: "2025-02-18",
  },
];

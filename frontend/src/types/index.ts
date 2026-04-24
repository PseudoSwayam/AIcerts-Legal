export type RiskLevel = "low" | "medium" | "high";

export interface ContractDocument {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  status: "draft" | "review" | "signed";
  preview?: string;
}

export interface Clause {
  id: string;
  title: string;
  text: string;
  risk: RiskLevel;
  explanation: string;
  suggestion?: string;
}

export interface PlaybookRule {
  id: string;
  clauseType: string;
  preferredCondition: string;
  notes?: string;
  createdAt: string;
}

export interface DraftRequest {
  contractType: string;
  jurisdiction: string;
  parties?: string;
  description: string;
}

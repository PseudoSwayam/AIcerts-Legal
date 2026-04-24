import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Download, Copy, FileText } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { generateContract } from "@/services/legalApi";
import { DocEditorFromText } from "@/components/DocEditor";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const contractTypes = [
  "Non-Disclosure Agreement (NDA)",
  "Master Services Agreement (MSA)",
  "Employment Agreement",
  "Independent Contractor Agreement",
  "SaaS Subscription Agreement",
  "Vendor Services Contract",
];
const jurisdictions = ["Delaware, USA", "California, USA", "New York, USA", "England & Wales", "Singapore", "Germany"];

const draftPresets = [
  {
    id: "acme-northwind-nda",
    label: "Acme × Northwind NDA",
    contractType: "Non-Disclosure Agreement (NDA)",
    jurisdiction: "Delaware, USA",
    parties: "Acme Tech Pvt Ltd and Northwind Systems Pvt Ltd",
    description:
      "Acme will share confidential product, pricing, and customer information with Northwind to evaluate a potential partnership in India.",
  },
  {
    id: "saas-vendor-msa",
    label: "SaaS Vendor MSA",
    contractType: "Master Services Agreement (MSA)",
    jurisdiction: "California, USA",
    parties: "Nimbus Software Inc. and Apex Retail Pvt Ltd",
    description:
      "Nimbus will provide SaaS platform access, support, and uptime commitments to Apex under annual subscription and data protection obligations.",
  },
  {
    id: "employment-confidentiality",
    label: "Employment Confidentiality",
    contractType: "Employment Agreement",
    jurisdiction: "Singapore",
    parties: "BluePeak Technologies Pte Ltd and Priya Sharma",
    description:
      "Employee will receive access to confidential technical, commercial, and customer information during employment and must maintain confidentiality during and after employment.",
  },
  {
    id: "contractor-ip",
    label: "Contractor + IP Protection",
    contractType: "Independent Contractor Agreement",
    jurisdiction: "England & Wales",
    parties: "Northbridge Labs Ltd and Jordan Lee",
    description:
      "Contractor will deliver product design and engineering support. Agreement must include confidentiality, IP assignment, payment milestones, and termination rights.",
  },
  {
    id: "vendor-services",
    label: "Vendor Services Contract",
    contractType: "Vendor Services Contract",
    jurisdiction: "New York, USA",
    parties: "Helios Health Inc. and Sterling Ops LLC",
    description:
      "Vendor will provide managed back-office services, handling sensitive operational and customer information under strict confidentiality and service quality obligations.",
  },
];

export default function Draft() {
  const { generatedContract, setGeneratedContract, setUploadedDocument, setClauses } = useAppStore();
  const navigate = useNavigate();
  const [contractType, setContractType] = useState(contractTypes[0]);
  const [jurisdiction, setJurisdiction] = useState(jurisdictions[0]);
  const [parties, setParties] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("none");
  const [loading, setLoading] = useState(false);

  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId === "none") return;

    const preset = draftPresets.find((p) => p.id === presetId);
    if (!preset) return;

    setContractType(preset.contractType);
    setJurisdiction(preset.jurisdiction);
    setParties(preset.parties);
    setDescription(preset.description);
    toast.success("Preset applied. You can edit any field.");
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const text = await generateContract({ contractType, jurisdiction, parties, description });
      setGeneratedContract(text);
      toast.success("Contract generated");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error || error.message)
        : "Failed to generate contract";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const reviewDraft = () => {
    if (!generatedContract.trim()) return;
    setUploadedDocument({ name: `${contractType} - Draft`, text: generatedContract });
    setClauses([]);
    navigate("/review");
  };

  const exportDraft = () => {
    if (!generatedContract.trim()) {
      toast.error("No draft available to export");
      return;
    }

    const safeName = contractType
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `${safeName || "contract"}-${date}.md`;

    const blob = new Blob([generatedContract], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${fileName}`);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Draft contract"
        description="Describe the deal and let AI generate a first draft you can edit."
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-0 border-t border-border min-h-0">
        {/* Left form */}
        <div className="border-r border-border bg-background p-6 overflow-y-auto scrollbar-thin">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="preset">Template preset</Label>
              <Select value={selectedPreset} onValueChange={applyPreset}>
                <SelectTrigger id="preset"><SelectValue placeholder="Choose a preset" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preset</SelectItem>
                  {draftPresets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Applying a preset pre-fills fields. You can edit them before generating.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">Contract type</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {contractTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="jur">Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger id="jur"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parties">Parties</Label>
              <Input
                id="parties"
                placeholder="e.g. Acme Inc. and Northwind Ltd."
                value={parties}
                onChange={(e) => setParties(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={6}
                placeholder="Briefly describe the purpose, scope, and key commercial terms…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">The more detail you provide, the better the draft.</p>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating…" : "Generate Contract"}
            </Button>
            {loading && (
              <p className="text-xs text-muted-foreground text-center">
                Draft generation can take 2–4 minutes. Please wait.
              </p>
            )}
          </div>
        </div>

        {/* Right preview */}
        <div className="bg-secondary/40 overflow-y-auto scrollbar-thin">
          {!generatedContract && !loading && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <div className="h-12 w-12 mx-auto rounded-full bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-sm font-medium">Your draft will appear here</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fill in the form on the left and click Generate. You can edit the result inline.
                </p>
              </div>
            </div>
          )}
          {loading && (
            <div className="py-8 px-4">
              <div className="doc-editor space-y-3 animate-pulse">
                <div className="h-6 w-2/3 bg-secondary rounded" />
                <div className="h-3 w-full bg-secondary rounded" />
                <div className="h-3 w-11/12 bg-secondary rounded" />
                <div className="h-3 w-10/12 bg-secondary rounded" />
                <div className="h-3 w-full bg-secondary rounded mt-6" />
                <div className="h-3 w-9/12 bg-secondary rounded" />
                <div className="h-3 w-11/12 bg-secondary rounded" />
              </div>
            </div>
          )}
          {generatedContract && !loading && (
            <>
              <div className="sticky top-0 z-10 bg-secondary/40 backdrop-blur px-4 py-2 flex items-center justify-end gap-2 border-b border-border">
                <Button variant="default" size="sm" className="h-8" onClick={reviewDraft}>
                  Review Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContract);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={exportDraft}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export
                </Button>
              </div>
              <DocEditorFromText text={generatedContract} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

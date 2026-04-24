import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { FileDropzone } from "@/components/FileDropzone";
import { DocEditorFromText } from "@/components/DocEditor";
import { AIPanel } from "@/components/AIPanel";
import { Button } from "@/components/ui/button";
import { FileText, X, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { analyzeContract, sampleContractText } from "@/services/legalApi";
import { toast } from "sonner";

export default function Review() {
  const { uploadedDocument, setUploadedDocument, clauses, setClauses, autoAnalyzeOnUpload } = useAppStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const runAnalysis = async (text: string) => {
    setLoading(true);
    const result = await analyzeContract(text);
    setClauses(result);
    setLoading(false);
  };

  useEffect(() => {
    if (uploadedDocument && clauses.length === 0 && autoAnalyzeOnUpload) {
      runAnalysis(uploadedDocument.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = (file: File, text: string) => {
    const docText = text || sampleContractText;
    setUploadedDocument({ name: file.name, text: docText });
    if (autoAnalyzeOnUpload) runAnalysis(docText);
    toast.success(`${file.name} uploaded`);
  };

  const loadSample = () => {
    setUploadedDocument({ name: "Sample NDA.txt", text: sampleContractText });
    runAnalysis(sampleContractText);
  };

  if (!uploadedDocument) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader
          title="Review contract"
          description="Upload a contract to get instant AI analysis, clause flags and suggestions."
        />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <FileDropzone onFile={handleFile} />
            <div className="mt-4 text-center">
              <button onClick={loadSample} className="text-xs text-brand hover:underline">
                Or try with a sample NDA
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={uploadedDocument.name}
        description="AI-reviewed contract with clause-by-clause insights."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAnalysis(uploadedDocument.text)}
              disabled={loading}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {loading ? "Analyzing…" : "Re-analyze"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/risk")}
              disabled={loading || clauses.length === 0}
            >
              Risk analysis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUploadedDocument(null);
                setClauses([]);
              }}
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Close
            </Button>
          </>
        }
      />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] border-t border-border min-h-0">
        <div className="overflow-y-auto scrollbar-thin">
          <div className="px-4 py-2 border-b border-border bg-secondary/30 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {uploadedDocument.name}
          </div>
          <DocEditorFromText text={uploadedDocument.text} />
        </div>
        <AIPanel clauses={clauses} loading={loading} contractText={uploadedDocument.text} />
      </div>
    </div>
  );
}

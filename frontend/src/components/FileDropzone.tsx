import { useCallback, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFile: (file: File, text: string) => void;
  className?: string;
}

export function FileDropzone({ onFile, className }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        onFile(file, text);
      };
      reader.readAsText(file);
    },
    [onFile]
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-10 text-center cursor-pointer transition-all",
        dragOver && "border-brand bg-brand-soft",
        className
      )}
    >
      <input
        type="file"
        className="hidden"
        accept=".txt,.md,.doc,.docx,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
        }}
      />
      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-brand-soft transition-colors">
        <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-brand" />
      </div>
      <div>
        <div className="text-sm font-medium text-foreground">
          Drop your contract here, or <span className="text-brand">browse</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <FileText className="h-3 w-3" />
          Supports .txt, .doc, .docx, .pdf — up to 25MB
        </div>
      </div>
    </label>
  );
}

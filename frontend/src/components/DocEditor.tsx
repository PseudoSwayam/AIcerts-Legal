import { cn } from "@/lib/utils";

export function DocEditor({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("py-8 px-4 bg-secondary/40 min-h-full", className)}>
      <article className="doc-editor animate-fade-in">{children}</article>
    </div>
  );
}

export function DocEditorFromText({ text }: { text: string }) {
  // Render plain legal text into structured Word-like output
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <DocEditor>
      {blocks.map((block, i) => {
        // First block = title
        if (i === 0 && block === block.toUpperCase()) {
          return <h1 key={i}>{block}</h1>;
        }
        // Numbered section heading like "1. PURPOSE"
        const headingMatch = block.match(/^(\d+\.\s+[A-Z][A-Z\s&/-]+)$/);
        if (headingMatch) return <h2 key={i}>{block}</h2>;
        // Section heading at start of paragraph
        const inlineHeading = block.match(/^(\d+\.\s+[A-Z][A-Z\s&/-]+)\n([\s\S]+)$/);
        if (inlineHeading) {
          return (
            <div key={i}>
              <h2>{inlineHeading[1]}</h2>
              <p>{inlineHeading[2]}</p>
            </div>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </DocEditor>
  );
}

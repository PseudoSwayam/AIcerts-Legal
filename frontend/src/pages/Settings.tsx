import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { Eye, EyeOff, Key, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const {
    apiKey,
    setApiKey,
    aiSuggestionsEnabled,
    setAiSuggestionsEnabled,
    autoAnalyzeOnUpload,
    setAutoAnalyzeOnUpload,
  } = useAppStore();
  const [show, setShow] = useState(false);
  const [local, setLocal] = useState(apiKey);

  return (
    <div className="pb-12">
      <PageHeader
        title="Settings"
        description="Manage your AI integration, preferences and workspace."
      />

      <div className="px-6 md:px-8 max-w-3xl space-y-6">
        {/* API key */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Key className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">AI provider — OpenRouter</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Your API key is stored locally. It will be used for contract drafting, review and chat.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="key">OpenRouter API key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="key"
                  type={show ? "text" : "password"}
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="sk-or-v1-…"
                  className="pr-9 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                onClick={() => {
                  setApiKey(local);
                  toast.success("API key saved");
                }}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get a key at <span className="text-brand">openrouter.ai/keys</span>.
            </p>
          </div>
        </section>

        {/* Toggles */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium mb-4">AI preferences</h2>
          <div className="space-y-4">
            <ToggleRow
              icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
              title="AI suggestions"
              description="Surface inline suggestions while reviewing contracts."
              checked={aiSuggestionsEnabled}
              onChange={setAiSuggestionsEnabled}
            />
            <ToggleRow
              icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              title="Auto-analyze on upload"
              description="Run risk analysis automatically as soon as a contract is uploaded."
              checked={autoAnalyzeOnUpload}
              onChange={setAutoAnalyzeOnUpload}
            />
          </div>
        </section>

        {/* Profile */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium mb-4">Profile</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input defaultValue="Alex Stone" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue="alex@lexdraft.io" />
            </div>
            <div className="space-y-1.5">
              <Label>Firm</Label>
              <Input defaultValue="Stone & Partners LLP" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input defaultValue="Partner" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button>Save changes</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex gap-3 min-w-0">
        <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

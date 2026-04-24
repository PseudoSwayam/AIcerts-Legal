import { Search, Plus, Bell, Menu, PanelLeftClose } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  sidebarCollapsed: boolean;
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/draft": "Draft Contract",
  "/review": "Review Contract",
  "/risk": "Risk Analysis",
  "/playbooks": "Playbooks",
  "/settings": "Settings",
};

export function Topbar({ onOpenMobileSidebar, onToggleDesktopSidebar, sidebarCollapsed }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Lexdraft";

  return (
    <header className="h-14 shrink-0 border-b border-border bg-background flex items-center gap-3 px-4 md:px-6">
      <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" onClick={onOpenMobileSidebar}>
        <Menu className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:inline-flex" onClick={onToggleDesktopSidebar}>
        <PanelLeftClose className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
      </Button>

      <div className="hidden lg:block text-sm font-medium text-foreground min-w-[140px]">{title}</div>

      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contracts, clauses, playbooks…"
          className="pl-9 h-9 bg-secondary border-transparent focus-visible:bg-background focus-visible:border-border"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => navigate("/draft")}
          className="h-9 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New Contract
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="ml-1 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-semibold flex items-center justify-center">
          AS
        </div>
      </div>
    </header>
  );
}

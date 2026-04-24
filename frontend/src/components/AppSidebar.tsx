import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  FileSearch,
  ShieldAlert,
  BookOpen,
  Settings,
  PanelLeftClose,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Draft Contract", url: "/draft", icon: FilePlus2 },
  { title: "Review Contract", url: "/review", icon: FileSearch },
  { title: "Risk Analysis", url: "/risk", icon: ShieldAlert },
  { title: "Playbooks", url: "/playbooks", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <>
      <div className={cn("border-b border-sidebar-border", collapsed ? "h-20 px-2 py-2" : "h-36 px-4 py-3")}>
        {collapsed ? (
          <div className="h-full flex flex-col items-center justify-center gap-1">
            <img src="/logo.png" alt="Legal AI" className="h-9 w-9 object-contain" />
          </div>
        ) : (
          <div className="h-full flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1">
              <img src="/logo.png" alt="Legal AI" className="h-16 w-full object-contain" />
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground text-center">Legal AI</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 self-start"
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeftClose className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 py-4 space-y-1 scrollbar-thin overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {!collapsed && (
          <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
        )}
        {items.map((item) => {
          const active = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              onClick={onNavigate}
              title={item.title}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-brand")} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-lg border border-sidebar-border bg-background p-3">
          <div className="text-xs font-medium text-foreground">Pro tip</div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Add a Playbook rule to auto-flag risky clauses in every review.
          </p>
        </div>
      )}
    </>
  );
}

export function AppSidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: AppSidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={onCloseMobile}>
          <aside
            className="h-full w-72 bg-sidebar border-r border-sidebar-border flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 px-4 border-b border-sidebar-border flex items-center justify-between">
              <div className="text-sm font-semibold">Navigation</div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCloseMobile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent collapsed={false} onToggleCollapse={() => {}} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}

import { useState } from "react";
import { cn } from "@/lib/utils";

export type AuthTab = "login" | "register";

interface AuthTabsProps {
  activeTab?: AuthTab;
  defaultTab?: AuthTab;
  onTabChange?: (tab: AuthTab) => void;
}

export function AuthTabs({
  activeTab: controlledTab,
  defaultTab = "login",
  onTabChange,
}: AuthTabsProps) {
  const [internal, setInternal] = useState<AuthTab>(defaultTab);
  const active = controlledTab ?? internal;

  const handleChange = (tab: AuthTab) => {
    if (controlledTab === undefined) setInternal(tab);
    onTabChange?.(tab);
  };

  return (
    <div
      className="relative flex w-full gap-0 border-b border-ink/10"
      role="tablist"
      aria-label="Authentication tabs"
    >
      {(["login", "register"] as AuthTab[]).map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            id={`auth-tab-${tab}`}
            aria-controls={`auth-panel-${tab}`}
            onClick={() => handleChange(tab)}
            className={cn(
              "group relative flex-1 pb-3 pt-1 text-sm font-extrabold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50",
              isActive ? "text-ink" : "text-ink/45",
            )}
          >
            {tab === "login" ? "LOGIN" : "CREATE ACCOUNT"}
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-coral transition-transform duration-300 ease-out",
                isActive ? "scale-x-100" : "scale-x-0",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

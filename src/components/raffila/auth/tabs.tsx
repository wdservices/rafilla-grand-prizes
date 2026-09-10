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
      className="relative flex w-full rounded-xl bg-cream/50 p-1"
      role="tablist"
      aria-label="Authentication tabs"
    >
      <span
        className={cn(
          "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-ink shadow-sm transition-transform duration-300 ease-out",
          active === "login" ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden
      />
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
              "relative z-10 flex-1 py-2.5 text-xs font-extrabold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              isActive ? "text-white" : "text-ink/40 hover:text-ink/60",
            )}
          >
            {tab === "login" ? "Sign in" : "Create account"}
          </button>
        );
      })}
    </div>
  );
}

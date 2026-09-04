"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Hand-rolled Tabs primitive with the same call shape as
 * @radix-ui/react-tabs (`<Tabs value onValueChange><TabsList><TabsTrigger
 * value /></TabsList><TabsContent value /></Tabs>`) so it drops in like any
 * other components/ui primitive, but with zero new dependencies — unlike
 * Dialog/DropdownMenu/Tooltip, this repo has no Radix Tabs package
 * available to install. Implements the WAI-ARIA "automatic activation"
 * tabs pattern by hand: roving tabindex, arrow-key navigation, Home/End,
 * `role="tablist"/"tab"/"tabpanel"`. First needed by the AI Workspace's
 * five-panel switcher (features/ai-workspace).
 */

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  idBase: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component} /> must be used inside <Tabs>`);
  }
  return context;
}

export interface TabsProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
}

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  const idBase = React.useId();

  return (
    <TabsContext.Provider value={{ value, setValue: onValueChange, idBase }}>
      <div data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, ...props }: React.ComponentProps<"div">) {
  const listRef = React.useRef<HTMLDivElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const list = listRef.current;
    if (!list) return;

    const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      tabs[nextIndex]?.focus();
      tabs[nextIndex]?.click();
    }
  }

  return (
    <div
      ref={listRef}
      data-slot="tabs-list"
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-muted/50 text-muted-foreground flex max-w-full items-center gap-1 overflow-x-auto rounded-lg p-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends React.ComponentProps<"button"> {
  value: string;
  icon?: React.ReactNode;
  /**
   * "pill" (default) is the compact rounded-pill tab used for a standard
   * tab bar. "card" is a larger bordered, elevating-on-hover card — used
   * where the tab trigger doubles as a prominent action button (e.g. the
   * AI Workspace's quick-actions row, which *is* its TabsList, styled as
   * cards instead of pills, rather than existing as a second, separate
   * nav element alongside a pill tab bar).
   */
  variant?: "pill" | "card";
}

const TABS_TRIGGER_VARIANT_CLASSES: Record<"pill" | "card", { base: string; active: string; inactive: string }> = {
  pill: {
    base: "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
    active: "bg-background text-foreground shadow-sm",
    inactive: "hover:text-foreground text-muted-foreground",
  },
  card: {
    base: "group flex shrink-0 items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm font-medium whitespace-nowrap transition-all hover:-translate-y-0.5 hover:shadow-md",
    active: "border-primary/50 bg-primary/5 text-foreground",
    inactive: "border-border bg-card text-foreground hover:border-primary/30",
  },
};

function TabsTrigger({ value, icon, variant = "pill", className, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue, idBase } = useTabsContext("TabsTrigger");
  const isActive = activeValue === value;
  const variantClasses = TABS_TRIGGER_VARIANT_CLASSES[variant];

  return (
    <button
      type="button"
      role="tab"
      id={`${idBase}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${idBase}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setValue(value)}
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        variantClasses.base,
        "focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isActive ? variantClasses.active : variantClasses.inactive,
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.ComponentProps<"div"> {
  value: string;
  /**
   * Keep this panel mounted (hidden via the `hidden` attribute) even while
   * inactive, instead of unmounting it. Needed wherever a panel holds state
   * that must survive switching away and back — e.g. the AI Workspace's
   * chat history and generated reports, which would otherwise reset every
   * time the user changed tabs.
   */
  forceMount?: boolean;
}

function TabsContent({ value, forceMount = false, className, children, ...props }: TabsContentProps) {
  const { value: activeValue, idBase } = useTabsContext("TabsContent");
  const isActive = activeValue === value;

  if (!isActive && !forceMount) return null;

  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${value}`}
      aria-labelledby={`${idBase}-tab-${value}`}
      tabIndex={0}
      hidden={!isActive}
      data-slot="tabs-content"
      className={cn("focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

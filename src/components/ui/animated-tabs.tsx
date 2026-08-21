"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  layoutId?: string;
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className,
  layoutId = "animated-tab-pill",
}: AnimatedTabsProps) {
  return (
    <div
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-xl bg-secondary/80 p-1 text-muted-foreground select-none",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
              isActive
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}

            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-lg bg-card shadow-2xs border border-border/50"
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 32,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

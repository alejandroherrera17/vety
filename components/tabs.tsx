"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="grid gap-5">
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "border-b-2 px-3 py-3 text-sm font-semibold transition",
              active === tab.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-950",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((tab) => tab.id === active)?.content}
    </div>
  );
}

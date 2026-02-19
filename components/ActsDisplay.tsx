"use client";

import { useState } from "react";
import type { Act } from "@/lib/types";
import { ActCard } from "./ActCard";

interface ActsDisplayProps {
  initialActs: Act[];
}

export function ActsDisplay({ initialActs }: ActsDisplayProps) {
  const [acts, setActs] = useState<Act[]>(initialActs);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/acts", { cache: "no-store" });
      const data = await res.json();
      setActs(data.acts ?? []);
    } catch {
      // Silently ignore refresh errors
    }
    setLoading(false);
  }

  if (acts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🌱</div>
        <p className="text-stone-600 text-lg font-medium mb-2">
          No approved acts yet.
        </p>
        <p className="text-stone-500 text-sm">
          Be the first to submit an act of service and inspire others!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {acts.map((act) => (
          <ActCard key={act.id} act={act} />
        ))}
      </div>
      <div className="text-center">
        <button
          onClick={refresh}
          disabled={loading}
          className="bg-stone-100 hover:bg-stone-200 disabled:bg-stone-50 text-stone-700 font-semibold px-8 py-2.5 rounded-full transition-all shadow-sm hover:shadow disabled:text-stone-400"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </span>
          ) : (
            "🔄 Show Different Acts"
          )}
        </button>
      </div>
    </div>
  );
}

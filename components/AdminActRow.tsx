"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminAct } from "@/lib/types";

interface AdminActRowProps {
  act: AdminAct;
}

export function AdminActRow({ act }: AdminActRowProps) {
  const [loading, setLoading] = useState<"approve" | "delete" | null>(null);
  const [done, setDone] = useState(false);
  const [actionTaken, setActionTaken] = useState<"approve" | "delete" | null>(
    null
  );
  const router = useRouter();

  async function handleAction(action: "approve" | "delete") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/acts/${act.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionTaken(action);
        setDone(true);
        // Delay removal so user sees feedback
        setTimeout(() => {
          router.refresh();
        }, 800);
      }
    } catch {
      // Ignore errors
    }
    setLoading(null);
  }

  if (done) {
    return (
      <div
        className={`rounded-xl border-2 p-4 text-center font-medium transition-opacity ${
          actionTaken === "approve"
            ? "border-green-300 bg-green-50 text-green-700"
            : "border-red-300 bg-red-50 text-red-700"
        }`}
      >
        {actionTaken === "approve" ? "✅ Approved!" : "🗑️ Deleted."}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl">
              {act.side_of_veil === "this" ? "👤" : "✨"}
            </span>
            <span className="font-bold text-gray-900">{act.name}</span>
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
              {act.ward_name}
            </span>
          </div>

          {/* Email */}
          <div className="text-sm text-gray-500">{act.email}</div>

          {/* Description */}
          <p className="text-gray-700 mt-1 leading-relaxed bg-gray-50 rounded-lg p-3 text-sm">
            {act.act_description}
          </p>

          {/* Timestamp */}
          <div className="text-xs text-gray-400">
            Submitted: {new Date(act.created_at + "Z").toLocaleString()}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            {loading === "approve" ? "..." : "✅ Approve"}
          </button>
          <button
            onClick={() => handleAction("delete")}
            disabled={loading !== null}
            className="flex-1 sm:flex-initial bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            {loading === "delete" ? "..." : "🗑️ Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { ResourceOffer } from "@/lib/emergencyResources";

const SESSION_KEY = "upriver_admin_pw";

type ViewState = "locked" | "loading" | "ready";

export default function EmergencyAdminPage() {
  const [view, setView] = useState<ViewState>("locked");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<ResourceOffer[]>([]);
  const [filter, setFilter] = useState("");

  // On load, if a password is already in sessionStorage, try it.
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      void loadSubmissions(saved, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSubmissions(pw: string, fromForm: boolean) {
    setView("loading");
    setError("");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });

      if (res.status === 401) {
        sessionStorage.removeItem(SESSION_KEY);
        setView("locked");
        if (fromForm) setError("Incorrect password.");
        return;
      }

      if (!res.ok) {
        setView("locked");
        setError("Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      // Store only in sessionStorage (cleared when the tab closes). Never
      // persisted to localStorage, cookies, or the page source.
      sessionStorage.setItem(SESSION_KEY, pw);
      setRows(data.submissions ?? []);
      setView("ready");
    } catch {
      setView("locked");
      setError("Network error. Please try again.");
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    void loadSubmissions(password, true);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setRows([]);
    setPassword("");
    setView("locked");
  }

  const filtered = rows.filter((r) => {
    if (!filter.trim()) return true;
    const haystack = [
      r.name,
      r.email,
      r.phone,
      r.availability ?? "",
      (r.resources ?? []).join(" "),
      r.other_resources ?? "",
      r.notes ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(filter.trim().toLowerCase());
  });

  // Running tally: how many offers include each resource, most common first.
  const resourceTally = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      for (const res of r.resources ?? []) acc[res] = (acc[res] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  function exportCsv() {
    const headers = [
      "Submitted",
      "Name",
      "Email",
      "Phone",
      "Availability",
      "Resources",
      "Other resources",
      "Notes",
    ];
    const escape = (value: string) => {
      const v = value ?? "";
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(
        [
          new Date(r.created_at).toLocaleString(),
          r.name,
          r.email,
          r.phone,
          r.availability ?? "",
          (r.resources ?? []).join("; "),
          r.other_resources ?? "",
          r.notes ?? "",
        ]
          .map((cell) => escape(String(cell)))
          .join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "upriver-fire-relief-offers.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // ---- Locked / login view ----
  if (view !== "ready") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded shadow-sm border border-charcoal/10 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2" aria-hidden="true">
              🔐
            </div>
            <h1 className="font-serif text-2xl font-bold text-charcoal">
              Relief Signups
            </h1>
            <p className="text-charcoal/50 text-sm mt-1">
              Enter the leader password to view submissions.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-charcoal/15 rounded px-4 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
              required
              autoFocus
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={view === "loading"}
              className="w-full bg-forest-700 hover:bg-forest-800 disabled:bg-charcoal/20 text-white font-semibold py-3 rounded transition-colors shadow-sm"
            >
              {view === "loading" ? "Checking..." : "View submissions"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ---- Ready view ----
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            Upriver Fire Relief: Submissions
          </h1>
          <p className="text-charcoal/50 text-sm mt-1">
            {rows.length} {rows.length === 1 ? "offer" : "offers"} received
            {filter.trim() && ` (${filtered.length} shown)`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold px-4 py-2.5 rounded transition-colors shadow-sm"
          >
            Export CSV
          </button>
          <button
            onClick={logout}
            className="text-charcoal/50 hover:text-charcoal/80 text-sm underline"
          >
            Lock
          </button>
        </div>
      </div>

      {resourceTally.length > 0 && (
        <div className="bg-white rounded border border-charcoal/10 shadow-sm p-4 mb-6">
          <h2 className="font-serif text-lg font-bold text-charcoal mb-3">
            Resource tally
          </h2>
          <div className="flex flex-wrap gap-2">
            {resourceTally.map(([res, count]) => (
              <span
                key={res}
                className="inline-flex items-center gap-2 bg-forest-50 border border-forest-200 text-forest-800 text-sm px-3 py-1.5 rounded"
              >
                {res}
                <span className="inline-flex items-center justify-center bg-forest-700 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 px-1">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by name, resource, phone, anything..."
        className="w-full border border-charcoal/15 rounded px-4 py-3 mb-6 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded border border-charcoal/10 shadow-sm">
          <p className="text-charcoal/70 text-lg font-medium">
            {rows.length === 0 ? "No submissions yet." : "No matches."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded border border-charcoal/10 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-left text-charcoal/60">
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Submitted</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Name</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Email</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Phone</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Availability</th>
                <th className="px-4 py-3 font-semibold">Resources</th>
                <th className="px-4 py-3 font-semibold">Other</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-charcoal/5 align-top hover:bg-ivory/60"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-charcoal/60">
                    {new Date(r.created_at).toLocaleDateString()}
                    <span className="block text-xs text-charcoal/40">
                      {new Date(r.created_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-charcoal whitespace-nowrap">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={`mailto:${r.email}`}
                      className="text-forest-700 hover:underline"
                    >
                      {r.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={`tel:${r.phone}`}
                      className="text-forest-700 hover:underline"
                    >
                      {r.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-charcoal/80">
                    {r.availability ?? ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.resources ?? []).map((res) => (
                        <span
                          key={res}
                          className="inline-block bg-forest-50 border border-forest-200 text-forest-800 text-xs px-2 py-0.5 rounded"
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal/80 min-w-[12rem]">
                    {r.other_resources ?? ""}
                  </td>
                  <td className="px-4 py-3 text-charcoal/80 min-w-[12rem]">
                    {r.notes ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

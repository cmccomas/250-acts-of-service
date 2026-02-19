"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function SubmissionForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    ward_name: "",
    side_of_veil: "this" as "this" | "other",
    act_description: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setState("success");
        setForm({
          name: "",
          email: "",
          ward_name: "",
          side_of_veil: "this",
          act_description: "",
        });
      } else {
        setState("error");
        setErrorMsg(data.error ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center shadow-md">
        <div className="text-5xl mb-4">🌟</div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
        <p className="text-green-700 mb-2">
          Your act of service has been recorded and submitted for review.
        </p>
        <p className="text-green-600 text-sm mb-6">
          The world is a better place because of people like you.
        </p>
        <button
          onClick={() => setState("idle")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          Submit Another Act
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-stone-200 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-2">
        Record an Act of Service
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        Share the good you&apos;ve done to inspire others.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow"
            placeholder="Full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow"
            placeholder="you@example.com"
          />
        </div>

        {/* Ward */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Ward Name
          </label>
          <input
            type="text"
            value={form.ward_name}
            onChange={(e) => update("ward_name", e.target.value)}
            required
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow"
            placeholder="Your ward"
          />
        </div>

        {/* Side of the Veil */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Side of the Veil
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["this", "other"] as const).map((side) => (
              <label
                key={side}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  form.side_of_veil === side
                    ? side === "this"
                      ? "border-green-400 bg-green-50 shadow-sm"
                      : "border-yellow-400 bg-yellow-50 shadow-sm"
                    : "border-gray-200 hover:border-stone-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="side_of_veil"
                  value={side}
                  checked={form.side_of_veil === side}
                  onChange={() => update("side_of_veil", side)}
                  className="sr-only"
                />
                <span className="text-2xl">
                  {side === "this" ? "👤" : "✨"}
                </span>
                <div>
                  <span className="font-semibold text-gray-800 block">
                    {side === "this" ? "This Side" : "Other Side"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {side === "this" ? "Among the living" : "Beyond the veil"}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Act Description */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Describe the Act of Service
          </label>
          <textarea
            value={form.act_description}
            onChange={(e) => update("act_description", e.target.value)}
            required
            rows={4}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow resize-none"
            placeholder="What act of service did you perform?"
          />
        </div>

        {/* Error message */}
        {state === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-700 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={state === "submitting"}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-stone-300 disabled:to-stone-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none text-lg"
        >
          {state === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
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
              Submitting...
            </span>
          ) : (
            "Submit Act of Service"
          )}
        </button>
      </form>
    </div>
  );
}

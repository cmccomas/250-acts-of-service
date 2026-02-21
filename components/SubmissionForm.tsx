"use client";

import { useEffect, useState } from "react";

const REMEMBER_KEY = "acts_user_prefs";

type FormState = "idle" | "submitting" | "success" | "error";

const WARD_OPTIONS = [
  "Beacon Hill",
  "Foothills",
  "Friendship Park",
  "Greenbluff",
  "Morgan Acres",
  "Peone Creek",
  "Spokane River YSA",
  "West Valley",
];

function loadSavedPrefs() {
  try {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) return JSON.parse(saved) as { name?: string; email?: string; ward_name?: string };
  } catch { /* ignore */ }
  return {};
}

// Returns true if the text appears to contain a person's name
function looksLikeItContainsName(text: string): boolean {
  if (text.length < 6) return false;
  // Two consecutive capitalized words (e.g. "John Smith", "Mary Jane")
  if (/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(text)) return true;
  // "Brother/Sister/Bro/Sis" followed by a capitalized word
  if (/\b(Brother|Sister|Bro|Sis|Elder|President|Bishop)\s+[A-Z][a-z]+\b/i.test(text)) return true;
  // "my friend/neighbor/husband/wife [Name]"
  if (/\b(my\s+)?(friend|neighbor|neighbour|husband|wife|son|daughter|mom|dad|mother|father)\s+[A-Z][a-z]+\b/i.test(text)) return true;
  return false;
}

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

  // Load remembered values on mount
  useEffect(() => {
    const prefs = loadSavedPrefs();
    if (prefs.name || prefs.email || prefs.ward_name) {
      setForm((prev) => ({
        ...prev,
        name: prefs.name ?? prev.name,
        email: prefs.email ?? prev.email,
        ward_name: prefs.ward_name ?? prev.ward_name,
      }));
    }
  }, []);

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
        // Remember name, email, ward for next time
        try {
          localStorage.setItem(
            REMEMBER_KEY,
            JSON.stringify({ name: form.name, email: form.email, ward_name: form.ward_name })
          );
        } catch {
          // Ignore storage errors
        }
        setState("success");
        const prefs = loadSavedPrefs();
        setForm({
          name: prefs.name ?? "",
          email: prefs.email ?? "",
          ward_name: prefs.ward_name ?? "",
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
      <div className="bg-forest-50 border border-forest-200 rounded p-8 text-center shadow-sm">
        <div className="text-5xl mb-4">🌟</div>
        <h2 className="font-serif text-2xl font-bold text-forest-800 mb-2">
          Thank You!
        </h2>
        <p className="text-forest-700 mb-2">
          Your act of service has been recorded and submitted for review.
        </p>
        <p className="text-forest-600 text-sm mb-6">
          The world is a better place because of people like you.
        </p>
        <button
          onClick={() => setState("idle")}
          className="bg-forest-700 hover:bg-forest-800 text-white font-semibold px-6 py-2.5 rounded transition-colors shadow-sm"
        >
          Submit Another Act
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow-sm border border-charcoal/10 p-6 sm:p-8">
      <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">
        Record an Act of Service
      </h2>
      <p className="text-charcoal/50 text-sm mb-6">
        Share the good you&apos;ve done to inspire others.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-charcoal/80 mb-1.5">
            Your Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
            className="w-full border border-charcoal/15 rounded px-4 py-2.5 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-shadow"
            placeholder="Full name"
          />
        </div>

        {/* Email or Phone */}
        <div>
          <label className="block text-sm font-semibold text-charcoal/80 mb-1.5">
            Email or Phone Number
          </label>
          <input
            type="text"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            className="w-full border border-charcoal/15 rounded px-4 py-2.5 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-shadow"
            placeholder="you@example.com or (509) 555-1234"
          />
        </div>

        {/* Ward */}
        <div>
          <label className="block text-sm font-semibold text-charcoal/80 mb-1.5">
            Ward Name
          </label>
          <div className="flex flex-wrap gap-2">
            {WARD_OPTIONS.map((ward) => (
              <button
                key={ward}
                type="button"
                onClick={() => update("ward_name", ward)}
                className={`px-3 py-1.5 rounded border text-sm font-medium transition-all ${
                  form.ward_name === ward
                    ? "border-forest-400 bg-forest-50 text-forest-800 shadow-sm"
                    : "border-charcoal/15 bg-white text-charcoal/70 hover:border-charcoal/30 hover:text-charcoal"
                }`}
              >
                {ward}
              </button>
            ))}
          </div>
          {/* Hidden required input to enforce selection for form validation */}
          <input
            type="text"
            required
            value={form.ward_name}
            onChange={() => {}}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Side of the Veil */}
        <div>
          <label className="block text-sm font-semibold text-charcoal/80 mb-2">
            Side of the Veil
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["this", "other"] as const).map((side) => (
              <label
                key={side}
                className={`flex items-center gap-3 p-4 rounded border-2 cursor-pointer transition-all ${
                  form.side_of_veil === side
                    ? side === "this"
                      ? "border-forest-400 bg-forest-50 shadow-sm"
                      : "border-gold-400 bg-gold-50 shadow-sm"
                    : "border-charcoal/10 hover:border-charcoal/20 bg-white"
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
                  <span className="font-semibold text-charcoal block">
                    {side === "this" ? "This Side" : "Other Side"}
                  </span>
                  <span className="text-xs text-charcoal/50">
                    {side === "this" ? "Among the living" : "Beyond the veil"}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Act Description */}
        <div>
          <label className="block text-sm font-semibold text-charcoal/80 mb-1">
            Describe the Act of Service
          </label>
          <p className="text-xs text-charcoal/40 mb-1.5">
            Keep it anonymous — no names or personal information.
          </p>
          {looksLikeItContainsName(form.act_description) && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-2">
              <span className="text-amber-500 text-sm mt-0.5">⚠</span>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                It looks like your description might include someone&apos;s name. Please keep submissions anonymous — remove any names or personal details before submitting.
              </p>
            </div>
          )}
          <textarea
            value={form.act_description}
            onChange={(e) => update("act_description", e.target.value)}
            required
            rows={4}
            className="w-full border border-charcoal/15 rounded px-4 py-2.5 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-shadow resize-none"
            placeholder="What act of service did you perform?"
          />
        </div>

        {/* Error message */}
        {state === "error" && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
            <p className="text-red-700 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={state === "submitting"}
          className={`w-full text-white font-bold py-3.5 rounded transition-all shadow-sm hover:shadow disabled:shadow-none text-lg disabled:bg-charcoal/20 ${
            form.side_of_veil === "other"
              ? "bg-gold-600 hover:bg-gold-700"
              : "bg-forest-700 hover:bg-forest-800"
          }`}
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

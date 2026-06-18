"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import {
  RESOURCE_OPTIONS,
  AVAILABILITY_OPTIONS,
} from "@/lib/emergencyResources";

type FormState = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmergencyResourceForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    availability: [] as string[],
    resources: [] as string[],
    other_resources: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAvailability(option: string) {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter((a) => a !== option)
        : [...prev.availability, option],
    }));
  }

  function toggleResource(resource: string) {
    setForm((prev) => ({
      ...prev,
      resources: prev.resources.includes(resource)
        ? prev.resources.filter((r) => r !== resource)
        : [...prev.resources, resource],
    }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.email.trim()) return "Please enter your email address.";
    if (!EMAIL_RE.test(form.email.trim()))
      return "Please enter a valid email address.";
    if (!form.phone.trim()) return "Please enter a phone number.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setState("error");
      setErrorMsg(validationError);
      return;
    }

    setState("submitting");
    setErrorMsg("");

    const { error } = await supabaseBrowser.from("resource_offers").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      availability: form.availability.length
        ? form.availability.join(", ")
        : null,
      resources: form.resources,
      other_resources: form.other_resources.trim() || null,
      notes: form.notes.trim() || null,
    });

    if (error) {
      // Keep what they typed so they can retry without losing anything.
      setState("error");
      setErrorMsg(
        "We could not save your offer just now. Please check your connection and try again."
      );
      return;
    }

    setState("success");
  }

  if (state === "success") {
    return (
      <div className="bg-forest-50 border border-forest-200 rounded p-8 text-center shadow-sm">
        <div className="text-5xl mb-4" aria-hidden="true">
          🤝
        </div>
        <h2 className="font-serif text-2xl font-bold text-forest-800 mb-2">
          Thank you.
        </h2>
        <p className="text-forest-700 mb-6 leading-relaxed">
          We have your offer and will reach out as we coordinate relief efforts.
        </p>
        <button
          onClick={() => {
            setForm({
              name: "",
              email: "",
              phone: "",
              availability: [],
              resources: [],
              other_resources: "",
              notes: "",
            });
            setState("idle");
          }}
          className="bg-forest-700 hover:bg-forest-800 text-white font-semibold px-6 py-3 rounded transition-colors shadow-sm"
        >
          Submit another offer
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full border border-charcoal/15 rounded px-4 py-3 text-base text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-shadow";

  return (
    <div className="bg-white rounded shadow-sm border border-charcoal/10 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Contact */}
        <fieldset className="space-y-4">
          <legend className="font-serif text-lg font-bold text-charcoal mb-1">
            Your contact information
          </legend>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-charcoal/80 mb-1.5"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className={inputClass}
              placeholder="First and last name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-charcoal/80 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-charcoal/80 mb-1.5"
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
              className={inputClass}
              placeholder="(509) 555-1234"
            />
          </div>
        </fieldset>

        {/* Availability */}
        <fieldset>
          <legend className="font-serif text-lg font-bold text-charcoal mb-1">
            When are you available?
          </legend>
          <div className="space-y-2.5 mt-3">
            {AVAILABILITY_OPTIONS.map((option) => {
              const checked = form.availability.includes(option);
              return (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-4 rounded border-2 cursor-pointer transition-all ${
                    checked
                      ? "border-forest-400 bg-forest-50 shadow-sm"
                      : "border-charcoal/10 hover:border-charcoal/20 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAvailability(option)}
                    className="h-5 w-5 accent-forest-600 flex-shrink-0"
                  />
                  <span className="text-charcoal font-medium">{option}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Resources */}
        <fieldset>
          <legend className="font-serif text-lg font-bold text-charcoal mb-3">
            Resources I can offer
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {RESOURCE_OPTIONS.map((resource) => {
              const checked = form.resources.includes(resource);
              return (
                <label
                  key={resource}
                  className={`flex items-center gap-3 p-4 rounded border-2 cursor-pointer transition-all ${
                    checked
                      ? "border-forest-400 bg-forest-50 shadow-sm"
                      : "border-charcoal/10 hover:border-charcoal/20 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleResource(resource)}
                    className="h-5 w-5 accent-forest-600 flex-shrink-0"
                  />
                  <span className="text-charcoal font-medium">{resource}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Other resources */}
        <div>
          <label
            htmlFor="other_resources"
            className="block font-serif text-lg font-bold text-charcoal mb-1"
          >
            Other resources
          </label>
          <p className="text-sm text-charcoal/50 mb-2">
            Anything else you have that could help.
          </p>
          <textarea
            id="other_resources"
            value={form.other_resources}
            onChange={(e) => update("other_resources", e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block font-serif text-lg font-bold text-charcoal mb-1"
          >
            Notes <span className="font-sans text-sm font-normal text-charcoal/40">(optional)</span>
          </label>
          <p className="text-sm text-charcoal/50 mb-2">
            Anything we should know: quantities, pickup details, and so on.
          </p>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Error message */}
        {state === "error" && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3">
            <p className="text-red-700 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={state === "submitting"}
          className="w-full bg-forest-700 hover:bg-forest-800 disabled:bg-charcoal/20 text-white font-bold py-4 rounded transition-all shadow-sm hover:shadow text-lg"
        >
          {state === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
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
            "Submit my offer"
          )}
        </button>
      </form>
    </div>
  );
}

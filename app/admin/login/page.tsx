"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error ?? "Login failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded shadow-sm border border-charcoal/10 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Admin Login</h1>
          <p className="text-charcoal/50 text-sm mt-1">
            Enter the admin password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
            className="w-full bg-forest-700 hover:bg-forest-800 disabled:bg-charcoal/20 text-white font-semibold py-3 rounded transition-colors shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-charcoal/50 hover:text-charcoal/70 text-sm underline"
          >
            &larr; Back to home
          </a>
        </div>
      </div>
    </main>
  );
}

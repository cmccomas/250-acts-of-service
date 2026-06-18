import type { Metadata } from "next";
import { EmergencyResourceForm } from "@/components/EmergencyResourceForm";

export const metadata: Metadata = {
  title: "Upriver Fire Relief | Mount Spokane Stake",
  description:
    "Members of the Mount Spokane Stake can share equipment and supplies to help neighbors affected by the Upriver Fire.",
};

export default function EmergencySignupPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-forest-700 mb-2">
          Mount Spokane Stake
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-3 leading-tight">
          Upriver Fire Relief
        </h1>
        <p className="text-charcoal/70 leading-relaxed">
          The Upriver Fire has destroyed homes near Spokane. Share the equipment
          and supplies you have available to lend or donate, and we will
          coordinate getting them to neighbors who need help.
        </p>
      </header>

      <EmergencyResourceForm />

      <footer className="text-center text-charcoal/40 text-xs py-8 mt-4">
        Mount Spokane Stake | The Church of Jesus Christ of Latter-day Saints
      </footer>
    </main>
  );
}

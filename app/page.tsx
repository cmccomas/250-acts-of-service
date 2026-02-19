import { getProgressCounts, getRandomApprovedActs } from "@/lib/db";
import { SubmissionForm } from "@/components/SubmissionForm";
import { ThermometerPair } from "@/components/Thermometer";
import { ActsDisplay } from "@/components/ActsDisplay";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const counts = getProgressCounts();
  const initialActs = getRandomApprovedActs(6);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-800 mb-3 tracking-tight">
          250 Acts of Service
        </h1>
        <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Together we can complete 250 acts of service on both sides of the veil.
          Every act of kindness matters.
        </p>
      </header>

      {/* Main content: Form + Thermometer */}
      <section className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12 sm:mb-16 items-start">
        {/* Form */}
        <div className="flex-1 w-full">
          <SubmissionForm />
        </div>

        {/* Thermometer */}
        <div className="flex-shrink-0 flex justify-center w-full lg:w-auto lg:sticky lg:top-8">
          <ThermometerPair initialCounts={counts} goal={250} />
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-stone-300 text-2xl">✦</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* Inspiration section */}
      <section className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2 text-center">
          Be Inspired
        </h2>
        <p className="text-stone-500 text-sm text-center mb-8">
          See what others have done and be inspired to serve.
        </p>
        <ActsDisplay initialActs={initialActs} />
      </section>

      {/* Footer */}
      <footer className="text-center text-stone-400 text-xs py-6 border-t border-stone-200">
        250 Acts of Service &middot; Making the world a better place, one act at
        a time.
      </footer>
    </main>
  );
}

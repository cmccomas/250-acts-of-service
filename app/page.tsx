import { getProgressCounts, getRandomApprovedActs, getWardStats } from "@/lib/db";
import { SubmissionForm } from "@/components/SubmissionForm";
import { ThermometerPair } from "@/components/Thermometer";
import { ActsDisplay } from "@/components/ActsDisplay";
import { WardDashboard } from "@/components/WardDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const counts = await getProgressCounts();
  const initialActs = await getRandomApprovedActs(6);
  const wardStats = await getWardStats();

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="text-left mb-10 sm:mb-14">
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-2 leading-tight">
          The Mount Spokane Stake Celebrates America 250
        </h1>
        <p className="font-serif text-sm sm:text-base text-forest-700 max-w-2xl leading-relaxed italic">
          with 250 acts of service, on each side of the veil
        </p>
        <p className="text-charcoal/60 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
          Together we can complete 250 acts of service on each side of the veil.
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
        <div className="flex-1 h-px bg-charcoal/10" />
        <span className="text-gold-500 text-2xl">✦</span>
        <div className="flex-1 h-px bg-charcoal/10" />
      </div>

      {/* Inspiration section */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-2 text-center">
          Be Inspired
        </h2>
        <p className="text-charcoal/50 text-sm text-center mb-8">
          See what others have done and be inspired to serve.
        </p>
        <ActsDisplay initialActs={initialActs} />
      </section>

      {/* Ward Dashboard */}
      {wardStats.length > 0 && (
        <section className="mb-8 max-w-sm">
          <WardDashboard initialStats={wardStats} />
        </section>
      )}

      {/* Footer */}
      <footer className="text-center text-charcoal/40 text-xs py-6 border-t border-charcoal/10">
        250 Acts of Service &middot; Mt. Spokane Stake &middot; America 250
      </footer>
    </main>
  );
}

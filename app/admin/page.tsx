import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getAllPendingActs, getProgressCounts } from "@/lib/db";
import { AdminActRow } from "@/components/AdminActRow";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  const pendingActs = getAllPendingActs();
  const counts = getProgressCounts();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">
            Admin Dashboard
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Review and approve acts of service
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-stone-500 hover:text-stone-700 text-sm underline"
          >
            View site
          </a>
          <AdminLogoutButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-stone-800">
            {counts.total}
          </div>
          <div className="text-xs text-stone-500 font-medium">Total Acts</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-700">
            {counts.this_side}
          </div>
          <div className="text-xs text-green-600 font-medium">
            👤 This Side
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-yellow-700">
            {counts.other_side}
          </div>
          <div className="text-xs text-yellow-600 font-medium">
            ✨ Other Side
          </div>
        </div>
      </div>

      {/* Pending acts */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-stone-800">
          Pending Review
          {pendingActs.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center bg-stone-600 text-white text-xs font-bold w-6 h-6 rounded-full">
              {pendingActs.length}
            </span>
          )}
        </h2>
      </div>

      {pendingActs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-stone-700 text-lg font-medium">All caught up!</p>
          <p className="text-stone-500 text-sm mt-1">
            No pending acts to review. Check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingActs.map((act) => (
            <AdminActRow key={act.id} act={act} />
          ))}
        </div>
      )}
    </main>
  );
}

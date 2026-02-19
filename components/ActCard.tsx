import type { Act } from "@/lib/types";

interface ActCardProps {
  act: Act;
}

export function ActCard({ act }: ActCardProps) {
  const isThisSide = act.side_of_veil === "this";

  return (
    <div
      className={`rounded-2xl p-5 border-2 transition-shadow hover:shadow-md ${
        isThisSide
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
          : "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl" role="img" aria-label={isThisSide ? "This side of the veil" : "Other side of the veil"}>
          {isThisSide ? "👤" : "✨"}
        </span>
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isThisSide ? "text-green-700" : "text-yellow-700"
          }`}
        >
          {isThisSide ? "This Side" : "Other Side"}
        </span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">
        {act.act_description}
      </p>
    </div>
  );
}

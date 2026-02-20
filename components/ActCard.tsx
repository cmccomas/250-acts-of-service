import type { Act } from "@/lib/types";

interface ActCardProps {
  act: Act;
}

export function ActCard({ act }: ActCardProps) {
  const isThisSide = act.side_of_veil === "this";

  return (
    <div
      className={`rounded p-5 border transition-shadow hover:shadow-md ${
        isThisSide
          ? "bg-forest-50 border-forest-200"
          : "bg-gold-50 border-gold-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label={isThisSide ? "This side of the veil" : "Other side of the veil"}>
            {isThisSide ? "👤" : "✨"}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isThisSide ? "text-forest-700" : "text-gold-700"
            }`}
          >
            {isThisSide ? "This Side" : "Other Side"}
          </span>
        </div>
        {act.ward_name && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            isThisSide
              ? "bg-forest-100 text-forest-600"
              : "bg-gold-100 text-gold-700"
          }`}>
            {act.ward_name}
          </span>
        )}
      </div>
      <p className="text-charcoal/80 text-sm leading-relaxed">
        {act.act_description}
      </p>
    </div>
  );
}

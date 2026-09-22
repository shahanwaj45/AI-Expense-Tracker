import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { BudgetCategory } from "@/types";

interface Props {
  categories: BudgetCategory[];
  usedPercent: number;
}

export default function BudgetHealthCard({ categories, usedPercent }: Props) {
  // Guard: if no categories yet, show empty donut
  const safeCats = categories ?? [];
  const segments: string[] = [];
  if (safeCats.length > 0) {
    const step = 100 / safeCats.length;
    safeCats.forEach((cat, i) => {
      const start = Math.round(i * step);
      const end = Math.round((i + 1) * step);
      segments.push(`${cat.color} ${start}% ${end}%`);
    });
    const lastEnd = Math.round(safeCats.length * step);
    if (lastEnd < 100) segments.push(`#edf0ec ${lastEnd}% 100%`);
  } else {
    segments.push(`#edf0ec 0% 100%`);
  }

  return (
    <section className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#9aa69f]">
            Budget health
          </p>
          <h3 className="mt-1 font-display text-[21px] font-bold tracking-[-.05em]">
            Where your money goes
          </h3>
        </div>
        <button
          onClick={() => toast.info("Budget details opened")}
          className="rounded-xl bg-[#f7f9f6] p-2"
        >
          <MoreHorizontal size={18} className="text-[#8b9891]" />
        </button>
      </div>
      <div className="mt-7 flex items-center gap-6">
        <div
          className="relative grid h-[126px] w-[126px] shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#7BE2BE 0 34%, #a29bf4 34% 56%, #f6ae8e 56% 74%, #a9dced 74% 88%, #edf0ec 88% 100%)`,
          }}
        >
          <div className="grid h-[86px] w-[86px] place-items-center rounded-full bg-white">
            <div className="text-center">
              <p className="font-display text-[22px] font-bold">{usedPercent}%</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#9ca8a1]">
                used
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {safeCats.map((cat) => (
            <div key={cat.label} className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="w-12 text-[11px] text-[#77847c]">{cat.label}</span>
              <span className="text-[11px] font-bold">{cat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

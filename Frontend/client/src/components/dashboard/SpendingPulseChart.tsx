import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { TrendBar } from "@/types";

interface Props {
  trendBars: TrendBar[];
}

export default function SpendingPulseChart({ trendBars }: Props) {
  return (
    <section className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] sm:p-7">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#9aa69f]">
            Spending pulse
          </p>
          <h3 className="mt-1 font-display text-[21px] font-bold tracking-[-.05em]">
            Monthly expense trend
          </h3>
        </div>
        <button
          onClick={() => toast.info("Showing last 12 months")}
          className="flex items-center gap-2 rounded-xl bg-[#f5f8f4] px-3 py-2 text-[11px] font-bold text-[#738079]"
        >
          This year <ChevronDown size={14} />
        </button>
      </div>
      <div className="flex h-[185px] items-end gap-2 sm:gap-4">
        {trendBars.map((bar, index) => (
          <div key={index} className="group flex h-full flex-1 flex-col justify-end">
            <div
              className={`relative w-full rounded-t-[8px] transition-all duration-300 group-hover:-translate-y-1 ${
                bar.isHighlighted ? "bg-[#172532]" : "bg-[#d9f1e6]"
              }`}
              style={{ height: `${bar.height}%` }}
            >
              <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-[9px] font-bold text-[#5b6a62] group-hover:block whitespace-nowrap">
                ₹{bar.amount !== undefined ? Math.round(bar.amount).toLocaleString('en-IN') : Math.round(bar.height * 420).toLocaleString('en-IN')}
              </span>
            </div>
            <span className="mt-3 text-center text-[10px] text-[#a1aaa5]">
              {bar.month}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

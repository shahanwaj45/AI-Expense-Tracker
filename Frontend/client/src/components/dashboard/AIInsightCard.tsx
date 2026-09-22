import { ArrowUpRight, Sparkles } from "lucide-react";
import type { AIInsight } from "@/types";

interface Props {
  insight: AIInsight;
  onAction?: () => void;
}

export default function AIInsightCard({ insight, onAction }: Props) {
  const safeInsight = insight ?? {
    headline: "Your financial data is being analysed.",
    description: "AI insights will appear here once enough data is collected. Keep adding transactions!",
    timestamp: "Just now",
  };
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-[#eef3ff] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)] sm:p-7">
      <div className="absolute -right-7 -top-10 h-36 w-36 rounded-full bg-[#d9d4ff] blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#695db3]">
            <Sparkles size={13} /> AI note
          </div>
          <span className="text-[11px] font-semibold text-[#8c8bb3]">{safeInsight.timestamp}</span>
        </div>
        <h3 className="mt-6 max-w-[280px] font-display text-[22px] font-bold leading-tight tracking-[-.05em] text-[#28364c]">
          {safeInsight.headline}
        </h3>
        <p className="mt-3 max-w-[320px] text-[12px] leading-6 text-[#717c95]">
          {safeInsight.description}
        </p>
        <button
          onClick={onAction}
          className="mt-6 flex items-center gap-2 text-[12px] font-bold text-[#5c52a5]"
        >
          See recommendation <ArrowUpRight size={15} />
        </button>
        <img
          src="/manus-storage/soft-signal-ai-illustration_27e3b90d.png"
          alt=""
          className="pointer-events-none absolute -bottom-7 -right-8 h-32 w-40 object-contain opacity-75"
        />
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { PiggyBank } from "lucide-react";
import type { HeroMetric } from "@/types";

interface Props {
  metric: HeroMetric;
}

export default function HeroMetricCard({ metric }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative min-h-[238px] overflow-hidden rounded-[26px] bg-[#172532] p-7 text-white shadow-[10px_14px_35px_rgba(23,37,50,.16)]"
    >
      <img
        src="/manus-storage/soft-signal-hero_442e743e.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
      />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#a5b9b0]">
              {metric.label}
            </p>
            <p className="mt-3 font-display text-[42px] font-bold tracking-[-.07em]">
              {metric.value}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5">
            <PiggyBank className="text-[#7BE2BE]" size={20} />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#a5b9b0]">
            <span>{metric.progressLabel}</span>
            <span className="font-bold text-[#d6eee4]">{metric.progressPercent}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metric.progressValue}%` }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
              className="h-full rounded-full bg-[#7BE2BE]"
            />
          </div>
          <p className="mt-3 text-[11px] text-[#a5b9b0]">{metric.subtitle}</p>
        </div>
      </div>
    </motion.section>
  );
}

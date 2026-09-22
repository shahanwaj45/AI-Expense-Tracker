import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { StatMetric } from "@/types";

interface Props {
  metric: StatMetric;
  index: number;
}

export default function StatCard({ metric, index }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * (index + 1), duration: 0.45 }}
      className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]"
    >
      <div className="flex items-start justify-between">
        <span
          className={`grid h-10 w-10 place-items-center rounded-[13px] ${
            metric.tone === "coral"
              ? "bg-[#fff0eb] text-[#e98b68]"
              : "bg-[#e7f8ef] text-[#41aa7e]"
          }`}
        >
          <metric.icon size={19} />
        </span>
        <button onClick={() => toast.info("Metric details are available in Analytics")}>
          <MoreHorizontal size={18} className="text-[#a3aea8]" />
        </button>
      </div>
      <p className="mt-7 text-[12px] font-semibold text-[#849089]">{metric.label}</p>
      <p className="mt-1 font-display text-[28px] font-bold tracking-[-.06em]">{metric.value}</p>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold">
        <span className={metric.positive ? "text-[#4aaf82]" : "text-[#e68767]"}>
          {metric.positive ? "↑" : "↓"} {metric.delta}
        </span>
        <span className="font-medium text-[#a2aca7]">vs last month</span>
      </div>
    </motion.section>
  );
}

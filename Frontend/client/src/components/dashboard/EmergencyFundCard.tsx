import { ArrowUpRight, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import type { EmergencyFundData } from "@/types";

interface Props {
  fund: EmergencyFundData;
}

export default function EmergencyFundCard({ fund }: Props) {
  return (
    <section className="rounded-[26px] bg-[#fff8f3] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#ad9584]">
            Emergency fund
          </p>
          <h3 className="mt-1 font-display text-[21px] font-bold tracking-[-.05em]">
            A softer landing
          </h3>
        </div>
        <HeartPulse size={20} className="text-[#ed9b76]" />
      </div>
      <div className="mt-6 flex items-end justify-between">
        <p className="font-display text-[30px] font-bold tracking-[-.06em]">
          ₹{fund.current.toLocaleString("en-IN")}
        </p>
        <p className="mb-1 text-[11px] font-bold text-[#d78a67]">
          {fund.monthsCovered} months covered
        </p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#f3e5dc]">
        <div
          className="h-full rounded-full bg-[#ed9b76]"
          style={{ width: `${fund.percentComplete}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[#b59d8d]">
        <span>Current</span>
        <span>Recommended ₹{fund.recommended.toLocaleString("en-IN")}</span>
      </div>
      <button
        onClick={() => toast.success("Emergency fund contribution flow opened")}
        className="mt-5 text-[12px] font-bold text-[#c87855]"
      >
        Add contribution <ArrowUpRight size={14} className="ml-1 inline" />
      </button>
    </section>
  );
}

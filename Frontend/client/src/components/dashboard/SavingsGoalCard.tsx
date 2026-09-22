import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import type { SavingsGoal } from "@/types";

interface Props {
  goal: SavingsGoal;
}

export default function SavingsGoalCard({ goal }: Props) {
  const remaining = goal.target - goal.current;

  return (
    <section className="rounded-[26px] bg-[#eaf8f4] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#73a291]">
            Savings goal
          </p>
          <h3 className="mt-1 font-display text-[21px] font-bold tracking-[-.05em]">
            {goal.name}
          </h3>
        </div>
        <Target size={20} className="text-[#4caf89]" />
      </div>
      <div className="mt-6 flex items-end justify-between">
        <p className="font-display text-[30px] font-bold tracking-[-.06em]">
          ₹{goal.current.toLocaleString("en-IN")}
        </p>
        <p className="mb-1 text-[11px] font-bold text-[#499876]">
          {goal.percentComplete}% complete
        </p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#cdeee1]">
        <div
          className="h-full rounded-full bg-[#4caf89]"
          style={{ width: `${goal.percentComplete}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[#81a99d]">
        <span>₹{goal.current.toLocaleString("en-IN")} saved</span>
        <span>₹{remaining.toLocaleString("en-IN")} left</span>
      </div>
      <button
        onClick={() => toast.success(`Contribution added to ${goal.name}`)}
        className="mt-5 text-[12px] font-bold text-[#3c896c]"
      >
        Add contribution <Plus size={14} className="ml-1 inline" />
      </button>
    </section>
  );
}

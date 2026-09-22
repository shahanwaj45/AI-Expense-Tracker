import { useEffect, useState } from "react";
import { Goal, Plus } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import SavingsGoalCard from "@/components/dashboard/SavingsGoalCard";
import { studentNav } from "@/data/studentData";
import api from "@/lib/api";

export default function SavingsGoals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const res = await api.get("/savings-goals");
      if (res.data.success) setGoals(res.data.data);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  return (
    <DashboardLayout role="student" navItems={studentNav} pageTitle="Savings Goals">
      <FeaturePageHeader
        role="student"
        title="Savings Goals"
        description="Set targets for things that matter. Track your progress and celebrate milestones along the way."
        icon={Goal}
        accentColor="#4caf89"
        accentBg="#e7f8ef"
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#4caf89] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((g: any) => (
            <SavingsGoalCard key={g.id} goal={g} />
          ))}
          {goals.length === 0 && (
            <div className="col-span-3 rounded-[26px] bg-[#f9fbf8] p-8 text-center text-[#82908a]">
              No savings goals yet. Create one to start tracking!
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => toast.info("Goal creation form coming soon!")}
        className="mt-5 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[12px] font-bold text-[#3c896c] shadow-[4px_6px_16px_rgba(42,65,55,.06)] transition hover:-translate-y-0.5"
      >
        <Plus size={16} /> Create new goal
      </button>
    </DashboardLayout>
  );
}

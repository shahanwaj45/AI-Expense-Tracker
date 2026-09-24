import { useEffect, useState } from "react";
import { Goal, Plus, X, Award, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import SavingsGoalCard from "@/components/dashboard/SavingsGoalCard";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function SavingsGoals() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Goal Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [creating, setCreating] = useState(false);

  // Contribute Modal state
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [contribAmount, setContribAmount] = useState("");
  const [contributing, setContributing] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/savings-goals");
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!goalName.trim()) {
      toast.error("Please enter a goal name");
      return;
    }
    if (!target || target <= 0) {
      toast.error("Please enter a valid target amount greater than ₹0");
      return;
    }

    try {
      setCreating(true);
      const payload: any = {
        name: goalName.trim(),
        target_amount: target,
        current_amount: parseFloat(initialAmount) || 0,
      };
      if (deadline) payload.deadline = deadline;

      const res = await api.post("/savings-goals", payload);
      if (res.data.success) {
        toast.success(`Savings goal "${goalName}" created!`);
        setIsCreateModalOpen(false);
        setGoalName("");
        setTargetAmount("");
        setInitialAmount("");
        setDeadline("");
        await fetchGoals();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create savings goal");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenContribute = (goal: any) => {
    setSelectedGoal(goal);
    setContribAmount("1000");
    setIsContributeModalOpen(true);
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const amt = parseFloat(contribAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter an amount greater than ₹0");
      return;
    }

    try {
      setContributing(true);
      const res = await api.post(`/savings-goals/${selectedGoal.id}/contribute`, {
        amount: amt,
      });
      if (res.data.success) {
        toast.success(`Added ₹${amt.toLocaleString("en-IN")} to ${selectedGoal.name}! 🎉`);
        setIsContributeModalOpen(false);
        setSelectedGoal(null);
        await fetchGoals();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add contribution");
    } finally {
      setContributing(false);
    }
  };

  const handleDeleteGoal = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the goal "${name}"?`)) return;

    try {
      await api.delete(`/savings-goals/${id}`);
      toast.success(`Deleted "${name}"`);
      await fetchGoals();
    } catch (err: any) {
      toast.error("Failed to delete goal");
    }
  };

  // Metrics
  const totalSaved = goals.reduce((acc, g) => acc + (g.current || g.current_amount || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + (g.target || g.target_amount || 0), 0);
  const completedGoalsCount = goals.filter((g) => (g.percentComplete ?? 0) >= 100).length;

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Savings Goals"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FeaturePageHeader
          role={role!}
          title="Savings Goals"
          description="Set targets for things that matter. Track your progress and celebrate milestones along the way."
          icon={Goal}
          accentColor="#4caf89"
          accentBg="#e7f8ef"
        />

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#4caf89] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#4caf89]/25 transition hover:bg-[#439c7a] active:scale-95"
        >
          <Plus size={16} /> Create new goal
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#edf3ef]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#869990]">Total Accumulated</span>
          <p className="mt-2 font-display text-[26px] font-bold text-[#172532]">
            ₹{totalSaved.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#4caf89] font-semibold">
            {totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}% of combined target` : "No active targets"}
          </p>
        </div>

        <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#edf3ef]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#869990]">Target Goal Sum</span>
          <p className="mt-2 font-display text-[26px] font-bold text-[#172532]">
            ₹{totalTarget.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#869990]">{goals.length} total goals tracked</p>
        </div>

        <div className="rounded-[22px] bg-[#eaf8f0] p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#cbeee0]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#2e7d5a]">Milestones Reached</span>
          <p className="mt-2 font-display text-[26px] font-bold text-[#237c53]">
            {completedGoalsCount} / {goals.length}
          </p>
          <p className="text-[11px] text-[#429570]">
            {completedGoalsCount > 0 ? "Goals 100% completed 🎉" : "Work towards your first milestone"}
          </p>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#4caf89] border-t-transparent" />
          </div>
        ) : goals.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((g: any) => (
              <SavingsGoalCard
                key={g.id}
                goal={g}
                onContribute={handleOpenContribute}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[26px] bg-[#f8faf8] p-10 text-center border border-[#e8efe9]">
            <Sparkles size={36} className="mx-auto mb-3 text-[#4caf89]" />
            <h4 className="font-display text-[18px] font-bold text-[#172532]">No savings goals created yet</h4>
            <p className="mt-1 text-[13px] text-[#82908a]">
              Setting dedicated savings targets helps you budget effectively for big plans.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#4caf89] px-5 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#4caf89]/25 hover:bg-[#439c7a] transition"
            >
              <Plus size={16} /> Create your first goal
            </button>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf2ed]">
              <h3 className="font-display text-[20px] font-bold text-[#172532]">
                New Savings Goal
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full p-1.5 text-[#82908a] hover:bg-[#f3f6f3] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro, Trip to Goa, Camera"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3.5 py-2.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Target Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Initial Saved Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 5000"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Target Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3.5 py-2.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12px] font-bold text-[#82908a] hover:bg-[#f3f6f3] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-[#4caf89] px-5 py-2 text-[12px] font-bold text-white shadow-md shadow-[#4caf89]/25 transition hover:bg-[#439c7a] disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute to Goal Modal */}
      {isContributeModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf2ed]">
              <div>
                <h3 className="font-display text-[20px] font-bold text-[#172532]">
                  Add Contribution
                </h3>
                <p className="text-[12px] text-[#82908a]">to {selectedGoal.name}</p>
              </div>
              <button
                onClick={() => setIsContributeModalOpen(false)}
                className="rounded-full p-1.5 text-[#82908a] hover:bg-[#f3f6f3] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleContribute} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Quick Amount Presets
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setContribAmount(String(preset))}
                      className={`rounded-xl py-2 text-[12px] font-bold transition border ${
                        contribAmount === String(preset)
                          ? "bg-[#4caf89] text-white border-[#4caf89]"
                          : "bg-[#f8faf8] text-[#556960] border-[#dfe5df] hover:bg-[#eef5f1]"
                      }`}
                    >
                      +₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Contribution Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="50"
                    placeholder="Enter custom amount"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12px] font-bold text-[#82908a] hover:bg-[#f3f6f3] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contributing}
                  className="rounded-xl bg-[#4caf89] px-5 py-2 text-[12px] font-bold text-white shadow-md shadow-[#4caf89]/25 transition hover:bg-[#439c7a] disabled:opacity-50"
                >
                  {contributing ? "Adding..." : "Confirm Contribution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

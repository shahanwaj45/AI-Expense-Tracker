import { useEffect, useState } from "react";
import { WalletCards, Plus, ArrowDownLeft, Settings2, Check } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import AddExpenseModal from "@/components/dashboard/AddExpenseModal";
import { studentNav } from "@/data/studentData";
import api from "@/lib/api";

export default function PocketMoney() {
  const [data, setData] = useState<any>(null);
  const [incomeList, setIncomeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [allowanceInput, setAllowanceInput] = useState("");
  const [savingAllowance, setSavingAllowance] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, incRes] = await Promise.all([
        api.get("/dashboard/student"),
        api.get("/transactions", { params: { type: "income", limit: 5 } }),
      ]);
      if (dashRes.data?.success) setData(dashRes.data.data);
      if (incRes.data?.success) setIncomeList(incRes.data.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const saveAllowance = async () => {
    const amt = parseFloat(allowanceInput);
    if (!amt || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid allowance amount");
      return;
    }
    try {
      setSavingAllowance(true);
      await api.patch("/users/me", { monthly_allowance: amt });
      toast.success(`Monthly allowance updated to ₹${amt.toLocaleString("en-IN")}`);
      setShowAllowanceModal(false);
      fetchDashboard();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Failed to update allowance");
    } finally {
      setSavingAllowance(false);
    }
  };

  const heroMetric = data?.heroMetric;
  const statMetrics = data?.statMetrics ?? [];
  const trendBars = data?.trendBars ?? [];
  const monthSpent = statMetrics.find((m: any) => m.label?.toLowerCase().includes("spent"))?.value ?? "—";
  const remaining = heroMetric?.value ?? "—";

  // Daily spend from trendBars
  const dailyBars = trendBars.slice(-16);
  const maxVal = Math.max(...dailyBars.map((b: any) => b.value || 0), 1);

  return (
    <DashboardLayout role="student" navItems={studentNav} pageTitle="Pocket Money">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FeaturePageHeader
          role="student"
          title="Pocket Money"
          description="Track your monthly allowance, daily spending power, and where every rupee goes. Stay in control of your student finances."
          icon={WalletCards}
          accentColor="#7BE2BE"
          accentBg="#e7f8ef"
        />
        <div className="flex items-center gap-2 self-start sm:self-auto mb-4 sm:mb-0">
          <button
            onClick={() => {
              setAllowanceInput(data?.monthlyAllowance ? data.monthlyAllowance.replace(/[^\d.]/g, '') : "30000");
              setShowAllowanceModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-[#d5ddd6] bg-white px-3.5 py-2.5 text-[12px] font-bold text-[#172532] shadow-sm hover:bg-[#f6f8f6] transition"
          >
            <Settings2 size={15} className="text-[#5c8272]" /> Set Allowance
          </button>
          <button
            onClick={() => setShowAddMoney(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#2b7256] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(43,114,86,.3)] hover:bg-[#235d46] transition hover:-translate-y-0.5"
          >
            <Plus size={16} className="text-[#7BE2BE]" /> Add Money Received
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#7BE2BE] border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[26px] bg-[#172532] p-6 text-white shadow-[10px_14px_35px_rgba(23,37,50,.16)]">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#a5b9b0]">Balance Remaining</p>
              <p className="mt-3 font-display text-[38px] font-bold tracking-[-.07em]">{remaining}</p>
              <p className="mt-2 text-[11px] text-[#a5b9b0]">{heroMetric?.subtitle ?? "This month"}</p>
            </div>
            <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
              <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#9aa69f]">Spent this month</p>
              <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em]">{monthSpent}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold">
                <span className="font-medium text-[#a2aca7]">{heroMetric?.progressLabel ?? "Monthly usage"}</span>
              </div>
            </div>
            <div className="rounded-[26px] bg-[#eaf8f4] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)]">
              <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#73a291]">Safe to spend</p>
              <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em] text-[#2b7256]">
                {heroMetric?.subtitle?.split(" safe")[0] ?? "—"}
              </p>
              <p className="mt-2 text-[11px] text-[#81a99d]">per day for remaining days this month</p>
            </div>
          </div>

          {/* Recent Money Received / Income list */}
          <div className="mt-5 rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-[20px] font-bold tracking-[-.04em]">Money received this month</h3>
                <p className="text-[12px] text-[#82908a]">Pocket money, allowance, gifts, and stipends you logged.</p>
              </div>
              <button
                onClick={() => setShowAddMoney(true)}
                className="flex items-center gap-1 text-[12px] font-bold text-[#2b7256] hover:underline"
              >
                <Plus size={14} /> Add Money
              </button>
            </div>

            <div className="mt-4 divide-y divide-[#f0f4f1]">
              {incomeList.length > 0 ? incomeList.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eafaf3] text-[#2b7256]">
                      <ArrowDownLeft size={17} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#172532]">{item.name}</p>
                      <p className="text-[11px] text-[#9ba59f]">{item.date} · {item.category}</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-[#2b7256]">
                    +{item.amount_raw ? `₹${item.amount_raw.toLocaleString('en-IN')}` : item.amount}
                  </span>
                </div>
              )) : (
                <div className="py-6 text-center">
                  <p className="text-[12px] text-[#9ba59f]">No money received recorded yet this month.</p>
                  <button
                    onClick={() => setShowAddMoney(true)}
                    className="mt-2 text-[12px] font-bold text-[#2b7256] hover:underline"
                  >
                    + Log money received
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Monthly spending trend */}
          <div className="mt-5 rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
            <h3 className="font-display text-[21px] font-bold tracking-[-.05em]">Monthly spending trend</h3>
            <p className="mt-2 text-[12px] text-[#82908a]">Your spending pattern over the past months.</p>
            <div className="mt-6 flex h-[160px] items-end gap-1.5">
              {(dailyBars.length > 0 ? dailyBars : Array.from({ length: 12 }, (_, i) => ({ label: `M${i+1}`, value: 0 }))).map((b: any, i: number) => {
                const h = Math.max(10, (b.value / maxVal) * 100);
                return (
                  <div key={i} className="group flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t-md bg-[#d9f1e6] transition-all group-hover:-translate-y-1 group-hover:bg-[#7BE2BE]"
                      style={{ height: `${h}%` }}
                    />
                    <span className="mt-2 text-[8px] text-[#a1aaa5]">{b.label?.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Add Money Modal (Pre-selected to Income) */}
      <AddExpenseModal
        open={showAddMoney}
        onClose={() => { setShowAddMoney(false); fetchDashboard(); }}
        initialType="income"
      />

      {/* Monthly Allowance Update Dialog */}
      {showAllowanceModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#172532]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl border border-[#e2ece5]">
            <h3 className="font-display text-[18px] font-bold text-[#172532]">Update Monthly Allowance</h3>
            <p className="mt-1 text-[12px] text-[#82908a]">
              Set your monthly pocket money allowance or budget from parents/sponsors.
            </p>
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-[#76837b] mb-1">Monthly Allowance (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#8a978f]">₹</span>
                <input
                  type="number"
                  value={allowanceInput}
                  onChange={(e) => setAllowanceInput(e.target.value)}
                  placeholder="30000"
                  className="w-full h-11 rounded-xl border border-[#e2e9e2] pl-8 pr-3 text-[14px] font-bold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && saveAllowance()}
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={saveAllowance}
                disabled={savingAllowance}
                className="flex-1 h-10 rounded-xl bg-[#2b7256] text-[12px] font-bold text-white hover:bg-[#235d46] transition"
              >
                {savingAllowance ? "Saving..." : "Save Allowance"}
              </button>
              <button
                onClick={() => setShowAllowanceModal(false)}
                className="px-4 h-10 rounded-xl border border-[#d5ddd6] text-[12px] font-bold text-[#76837b] hover:bg-[#f6f8f6]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

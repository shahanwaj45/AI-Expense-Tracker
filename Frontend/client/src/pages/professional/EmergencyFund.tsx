import { useEffect, useState } from "react";
import { HeartPulse, Plus, ArrowDownLeft, Sliders, ShieldCheck, AlertCircle, X, History } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import EmergencyFundCard from "@/components/dashboard/EmergencyFundCard";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function EmergencyFund() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const [fund, setFund] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("5000");
  const [depositing, setDepositing] = useState(false);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [monthlyExpense, setMonthlyExpense] = useState("30000");
  const [adjusting, setAdjusting] = useState(false);

  const fetchFund = async () => {
    try {
      setLoading(true);
      const res = await api.get("/emergency-fund");
      if (res.data.success) {
        setFund(res.data.data.fund);
        setHistory(res.data.data.contributions ?? []);
        if (res.data.data.fund?.monthly_expense_estimate) {
          setMonthlyExpense(String(res.data.data.fund.monthly_expense_estimate));
        }
      }
    } catch (err) {
      console.error("Failed to load emergency fund:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFund();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter an amount greater than ₹0");
      return;
    }
    try {
      setDepositing(true);
      const res = await api.post("/emergency-fund/contribute", { amount: amt });
      if (res.data.success) {
        toast.success(`Deposited ₹${amt.toLocaleString("en-IN")} into your Emergency Fund!`);
        setDepositOpen(false);
        await fetchFund();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to make deposit");
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter an amount greater than ₹0");
      return;
    }
    if (fund && amt > fund.current) {
      toast.error(`Withdrawal amount exceeds balance of ₹${fund.current.toLocaleString("en-IN")}`);
      return;
    }
    try {
      setWithdrawing(true);
      const res = await api.post("/emergency-fund/withdraw", { amount: amt });
      if (res.data.success) {
        toast.success(`Withdrew ₹${amt.toLocaleString("en-IN")} for emergency use`);
        setWithdrawOpen(false);
        setWithdrawAmount("");
        await fetchFund();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to withdraw funds");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleAdjustTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    const exp = parseFloat(monthlyExpense);
    if (!exp || exp <= 0) {
      toast.error("Please enter a valid monthly expense amount");
      return;
    }
    try {
      setAdjusting(true);
      const res = await api.patch("/emergency-fund", { monthly_expense_estimate: exp });
      if (res.data.success) {
        toast.success("Emergency fund runway target adjusted!");
        setAdjustOpen(false);
        await fetchFund();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update target");
    } finally {
      setAdjusting(false);
    }
  };

  const months = fund?.monthsCovered ?? 0;
  const isHealthy = months >= 3;

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Emergency Fund"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FeaturePageHeader
          role={role!}
          title="Emergency Fund"
          description="Build and track your financial safety net. Experts recommend 3–6 months of living expenses saved for unexpected life events."
          icon={HeartPulse}
          accentColor="#ed9b76"
          accentBg="#fff5ef"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDepositOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#ed9b76] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#ed9b76]/25 transition hover:bg-[#de8b66] active:scale-95"
          >
            <Plus size={16} /> Deposit Funds
          </button>
        </div>
      </div>

      {/* Top Runway Badges */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f3eee8]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9c897f]">Runway Safety</span>
          <div className="mt-2 flex items-center gap-2">
            {isHealthy ? (
              <ShieldCheck size={24} className="text-[#3ea87c]" />
            ) : (
              <AlertCircle size={24} className="text-[#e27d56]" />
            )}
            <p className="font-display text-[26px] font-bold text-[#172532]">
              {months} Months
            </p>
          </div>
          <p className="text-[11px] text-[#869990]">
            {isHealthy ? "Healthy resilience buffer" : "Below recommended 3-month buffer"}
          </p>
        </div>

        <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f3eee8]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9c897f]">Monthly Living Expense</span>
          <p className="mt-2 font-display text-[26px] font-bold text-[#172532]">
            ₹{parseFloat(monthlyExpense).toLocaleString("en-IN")}
          </p>
          <button
            onClick={() => setAdjustOpen(true)}
            className="text-[11px] font-bold text-[#ed9b76] hover:underline"
          >
            Adjust estimated expense
          </button>
        </div>

        <div className="rounded-[22px] bg-[#fff8f3] p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#fae3d5]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#c07c5b]">6-Month Safety Target</span>
          <p className="mt-2 font-display text-[26px] font-bold text-[#b56e4c]">
            ₹{(parseFloat(monthlyExpense) * 6).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#aa7a62]">Full protection runway</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#ed9b76] border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {fund && (
            <EmergencyFundCard
              fund={fund}
              onDeposit={() => setDepositOpen(true)}
              onWithdraw={() => setWithdrawOpen(true)}
              onAdjustTarget={() => setAdjustOpen(true)}
            />
          )}

          {/* Activity / History Log */}
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#f4ede6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1e8e0]">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#ed9b76]" />
                <h3 className="font-display text-[18px] font-bold text-[#172532]">Fund Activity History</h3>
              </div>
              <span className="text-[11px] text-[#9c897f]">Recent movements</span>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {history.length > 0 ? (
                history.map((c: any, i: number) => {
                  const isDeposit = c.amount >= 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-[#faf7f4] px-4 py-3 border border-[#f2eae2]"
                    >
                      <div>
                        <p className="text-[13px] font-bold text-[#172532]">
                          {isDeposit ? "Contribution Added" : "Emergency Release"}
                        </p>
                        <span className="text-[11px] text-[#9c897f]">{c.date}</span>
                      </div>
                      <span
                        className={`text-[13px] font-bold ${
                          isDeposit ? "text-[#3ea87c]" : "text-[#df7f64]"
                        }`}
                      >
                        {isDeposit ? `+₹${c.amount.toLocaleString("en-IN")}` : `−₹${Math.abs(c.amount).toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[12px] text-[#9c897f]">
                  No contributions or withdrawals recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf2ed]">
              <h3 className="font-display text-[20px] font-bold text-[#172532]">
                Deposit to Emergency Fund
              </h3>
              <button
                onClick={() => setDepositOpen(false)}
                className="rounded-full p-1.5 text-[#82908a] hover:bg-[#f3f6f3] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Quick Amount Presets
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1000, 5000, 10000, 25000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(String(preset))}
                      className={`rounded-xl py-2 text-[12px] font-bold transition border ${
                        depositAmount === String(preset)
                          ? "bg-[#ed9b76] text-white border-[#ed9b76]"
                          : "bg-[#fbf7f4] text-[#7d675b] border-[#e8ded6] hover:bg-[#f5ece5]"
                      }`}
                    >
                      +₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="100"
                    placeholder="e.g. 5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#ed9b76] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setDepositOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12px] font-bold text-[#82908a] hover:bg-[#f3f6f3] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositing}
                  className="rounded-xl bg-[#ed9b76] px-5 py-2 text-[12px] font-bold text-white shadow-md shadow-[#ed9b76]/25 transition hover:bg-[#de8b66] disabled:opacity-50"
                >
                  {depositing ? "Processing..." : "Confirm Deposit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf2ed]">
              <h3 className="font-display text-[20px] font-bold text-[#172532]">
                Withdraw for Emergency
              </h3>
              <button
                onClick={() => setWithdrawOpen(false)}
                className="rounded-full p-1.5 text-[#82908a] hover:bg-[#f3f6f3] transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-[12px] text-[#718279] bg-[#fff5f2] p-3 rounded-xl border border-[#feded6]">
              ⚠️ Emergency funds should only be withdrawn for true urgent necessities (medical emergencies, unexpected critical repairs, sudden loss of income).
            </p>

            <form onSubmit={handleWithdraw} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Available Balance: ₹{fund?.current?.toLocaleString("en-IN") || 0}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="100"
                    placeholder="Enter withdrawal amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={fund?.current || 0}
                    required
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#ed9b76] focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12px] font-bold text-[#82908a] hover:bg-[#f3f6f3] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="rounded-xl bg-[#df7f64] px-5 py-2 text-[12px] font-bold text-white shadow-md shadow-[#df7f64]/25 transition hover:bg-[#ce6b50] disabled:opacity-50"
                >
                  {withdrawing ? "Releasing..." : "Confirm Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Target Modal */}
      {adjustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf2ed]">
              <h3 className="font-display text-[20px] font-bold text-[#172532]">
                Configure Runway Target
              </h3>
              <button
                onClick={() => setAdjustOpen(false)}
                className="rounded-full p-1.5 text-[#82908a] hover:bg-[#f3f6f3] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustTarget} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Estimated Monthly Living Expenses (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="500"
                    placeholder="e.g. 30000"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#ed9b76] focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#869990]">
                  Your recommended 6-month safety runway will be set to ₹{(parseFloat(monthlyExpense || "0") * 6).toLocaleString("en-IN")}.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setAdjustOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12px] font-bold text-[#82908a] hover:bg-[#f3f6f3] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="rounded-xl bg-[#ed9b76] px-5 py-2 text-[12px] font-bold text-white shadow-md shadow-[#ed9b76]/25 transition hover:bg-[#de8b66] disabled:opacity-50"
                >
                  {adjusting ? "Updating..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

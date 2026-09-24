import { useEffect, useState } from "react";
import { CircleDollarSign, Plus, X, ArrowDownLeft } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function Income() {
  const [sources, setSources] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total_formatted: "₹0", primary_income: 0, side_income: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Add Income Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeType, setIncomeType] = useState("fixed");
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const res = await api.get("/income");
      if (res.data?.success) {
        setSources(res.data.data.items || []);
        setSummary({
          total_formatted: res.data.data.total_formatted,
          total: res.data.data.total,
          primary_income: res.data.data.primary_income,
          side_income: res.data.data.side_income,
        });
      }
    } catch (err) {
      console.error("Failed to load income:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncome(); }, []);

  const handleAddIncome = async () => {
    if (!sourceName.trim() || !amount) {
      toast.error("Please enter income source name and amount");
      return;
    }
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/income", {
        source: sourceName.trim(),
        amount: parsedAmt,
        type: incomeType,
        date_received: dateReceived,
        is_recurring: isRecurring,
      });

      if (res.data?.success) {
        toast.success(`+₹${parsedAmt.toLocaleString("en-IN")} added to your income sources!`);
        setShowAddModal(false);
        setSourceName("");
        setAmount("");
        fetchIncome();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Failed to add income source");
    } finally {
      setSaving(false);
    }
  };

  const primaryPct = summary.total > 0 ? Math.round((summary.primary_income / summary.total) * 100) : 0;

  return (
    <DashboardLayout role="professional" navItems={professionalNav} pageTitle="Income">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FeaturePageHeader
          role="professional"
          title="Income"
          description="Monitor salary, freelance, and investment income. See where your money comes from and how it grows over time."
          icon={CircleDollarSign}
          accentColor="#7BE2BE"
          accentBg="#e7f8ef"
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#2b7256] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(43,114,86,.3)] hover:bg-[#235d46] transition hover:-translate-y-0.5 self-start sm:self-auto mb-4 sm:mb-0"
        >
          <Plus size={16} className="text-[#7BE2BE]" /> Add Income Source
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[26px] bg-[#172532] p-6 text-white shadow-[10px_14px_35px_rgba(23,37,50,.16)]">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#a5b9b0]">Total Income (This Month)</p>
          <p className="mt-3 font-display text-[38px] font-bold tracking-[-.07em]">{summary.total_formatted}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold">
            <span className="text-[#7BE2BE]">↑ {sources.length} source{sources.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#9aa69f]">Primary Income</p>
          <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em]">₹{summary.primary_income.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-[11px] text-[#9ba59f]">{primaryPct}% of total income</p>
        </div>
        <div className="rounded-[26px] bg-[#eaf8f4] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#73a291]">Side Income</p>
          <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em]">₹{summary.side_income.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-[11px] text-[#81a99d]">Freelance + Investments</p>
        </div>
      </div>

      <div className="mt-5 rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-[21px] font-bold tracking-[-.05em]">Income sources</h3>
            <p className="text-[12px] text-[#82908a]">Track where your monthly earnings originate.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 rounded-xl bg-[#eafaf3] px-3.5 py-2 text-[12px] font-bold text-[#2b7256] hover:bg-[#d8f5e7] transition"
          >
            <Plus size={15} /> Add Source
          </button>
        </div>

        {loading ? (
          <div className="mt-6 flex h-24 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#7BE2BE] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-5 divide-y divide-[#eef1ed]">
            {sources.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color || "#41aa7e" }} />
                  <div>
                    <p className="text-[13px] font-bold">{s.source}</p>
                    <p className="text-[11px] text-[#9ba59f]">{s.date} · {s.type}</p>
                  </div>
                </div>
                <p className="text-[13px] font-bold text-[#41aa7e]">+{s.amount}</p>
              </div>
            ))}
            {sources.length === 0 && (
              <p className="py-6 text-center text-[13px] text-[#9ba59f]">No income sources recorded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Add Income Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#172532]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[26px] bg-[#f9fbf8] p-6 shadow-2xl border border-[#e2ece5]">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f8ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#2b7256]">
                  <ArrowDownLeft size={12} /> Income / Inflow
                </span>
                <h3 className="mt-2.5 font-display text-2xl font-bold tracking-[-.05em] text-[#172532]">
                  Add Income Source
                </h3>
                <p className="mt-1 text-[12px] text-[#8b9891]">
                  Record your salary, freelance client, dividends, or other revenue.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl bg-white p-2 text-[#82908a] hover:bg-[#f0f4f1]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#76837b] mb-1">Source / Employer Name</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. Acme Corp Salary, Upwork Client, Dividends"
                  className="w-full h-11 rounded-xl border border-[#e2e9e2] bg-white px-3.5 text-sm font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleAddIncome()}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#76837b] mb-1">Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#3b8165]">+₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full h-11 rounded-xl border border-[#e2e9e2] bg-white pl-9 pr-3.5 text-sm font-bold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleAddIncome()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#76837b] mb-1">Income Type</label>
                  <select
                    value={incomeType}
                    onChange={(e) => setIncomeType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-[#e2e9e2] bg-white px-3 text-sm font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                  >
                    <option value="fixed">Fixed (Salary)</option>
                    <option value="variable">Variable (Freelance)</option>
                    <option value="passive">Passive (Investment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#76837b] mb-1">Date Received</label>
                  <input
                    type="date"
                    value={dateReceived}
                    onChange={(e) => setDateReceived(e.target.value)}
                    className="w-full h-11 rounded-xl border border-[#e2e9e2] bg-white px-3 text-sm font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-[#d2e4db] text-[#3b8165] focus:ring-[#7BE2BE]"
                />
                <label htmlFor="recurringCheck" className="text-[12px] font-medium text-[#5c8272] cursor-pointer">
                  Recurring monthly income
                </label>
              </div>
            </div>

            <button
              onClick={handleAddIncome}
              disabled={saving}
              className="mt-6 h-12 w-full rounded-xl bg-[#2b7256] text-[13px] font-bold text-white shadow-lg transition hover:bg-[#235d46] active:scale-[.98] disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {saving ? "Saving..." : (
                <>Save Income Source <ArrowDownLeft size={16} className="text-[#7BE2BE]" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { CircleDollarSign, Plus } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function Income() {
  const [sources, setSources] = useState<any[]>([]);
  const [summary, setSummary] = useState({ total_formatted: "₹0", primary_income: 0, side_income: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const res = await api.get("/income");
      if (res.data.success) {
        setSources(res.data.data.items);
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

  const primaryPct = summary.total > 0 ? Math.round((summary.primary_income / summary.total) * 100) : 0;

  return (
    <DashboardLayout role="professional" navItems={professionalNav} pageTitle="Income">
      <FeaturePageHeader
        role="professional"
        title="Income"
        description="Monitor salary, freelance, and investment income. See where your money comes from and how it grows over time."
        icon={CircleDollarSign}
        accentColor="#7BE2BE"
        accentBg="#e7f8ef"
      />

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
          <h3 className="font-display text-[21px] font-bold tracking-[-.05em]">Income sources</h3>
          <button
            onClick={() => toast.info("Use the API to add income sources.")}
            className="flex items-center gap-1 rounded-xl bg-[#f5f8f4] px-3 py-2 text-[11px] font-bold text-[#718078]"
          >
            <Plus size={14} /> Add
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
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
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
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { WalletCards } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import api from "@/lib/api";

export default function PocketMoney() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/student")
      .then(res => { if (res.data.success) setData(res.data.data); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const heroMetric = data?.heroMetric;
  const statMetrics = data?.statMetrics ?? [];
  const trendBars = data?.trendBars ?? [];
  const monthSpent = statMetrics.find((m: any) => m.label?.toLowerCase().includes("spent"))?.value ?? "—";
  const remaining = heroMetric?.value ?? "—";

  // Daily spend from trendBars (last 16 days approximation)
  const dailyBars = trendBars.slice(-16);
  const maxVal = Math.max(...dailyBars.map((b: any) => b.value || 0), 1);

  return (
    <DashboardLayout role="student" navItems={studentNav} pageTitle="Pocket Money">
      <FeaturePageHeader
        role="student"
        title="Pocket Money"
        description="Track your monthly allowance, daily spending power, and where every rupee goes. Stay in control without tracking every paisa manually."
        icon={WalletCards}
        accentColor="#7BE2BE"
        accentBg="#e7f8ef"
      />

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
                <span className="font-medium text-[#a2aca7]">vs last month</span>
              </div>
            </div>
            <div className="rounded-[26px] bg-[#eaf8f4] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)]">
              <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#73a291]">Safe to spend</p>
              <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em]">
                {heroMetric?.safeToSpend ?? "—"}
              </p>
              <p className="mt-2 text-[11px] text-[#81a99d]">per day for remaining days</p>
            </div>
          </div>

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
    </DashboardLayout>
  );
}

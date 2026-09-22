import { useEffect, useState } from "react";
import { Activity, TrendingDown, TrendingUp, PieChart } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import SpendingPulseChart from "@/components/dashboard/SpendingPulseChart";
import { studentNav, studentTrendBars } from "@/data/studentData";
import { professionalNav, professionalTrendBars } from "@/data/professionalData";
import type { TrendBar } from "@/types";
import api from "@/lib/api";

interface CategoryStat {
  category: string;
  total: number;
  formatted: string;
}

interface AnalyticsSummary {
  total_spent: number;
  total_income: number;
  net: number;
}

export default function Analytics() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const [trendBars, setTrendBars] = useState<TrendBar[]>(
    isStudent ? studentTrendBars : professionalTrendBars
  );
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      api.get("/analytics/trend"),
      api.get("/analytics/categories"),
      api.get("/analytics/summary"),
    ])
      .then(([trendRes, catRes, sumRes]) => {
        if (!isMounted) return;

        if (trendRes.status === "fulfilled" && trendRes.value.data?.success) {
          const bars = trendRes.value.data.data;
          if (Array.isArray(bars) && bars.length > 0) {
            setTrendBars(bars);
          }
        }

        if (catRes.status === "fulfilled" && catRes.value.data?.success) {
          setCategories(catRes.value.data.data || []);
        }

        if (sumRes.status === "fulfilled" && sumRes.value.data?.success) {
          setSummary(sumRes.value.data.data || null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Analytics"
    >
      <FeaturePageHeader
        role={role!}
        title="Analytics"
        description="Deep dive into your financial patterns. Visualise trends, compare periods, and discover spending habits."
        icon={Activity}
        accentColor="#4caf89"
        accentBg="#e7f8ef"
      />

      <div className="space-y-6">
        {/* Real Dynamic 12-Month Expense Trend */}
        <SpendingPulseChart trendBars={trendBars} />

        {/* Dynamic Category Spending Breakdown & Summary Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Monthly Net Cash Flow Card */}
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#e7f8ef] text-[#3b8165]">
                <Activity size={17} />
              </div>
              <h3 className="font-display text-[19px] font-bold tracking-[-.04em]">
                Monthly cash position
              </h3>
            </div>
            <p className="text-[12px] text-[#82908a] mb-5">
              Live totals calculated across all recorded transactions for this calendar month.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-[#f9fbf8] p-4 border border-[#eef2ed]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#357963] mb-1">
                  <TrendingUp size={13} /> Total Inflow
                </div>
                <p className="text-[18px] font-bold text-[#172532]">
                  ₹{(summary?.total_income ?? 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-xl bg-[#f9fbf8] p-4 border border-[#eef2ed]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#d9534f] mb-1">
                  <TrendingDown size={13} /> Total Spent
                </div>
                <p className="text-[18px] font-bold text-[#172532]">
                  ₹{(summary?.total_spent ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#f5f8f4] p-3.5 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#5a6760]">Net Monthly Balance</span>
              <span
                className={`text-[14px] font-bold ${
                  (summary?.net ?? 0) >= 0 ? "text-[#2e7d5a]" : "text-[#d9534f]"
                }`}
              >
                {(summary?.net ?? 0) >= 0 ? "+" : ""}₹{(summary?.net ?? 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Category Distribution Card */}
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef3ff] text-[#695db3]">
                <PieChart size={17} />
              </div>
              <h3 className="font-display text-[19px] font-bold tracking-[-.04em]">
                Category breakdown
              </h3>
            </div>
            <p className="text-[12px] text-[#82908a] mb-4">
              Where your expenses are allocated this month.
            </p>

            {categories.length > 0 ? (
              <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between rounded-xl bg-[#f9fbf8] px-3.5 py-2.5 border border-[#edf2ed]"
                  >
                    <span className="text-[12px] font-bold text-[#45524b]">{cat.category}</span>
                    <span className="text-[12px] font-bold text-[#172532]">{cat.formatted}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[12px] text-[#82908a]">
                No categorical expenses recorded this month yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

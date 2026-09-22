import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function Predictions() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/predictions")
      .then((res) => { if (res.data.success) setData(res.data.data); })
      .catch((err) => console.error("Predictions error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="professional" navItems={professionalNav} pageTitle="Predictions">
      <FeaturePageHeader
        role="professional"
        title="Predictions"
        description="AI-powered spending forecasts based on your historical patterns. Plan ahead with confidence."
        icon={TrendingUp}
        accentColor="#a29bf4"
        accentBg="#f0edff"
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#a29bf4] border-t-transparent" />
        </div>
      ) : !data?.available ? (
        <div className="rounded-[26px] bg-[#f9fbf8] p-8 text-center">
          <TrendingUp size={32} className="mx-auto mb-4 text-[#a29bf4]" />
          <p className="font-bold text-[#172532]">Not enough data yet</p>
          <p className="mt-2 text-[13px] text-[#82908a]">{data?.message ?? "Keep adding transactions to unlock spending predictions."}</p>
          <p className="mt-1 text-[12px] text-[#a29bf4]">{data?.data_points ?? 0} months of data collected</p>
        </div>
      ) : (
        <>
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
            <h3 className="font-display text-[21px] font-bold tracking-[-.05em]">Expense forecast</h3>
            <p className="mt-2 text-[12px] text-[#82908a]">
              Based on {data.data_points} months of spending data. Predictions update automatically each week.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {data.predictions.map((p: any) => (
                <div key={p.month} className="rounded-[20px] border border-[#e3e9e3] bg-[#fafcfa] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9aa69f]">{p.month}</p>
                  <p className="mt-3 font-display text-[28px] font-bold tracking-[-.06em]">{p.predicted}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold">
                    <span className={p.positive ? "text-[#4aaf82]" : "text-[#e68767]"}>{p.trend}</span>
                    <span className="font-medium text-[#a2aca7]">vs current</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[26px] bg-[#eef3ff] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#695db3]">
              <TrendingUp size={14} /> AI Prediction Note
            </div>
            <p className="mt-3 max-w-lg text-[13px] leading-6 text-[#717c95]">
              {data.ai_note ?? "Predictions are generated using linear regression on your historical spending patterns. The more data you add, the more accurate predictions become."}
            </p>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

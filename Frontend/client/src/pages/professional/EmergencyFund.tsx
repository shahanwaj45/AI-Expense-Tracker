import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import EmergencyFundCard from "@/components/dashboard/EmergencyFundCard";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function EmergencyFund() {
  const [fund, setFund] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/emergency-fund")
      .then(res => {
        if (res.data.success) {
          setFund(res.data.data.fund);
          setHistory(res.data.data.contributions ?? []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="professional" navItems={professionalNav} pageTitle="Emergency Fund">
      <FeaturePageHeader
        role="professional"
        title="Emergency Fund"
        description="Build and track your financial safety net. Experts recommend 3–6 months of expenses saved for emergencies."
        icon={HeartPulse}
        accentColor="#ed9b76"
        accentBg="#fff5ef"
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#ed9b76] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {fund && <EmergencyFundCard fund={fund} />}
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
            <h3 className="font-display text-[18px] font-bold tracking-[-.04em]">Contribution history</h3>
            <div className="mt-5 space-y-3">
              {history.length > 0 ? history.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-[#f9fbf8] px-4 py-3">
                  <span className="text-[12px] text-[#82908a]">{c.date}</span>
                  <span className="text-[12px] font-bold text-[#41aa7e]">+{c.amount}</span>
                </div>
              )) : (
                <p className="text-[12px] text-[#9ba59f]">No contributions recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

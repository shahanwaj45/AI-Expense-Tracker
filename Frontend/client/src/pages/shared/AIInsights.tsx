import { useEffect, useState } from "react";
import { Bot, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import AIInsightCard from "@/components/dashboard/AIInsightCard";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function AIInsights() {
  const { role } = useAuth();
  const isStudent = role === "student";
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.get("/insights");
      if (res.data.success) setInsights(res.data.data);
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateNew = async () => {
    try {
      setGenerating(true);
      const res = await api.post("/insights/generate");
      if (res.data.success) {
        toast.success("New insight generated!");
        await fetchInsights();
      }
    } catch (err) {
      toast.error("Failed to generate insight");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="AI Insights"
    >
      <FeaturePageHeader
        role={role!}
        title="AI Insights"
        description="Personalised, AI-powered recommendations based on your spending patterns, goals, and financial health."
        icon={Bot}
        accentColor="#695db3"
        accentBg="#f0edff"
      />

      <div className="mb-5 flex justify-end">
        <button
          onClick={generateNew}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-[#f0edff] px-4 py-2 text-[12px] font-bold text-[#695db3] transition hover:bg-[#e4dcff] disabled:opacity-60"
        >
          <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
          {generating ? "Generating..." : "Generate new insight"}
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#695db3] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {insights.length > 0 ? (
            insights.map((insight: any, i: number) => (
              <AIInsightCard key={insight.id || i} insight={insight} />
            ))
          ) : (
            <div className="col-span-2 rounded-[26px] bg-[#f9fbf8] p-8 text-center">
              <p className="text-[#82908a]">No insights yet. Add more transactions and click "Generate new insight".</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

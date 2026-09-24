import { useEffect, useState } from "react";
import { Bot, RefreshCw, Sparkles, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Wallet, Target, CreditCard, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
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
      if (res.data.success) {
        setInsights(res.data.data);
      }
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
        toast.success("Comprehensive AI Financial Audit updated!");
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

  const primaryInsight = insights[0] || null;
  const historicalInsights = insights.slice(1);

  const healthScore = primaryInsight?.financial_health_score ?? 82;
  const riskLevel = primaryInsight?.risk_level ?? "low";
  const savingsPotential = primaryInsight?.savings_potential_inr ?? 2500;
  const actionableSteps = primaryInsight?.actionable_steps ?? [];
  const anomalies = primaryInsight?.spending_anomalies ?? [];
  const categoryLeaks = primaryInsight?.category_leaks ?? [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: "text-[#2e7d5a]", bg: "bg-[#eaf8f0]", ring: "#41aa7e", label: "Excellent" };
    if (score >= 65) return { text: "text-[#c97d1e]", bg: "bg-[#fff8ea]", ring: "#e59b39", label: "Moderate" };
    return { text: "text-[#d9534f]", bg: "bg-[#ffece8]", ring: "#e05244", label: "Needs Attention" };
  };

  const scoreInfo = getScoreColor(healthScore);

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="AI Financial Insights"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FeaturePageHeader
          role={role!}
          title="AI Financial Advisory"
          description="Comprehensive AI health analysis, spending anomaly detection, and concrete rupee-saving recommendations."
          icon={Bot}
          accentColor="#695db3"
          accentBg="#f0edff"
        />

        <button
          onClick={generateNew}
          disabled={generating}
          className="flex items-center gap-2 rounded-2xl bg-[#695db3] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#695db3]/25 transition hover:bg-[#574c9f] disabled:opacity-60 active:scale-95"
        >
          <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
          {generating ? "Analyzing spending..." : "Regenerate Analysis"}
        </button>
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#695db3] border-t-transparent" />
        </div>
      ) : primaryInsight ? (
        <div className="mt-5 space-y-6">
          {/* Executive Overview Banner */}
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1b1c31] via-[#242746] to-[#1a1b30] p-7 text-white shadow-xl">
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#695db3]/30 blur-3xl pointer-events-none" />

            <div className="relative grid gap-6 md:grid-cols-3 md:items-center">
              {/* Headline & Summary */}
              <div className="md:col-span-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#b8aff5]">
                  <Sparkles size={13} /> {primaryInsight.source_period || "Monthly Audit"} • {primaryInsight.timestamp}
                </div>
                <h2 className="mt-3 font-display text-[26px] sm:text-[30px] font-bold leading-tight tracking-[-.04em] text-white">
                  {primaryInsight.headline}
                </h2>
                <p className="mt-3 text-[13px] sm:text-[14px] leading-relaxed text-[#c3bde8]">
                  {primaryInsight.summary || primaryInsight.description}
                </p>
              </div>

              {/* Health Score Gauge */}
              <div className="rounded-[22px] bg-white/10 backdrop-blur-md p-5 border border-white/10 text-center">
                <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#beb8e8]">Financial Health Score</span>
                <div className="mt-3 flex items-center justify-center">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/5">
                    <span className="font-display text-[32px] font-bold text-white">{healthScore}</span>
                    <span className="text-[12px] text-[#beb8e8]">/100</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${scoreInfo.bg} ${scoreInfo.text}`}>
                    {scoreInfo.label}
                  </span>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white uppercase">
                    {riskLevel} Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f0f4f0]">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#9aa69f]">
                <TrendingUp size={15} className="text-[#3ea87c]" /> Identified Savings Room
              </div>
              <p className="mt-2 font-display text-[28px] font-bold text-[#2e7d5a]">
                ₹{savingsPotential.toLocaleString("en-IN")}<span className="text-[13px] font-medium text-[#82908a]">/month</span>
              </p>
              <p className="text-[11px] text-[#82908a]">Potential cash recovery from optimization</p>
            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f0f4f0]">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#9aa69f]">
                <AlertTriangle size={15} className="text-[#df7f64]" /> Spending Anomalies
              </div>
              <p className="mt-2 font-display text-[28px] font-bold text-[#df7f64]">
                {anomalies.length} Flagged
              </p>
              <p className="text-[11px] text-[#82908a]">Categories exceeding projected pace</p>
            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f0f4f0]">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#9aa69f]">
                <CheckCircle2 size={15} className="text-[#695db3]" /> High-Impact Steps
              </div>
              <p className="mt-2 font-display text-[28px] font-bold text-[#695db3]">
                {actionableSteps.length} Concrete Actions
              </p>
              <p className="text-[11px] text-[#82908a]">Recommended for this billing cycle</p>
            </div>
          </div>

          {/* Actionable Steps Roadmap & Spending Anomalies */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Actionable Roadmap */}
            <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#f0f4f0]">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f0]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#3ea87c]" />
                  <h3 className="font-display text-[19px] font-bold text-[#172532]">
                    High-Impact Action Plan
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-[#82908a]">Prioritized</span>
              </div>

              <div className="mt-5 space-y-4">
                {actionableSteps.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#edf3ed] bg-[#fafcfa] p-4 transition hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#695db3] text-[12px] font-bold text-white">
                          {step.step || idx + 1}
                        </span>
                        <div>
                          <h4 className="text-[14px] font-bold text-[#172532]">{step.title}</h4>
                          <p className="mt-1 text-[12px] leading-relaxed text-[#687770]">
                            {step.action}
                          </p>
                        </div>
                      </div>

                      {step.potential_savings_inr && (
                        <span className="shrink-0 rounded-full bg-[#e8f7ee] px-2.5 py-1 text-[10px] font-bold text-[#2e7d5a] whitespace-nowrap">
                          +₹{step.potential_savings_inr.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Anomalies & Vulnerabilities */}
            <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#f0f4f0] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#f0f4f0]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-[#e27d56]" />
                    <h3 className="font-display text-[19px] font-bold text-[#172532]">
                      Spending Vulnerabilities
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-[#82908a]">Live alerts</span>
                </div>

                <div className="mt-5 space-y-3.5">
                  {anomalies.length > 0 ? (
                    anomalies.map((anom: any, idx: number) => {
                      const isWarning = anom.severity === "warning";
                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl p-4 border ${
                            isWarning
                              ? "bg-[#fff8f5] border-[#fce3da]"
                              : "bg-[#f9f8ff] border-[#e7e4fa]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-[#172532]">{anom.category}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isWarning
                                  ? "bg-[#fde5dc] text-[#d9534f]"
                                  : "bg-[#e8e4fb] text-[#695db3]"
                              }`}
                            >
                              {anom.severity || "Anomaly"}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[12px] leading-relaxed text-[#6d7974]">
                            {anom.detail || anom.description}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-[12px] text-[#82908a]">
                      No anomalous spikes detected. Your spending is operating within baseline parameters!
                    </div>
                  )}

                  {/* Category Leaks Tags */}
                  {categoryLeaks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#f0f4f0]">
                      <span className="text-[11px] font-bold uppercase tracking-[.12em] text-[#9aa69f] block mb-2">
                        Primary Capital Leaks
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {categoryLeaks.map((leak: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-xl bg-[#fff0eb] px-3 py-1 text-[11px] font-bold text-[#c8623b]"
                          >
                            ⚠️ {leak}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Action Shortcuts */}
              <div className="mt-6 pt-4 border-t border-[#f0f4f0]">
                <span className="text-[11px] font-bold uppercase tracking-[.12em] text-[#9aa69f] block mb-2.5">
                  Direct Corrective Actions
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={isStudent ? "/student/budget" : "/professional/budget"}
                    className="flex flex-col items-center justify-center rounded-xl bg-[#f8faf8] p-2.5 text-center transition hover:bg-[#edf4ee] border border-[#e4ebe4]"
                  >
                    <Wallet size={16} className="text-[#3ea87c] mb-1" />
                    <span className="text-[11px] font-bold text-[#172532]">Trim Budget</span>
                  </Link>

                  <Link
                    href={isStudent ? "/student/savings-goals" : "/professional/savings-goals"}
                    className="flex flex-col items-center justify-center rounded-xl bg-[#f8faf8] p-2.5 text-center transition hover:bg-[#edf4ee] border border-[#e4ebe4]"
                  >
                    <Target size={16} className="text-[#4caf89] mb-1" />
                    <span className="text-[11px] font-bold text-[#172532]">Save Surplus</span>
                  </Link>

                  <Link
                    href={isStudent ? "/student/subscriptions" : "/professional/subscriptions"}
                    className="flex flex-col items-center justify-center rounded-xl bg-[#f8faf8] p-2.5 text-center transition hover:bg-[#edf4ee] border border-[#e4ebe4]"
                  >
                    <CreditCard size={16} className="text-[#695db3] mb-1" />
                    <span className="text-[11px] font-bold text-[#172532]">Audit Subs</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Insights Archive */}
          {historicalInsights.length > 0 && (
            <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#f0f4f0]">
              <h3 className="font-display text-[18px] font-bold text-[#172532] pb-3 border-b border-[#f0f4f0]">
                Historical Insight Timeline
              </h3>
              <div className="mt-4 divide-y divide-[#f0f4f0]">
                {historicalInsights.map((h: any, i: number) => (
                  <div key={h.id || i} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-[#172532]">{h.headline}</p>
                      <p className="text-[11px] text-[#82908a] mt-0.5 line-clamp-1">{h.summary || h.description}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#8c8bb3] whitespace-nowrap ml-4">
                      {h.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-[26px] bg-[#f9fbf8] p-10 text-center border border-[#edf3ed]">
          <Bot size={40} className="mx-auto mb-3 text-[#695db3]" />
          <h4 className="font-display text-[19px] font-bold text-[#172532]">No AI insights recorded yet</h4>
          <p className="mt-1 text-[13px] text-[#82908a]">
            Add a few expenses or receipts and click "Regenerate Analysis" to receive your personalized audit.
          </p>
          <button
            onClick={generateNew}
            className="mt-4 rounded-xl bg-[#695db3] px-5 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#695db3]/25 hover:bg-[#574c9f] transition"
          >
            Generate First Audit
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

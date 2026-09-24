import { useEffect, useState } from "react";
import { TrendingUp, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, Calendar, Layers, Activity } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function Predictions() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/predictions");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Predictions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Predictions"
    >
      <FeaturePageHeader
        role={role!}
        title="AI Spending Predictions"
        description="Machine learning forecasts trained on your spending velocity, recurring habits, and category patterns. Plan ahead with confidence."
        icon={TrendingUp}
        accentColor="#a29bf4"
        accentBg="#f0edff"
      />

      {loading ? (
        <div className="flex h-56 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#a29bf4] border-t-transparent" />
        </div>
      ) : !data?.available ? (
        <div className="mt-6 rounded-[26px] bg-[#f9fbf8] p-10 text-center border border-[#edf3ed]">
          <TrendingUp size={40} className="mx-auto mb-4 text-[#a29bf4]" />
          <h4 className="font-display text-[20px] font-bold text-[#172532]">AI Training in Progress</h4>
          <p className="mt-2 max-w-md mx-auto text-[13px] text-[#82908a]">
            {data?.message ?? "Add your first expense or upload a receipt to train the AI prediction engine."}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f0edff] px-4 py-1.5 text-[11px] font-bold text-[#695db3]">
            <Sparkles size={13} /> {data?.data_points ?? 0} data periods registered
          </div>
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {/* Velocity & Run-rate Banner */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f0f4f0]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#9aa69f]">
                <Activity size={14} className="text-[#a29bf4]" /> Daily Spending Velocity
              </div>
              <p className="mt-2 font-display text-[28px] font-bold text-[#172532]">
                ₹{Math.round(data.daily_velocity || 0).toLocaleString("en-IN")}<span className="text-[14px] font-semibold text-[#82908a]">/day</span>
              </p>
              <p className="text-[11px] text-[#82908a]">Average burn rate based on recent transactions</p>
            </div>

            <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f0f4f0]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#9aa69f]">
                <Calendar size={14} className="text-[#3ea87c]" /> Current Month Spent
              </div>
              <p className="mt-2 font-display text-[28px] font-bold text-[#3ea87c]">
                ₹{Math.round(data.current_month_spent || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-[#82908a]">Actual expenses registered this month</p>
            </div>

            <div className="rounded-[22px] bg-[#f2f0ff] p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#e1dcfa]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#695db3]">
                <TrendingUp size={14} /> Projected Month-End Total
              </div>
              <p className="mt-2 font-display text-[28px] font-bold text-[#5c50b5]">
                ₹{Math.round(data.current_month_projected || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-[#7c71c4]">Estimated total at current run-rate</p>
            </div>
          </div>

          {/* 3-Month Forward Forecast Cards */}
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#f0f4f0]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#f0f4f0]">
              <div>
                <h3 className="font-display text-[21px] font-bold tracking-[-.05em] text-[#172532]">
                  Forward 3-Month Trajectory
                </h3>
                <p className="mt-1 text-[12px] text-[#82908a]">
                  Synthesized using {data.method === 'linear_regression' ? 'Linear Regression ML' : data.method === 'moving_average' ? 'Moving Average Trend' : 'Velocity & Momentum Engine'}
                </p>
              </div>
              <span className="mt-2 sm:mt-0 inline-flex items-center gap-1 rounded-full bg-[#f4f7f4] px-3 py-1 text-[11px] font-semibold text-[#5a6b63]">
                Algorithm: {data.method.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {data.predictions.map((p: any, idx: number) => (
                <div
                  key={p.month}
                  className={`relative overflow-hidden rounded-[22px] p-5 border transition hover:shadow-md ${
                    idx === 0
                      ? "bg-[#faf8ff] border-[#e2dcfa]"
                      : "bg-[#fcfdfc] border-[#eef2ee]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8a9891]">
                      {p.month} {p.year}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        p.positive
                          ? "bg-[#e7f7ef] text-[#2e7d5a]"
                          : "bg-[#fff1ed] text-[#d9534f]"
                      }`}
                    >
                      {p.positive ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                      {p.trend}
                    </span>
                  </div>

                  <p className="mt-3 font-display text-[30px] font-bold tracking-[-.06em] text-[#172532]">
                    {p.predicted}
                  </p>

                  {/* Confidence Range */}
                  <div className="mt-3 pt-3 border-t border-[#edf2ed] flex items-center justify-between text-[11px] text-[#82908a]">
                    <span>Expected Range:</span>
                    <span className="font-bold text-[#4d5c54]">
                      {p.low_bound} – {p.high_bound}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Forecast Breakdown & Gemini AI Narrative */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Category Forecast Breakdown */}
            <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#f0f4f0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={17} className="text-[#a29bf4]" />
                  <h3 className="font-display text-[19px] font-bold text-[#172532]">
                    Projected Category Breakdown
                  </h3>
                </div>
                <span className="text-[11px] text-[#82908a]">Next month target</span>
              </div>

              <div className="mt-5 space-y-3.5">
                {data.category_predictions && data.category_predictions.length > 0 ? (
                  data.category_predictions.map((cat: any) => (
                    <div key={cat.category} className="rounded-xl bg-[#fafcfa] p-3 border border-[#edf2ed]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-[13px] font-bold text-[#172532]">{cat.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[13px] font-bold text-[#172532]">{cat.predicted_formatted}</span>
                          <span className="ml-1.5 text-[11px] text-[#82908a]">({cat.percentage}%)</span>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-[#eef2ed] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-[#82908a] py-6 text-center">
                    Categorized transactions will populate your category forecast.
                  </p>
                )}
              </div>
            </div>

            {/* Gemini AI Predictive Analysis Note */}
            <div className="rounded-[26px] bg-[#f0edff] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)] border border-[#ded8fa] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#695db3]">
                  <Sparkles size={14} /> Gemini AI Forecast Narrative
                </div>
                <h4 className="mt-3 font-display text-[20px] font-bold text-[#231b54]">
                  Predictive Financial Analysis
                </h4>
                <p className="mt-3 text-[13px] leading-relaxed text-[#4b437c]">
                  {data.ai_note}
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-white/70 backdrop-blur-sm p-4 border border-[#e4dffd]">
                <p className="text-[11px] font-bold uppercase text-[#695db3] tracking-[.1em]">AI Action Recommendation</p>
                <p className="mt-1 text-[12px] text-[#554d80]">
                  Maintaining your daily run-rate below ₹{Math.round((data.daily_velocity || 1000) * 0.9).toLocaleString("en-IN")}/day will create a safety surplus of ~₹{Math.round((data.daily_velocity || 1000) * 3).toLocaleString("en-IN")} by next month end.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

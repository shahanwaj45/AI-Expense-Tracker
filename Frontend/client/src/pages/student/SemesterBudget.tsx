import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import api from "@/lib/api";

export default function SemesterBudget() {
  const [semesterMonths, setSemesterMonths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/semester")
      .then((res) => {
        if (res.data.success) {
          setSemesterMonths(res.data.data);
        }
      })
      .catch((err) => console.error("Failed to load semester budget:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="student" navItems={studentNav} pageTitle="Semester Budget">
      <FeaturePageHeader
        role="student"
        title="Semester Budget"
        description="Plan and track finances across your entire academic semester. See monthly breakdowns and stay on track for the term."
        icon={CalendarDays}
        accentColor="#a29bf4"
        accentBg="#f0edff"
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#a29bf4] border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {semesterMonths.map((m) => {
            const pct = m.budget > 0 ? Math.round(((m.spent || 0) / m.budget) * 100) : 0;
            return (
              <div
                key={m.month}
                className={`rounded-[22px] border p-5 shadow-[4px_6px_16px_rgba(42,65,55,.05)] ${
                  m.status === "active"
                    ? "border-[#7BE2BE] bg-white"
                    : m.status === "complete"
                      ? "border-[#e3e9e3] bg-[#f9fbf8]"
                      : "border-[#eef1ed] bg-[#fafcfa]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-[16px] font-bold">{m.month}</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      m.status === "active"
                        ? "bg-[#e7f8ef] text-[#3b8165]"
                        : m.status === "complete"
                          ? "bg-[#f0f4ef] text-[#82908a]"
                          : "bg-[#f5f8f4] text-[#a2aca7]"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="mt-3 font-display text-[24px] font-bold tracking-[-.05em]">
                  ₹{(m.spent || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-[#9ba59f]">of ₹{(m.budget || 0).toLocaleString("en-IN")} budget</p>
                <div className="mt-3 h-2 rounded-full bg-[#eef1ed]">
                  <div
                    className={`h-full rounded-full ${pct > 90 ? "bg-[#e68767]" : "bg-[#7BE2BE]"}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-[10px] font-bold text-[#9ba59f]">{pct}%</p>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

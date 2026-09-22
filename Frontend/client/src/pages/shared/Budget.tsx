import { useEffect, useState } from "react";
import { Grid2X2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import BudgetHealthCard from "@/components/dashboard/BudgetHealthCard";
import { studentNav, studentBudgetCategories, studentBudgetUsed } from "@/data/studentData";
import { professionalNav, professionalBudgetCategories, professionalBudgetUsed } from "@/data/professionalData";
import type { BudgetCategory } from "@/types";
import api from "@/lib/api";

interface EnrichedBudgetCategory extends BudgetCategory {
  spent?: number;
  spent_formatted?: string;
  remaining?: number;
  percent_used?: number;
}

export default function Budget() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const defaultCategories = isStudent ? studentBudgetCategories : professionalBudgetCategories;
  const defaultUsed = isStudent ? studentBudgetUsed : professionalBudgetUsed;

  const [categories, setCategories] = useState<EnrichedBudgetCategory[]>(defaultCategories);
  const [usedPercent, setUsedPercent] = useState<number>(defaultUsed);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .get("/budgets")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data?.data) {
          const data = res.data.data;
          const fetchedCats = data.categories || data.items || [];
          if (Array.isArray(fetchedCats) && fetchedCats.length > 0) {
            setCategories(fetchedCats);
          }
          if (typeof data.usedPercent === "number") {
            setUsedPercent(data.usedPercent);
          }
        }
      })
      .catch((err) => {
        console.warn("Using fallback budget rules:", err.message);
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
      pageTitle="Budget"
    >
      <FeaturePageHeader
        role={role!}
        title="Budget"
        description="Set spending limits by category and track your progress throughout the month. Stay within your comfort zone."
        icon={Grid2X2}
        accentColor="#a29bf4"
        accentBg="#f0edff"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <BudgetHealthCard
          categories={categories}
          usedPercent={usedPercent}
        />
        <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
          <h3 className="font-display text-[21px] font-bold tracking-[-.05em]">Budget rules</h3>
          <p className="mt-2 text-[12px] text-[#82908a]">
            Your active category allocations and current consumption.
          </p>
          <div className="mt-5 space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="flex items-center justify-between rounded-xl bg-[#f9fbf8] px-4 py-3 border border-[#edf2ed]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <div>
                    <span className="text-[12px] font-bold text-[#172532]">{cat.label}</span>
                    {cat.spent_formatted && (
                      <p className="text-[10px] text-[#82908a]">
                        Spent: {cat.spent_formatted}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-bold text-[#4d5b53]">Limit: {cat.value}</span>
                  {typeof cat.percent_used === "number" && (
                    <p
                      className={`text-[10px] font-semibold ${
                        cat.percent_used > 100
                          ? "text-[#d9534f]"
                          : cat.percent_used > 80
                          ? "text-[#f0ad4e]"
                          : "text-[#2e7d5a]"
                      }`}
                    >
                      {cat.percent_used}% consumed
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

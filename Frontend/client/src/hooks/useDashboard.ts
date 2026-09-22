import { useState, useEffect, useCallback } from "react";
import { TrendingDown, Activity, DollarSign, HeartPulse, Wallet, BarChart3 } from "lucide-react";
import api from "@/lib/api";

export type DashboardData = {
  heroMetric: any;
  statMetrics: any[];
  trendBars: any[];
  budgetCategories: any[];
  budgetUsedPercent: number;
  savingsGoal: any;
  emergencyFund: any;
  recentTransactions: any[];
  aiInsight: any;
  totalIncome?: string;
};

// Map metric labels to Lucide icons (client-side, since icons can't be serialized over JSON)
function injectIcons(metrics: any[]): any[] {
  return metrics.map((m) => {
    const label = (m.label || "").toLowerCase();
    let icon = BarChart3;
    if (label.includes("spending") || label.includes("expenses")) {
      icon = TrendingDown;
    } else if (label.includes("health")) {
      icon = HeartPulse;
    } else if (label.includes("income")) {
      icon = DollarSign;
    } else if (label.includes("saving")) {
      icon = Wallet;
    } else if (label.includes("activity") || label.includes("trend")) {
      icon = Activity;
    }
    return { ...m, icon };
  });
}

export function useDashboard(role: "student" | "professional") {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/${role}`);
      if (res.data.success) {
        const raw = res.data.data;
        // Inject Lucide icon components for statMetrics (JSON can't carry functions)
        setData({
          ...raw,
          statMetrics: injectIcons(raw.statMetrics ?? []),
        });
        setError(null);
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err?.response?.data?.error?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}

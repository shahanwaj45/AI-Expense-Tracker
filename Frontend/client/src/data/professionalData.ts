import {
  Activity, Bot, CreditCard, FileText, Goal,
  Grid2X2, HeartPulse, LayoutDashboard, Mic, ReceiptIndianRupee,
  Settings2, CircleDollarSign, TrendingUp, ArrowDownRight, ArrowUpRight,
} from "lucide-react";
import type {
  NavItem, HeroMetric, StatMetric, Transaction,
  BudgetCategory, SavingsGoal, EmergencyFundData, AIInsight, TrendBar,
} from "@/types";

// ── Navigation ────────────────────────────────────────────────────────────────
export const professionalNav: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, path: "/professional" },
  { label: "Income", icon: CircleDollarSign, path: "/professional/income" },
  { label: "Expenses", icon: ReceiptIndianRupee, path: "/professional/expenses" },
  { label: "Budget", icon: Grid2X2, path: "/professional/budget" },
  { label: "Savings Goals", icon: Goal, path: "/professional/savings-goals" },
  { label: "Emergency Fund", icon: HeartPulse, path: "/professional/emergency-fund" },
  { label: "Predictions", icon: TrendingUp, path: "/professional/predictions" },
  { label: "AI Insights", icon: Bot, path: "/professional/ai-insights", badge: "AI" },
  { label: "Analytics", icon: Activity, path: "/professional/analytics" },
  { label: "Reports", icon: FileText, path: "/professional/reports" },
  { label: "Receipt Scanner", icon: ReceiptIndianRupee, path: "/professional/receipt-scanner" },
  { label: "Voice Expense", icon: Mic, path: "/professional/voice-expense" },
  { label: "Subscriptions", icon: CreditCard, path: "/professional/subscriptions" },
  { label: "Settings", icon: Settings2, path: "/professional/settings" },
];

// ── Hero Metric ───────────────────────────────────────────────────────────────
export const professionalHeroMetric: HeroMetric = {
  label: "Monthly savings",
  value: "₹32,800",
  progressLabel: "34% savings rate",
  progressPercent: "34%",
  progressValue: 34,
  subtitle: "₹5,200 more than your target",
};

// ── Stat Metrics ──────────────────────────────────────────────────────────────
export const professionalStatMetrics: StatMetric[] = [
  {
    label: "Total expenses",
    value: "₹62,480",
    delta: "8.4%",
    positive: false,
    icon: ArrowDownRight,
    tone: "coral",
  },
  {
    label: "Financial health score",
    value: "78 / 100",
    delta: "Good",
    positive: true,
    icon: HeartPulse as any,
    tone: "mint",
  },
];

// ── Transactions ──────────────────────────────────────────────────────────────
export const professionalTransactions: Transaction[] = [
  { name: "Swiggy order", category: "Food", date: "Today, 12:30 PM", amount: "−₹480", color: "coral" },
  { name: "Netflix subscription", category: "Subscription", date: "Yesterday, 10:00 AM", amount: "−₹649", color: "violet" },
  { name: "Electricity bill", category: "Bills", date: "12 Aug, 3:15 PM", amount: "−₹2,450", color: "blue" },
  { name: "Freelance payment", category: "Income", date: "10 Aug, 6:00 PM", amount: "+₹15,000", color: "mint" },
  { name: "Uber commute", category: "Travel", date: "09 Aug, 9:12 AM", amount: "−₹320", color: "cyan" },
];

// ── Trend Bars ────────────────────────────────────────────────────────────────
export const professionalTrendBars: TrendBar[] = [
  { month: "Jan", height: 52 },
  { month: "Feb", height: 60 },
  { month: "Mar", height: 55 },
  { month: "Apr", height: 70 },
  { month: "May", height: 65 },
  { month: "Jun", height: 78 },
  { month: "Jul", height: 72 },
  { month: "Aug", height: 82, isHighlighted: true },
  { month: "Sep", height: 68 },
  { month: "Oct", height: 74 },
  { month: "Nov", height: 58 },
  { month: "Dec", height: 80 },
];

// ── Budget ────────────────────────────────────────────────────────────────────
export const professionalBudgetCategories: BudgetCategory[] = [
  { label: "Food", value: "₹21,240", color: "#7BE2BE" },
  { label: "Bills", value: "₹13,740", color: "#a29bf4" },
  { label: "Travel", value: "₹9,420", color: "#f6ae8e" },
  { label: "Other", value: "₹8,080", color: "#a9dced" },
];

export const professionalBudgetUsed = 72;

// ── Savings Goal ──────────────────────────────────────────────────────────────
export const professionalSavingsGoal: SavingsGoal = {
  name: "Investment fund",
  current: 185000,
  target: 300000,
  percentComplete: 62,
};

// ── Emergency Fund ────────────────────────────────────────────────────────────
export const professionalEmergencyFund: EmergencyFundData = {
  current: 180000,
  recommended: 270000,
  monthsCovered: 4,
  percentComplete: 67,
};

// ── AI Insight ────────────────────────────────────────────────────────────────
export const professionalAIInsight: AIInsight = {
  headline: "Steady growth, room to optimise.",
  description:
    "Your subscriptions total ₹4,200/month. Consolidating two streaming services could save ₹800 monthly — nearly ₹10,000 a year.",
  timestamp: "Just now",
};

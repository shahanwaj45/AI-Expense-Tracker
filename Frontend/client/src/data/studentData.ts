import {
  Activity, Bot, CalendarDays, CreditCard, FileText, Goal,
  Grid2X2, HeartPulse, LayoutDashboard, Mic, ReceiptIndianRupee,
  Settings2, WalletCards, BriefcaseBusiness, ArrowDownRight, ArrowUpRight,
} from "lucide-react";
import type {
  NavItem, HeroMetric, StatMetric, Transaction,
  BudgetCategory, SavingsGoal, EmergencyFundData, AIInsight, TrendBar,
} from "@/types";

// ── Navigation ────────────────────────────────────────────────────────────────
export const studentNav: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, path: "/student" },
  { label: "Pocket Money", icon: WalletCards, path: "/student/pocket-money" },
  { label: "Expenses", icon: ReceiptIndianRupee, path: "/student/expenses" },
  { label: "Budget", icon: Grid2X2, path: "/student/budget" },
  { label: "Semester Budget", icon: CalendarDays, path: "/student/semester-budget" },
  { label: "Project Expenses", icon: BriefcaseBusiness, path: "/student/project-expenses" },
  { label: "Savings Goals", icon: Goal, path: "/student/savings-goals" },
  { label: "Emergency Fund", icon: HeartPulse, path: "/student/emergency-fund" },
  { label: "AI Insights", icon: Bot, path: "/student/ai-insights", badge: "AI" },
  { label: "Analytics", icon: Activity, path: "/student/analytics" },
  { label: "Reports", icon: FileText, path: "/student/reports" },
  { label: "Receipt Scanner", icon: ReceiptIndianRupee, path: "/student/receipt-scanner" },
  { label: "Voice Expense", icon: Mic, path: "/student/voice-expense" },
  { label: "Subscriptions", icon: CreditCard, path: "/student/subscriptions" },
  { label: "Settings", icon: Settings2, path: "/student/settings" },
];

// ── Hero Metric ───────────────────────────────────────────────────────────────
export const studentHeroMetric: HeroMetric = {
  label: "Pocket money remaining",
  value: "₹18,450",
  progressLabel: "63% of monthly pocket money",
  progressPercent: "63%",
  progressValue: 63,
  subtitle: "₹1,220 safe to spend each day",
};

// ── Stat Metrics ──────────────────────────────────────────────────────────────
export const studentStatMetrics: StatMetric[] = [
  {
    label: "Total spending",
    value: "₹11,550",
    delta: "8.4%",
    positive: false,
    icon: ArrowDownRight,
    tone: "coral",
  },
  {
    label: "Financial health",
    value: "78 / 100",
    delta: "Good",
    positive: true,
    icon: HeartPulse as any,
    tone: "mint",
  },
];

// ── Transactions ──────────────────────────────────────────────────────────────
export const studentTransactions: Transaction[] = [
  { name: "Lunch at Green Bowl", category: "Food", date: "Today, 1:12 PM", amount: "−₹250", color: "coral" },
  { name: "Uber ride", category: "Travel", date: "Yesterday, 8:44 PM", amount: "−₹180", color: "cyan" },
  { name: "Books & stationery", category: "Education", date: "10 Aug, 4:20 PM", amount: "−₹850", color: "blue" },
  { name: "Movie night", category: "Entertainment", date: "09 Aug, 7:05 PM", amount: "−₹300", color: "pink" },
];

// ── Trend Bars ────────────────────────────────────────────────────────────────
export const studentTrendBars: TrendBar[] = [
  { month: "Jan", height: 36 },
  { month: "Feb", height: 48 },
  { month: "Mar", height: 44 },
  { month: "Apr", height: 68 },
  { month: "May", height: 58 },
  { month: "Jun", height: 72 },
  { month: "Jul", height: 62 },
  { month: "Aug", height: 84, isHighlighted: true },
  { month: "Sep", height: 70 },
  { month: "Oct", height: 76 },
  { month: "Nov", height: 61 },
  { month: "Dec", height: 78 },
];

// ── Budget ────────────────────────────────────────────────────────────────────
export const studentBudgetCategories: BudgetCategory[] = [
  { label: "Food", value: "₹4,200", color: "#7BE2BE" },
  { label: "Transport", value: "₹2,100", color: "#a29bf4" },
  { label: "Books", value: "₹1,400", color: "#f6ae8e" },
  { label: "Other", value: "₹3,850", color: "#a9dced" },
];

export const studentBudgetUsed = 72;

// ── Savings Goal ──────────────────────────────────────────────────────────────
export const studentSavingsGoal: SavingsGoal = {
  name: "New laptop",
  current: 42800,
  target: 63000,
  percentComplete: 68,
};

// ── Emergency Fund ────────────────────────────────────────────────────────────
export const studentEmergencyFund: EmergencyFundData = {
  current: 60000,
  recommended: 90000,
  monthsCovered: 2,
  percentComplete: 67,
};

// ── AI Insight ────────────────────────────────────────────────────────────────
export const studentAIInsight: AIInsight = {
  headline: "Small shift, bigger breathing room.",
  description:
    "Your food expenses are 18% higher than last month. A ₹700 trim here could bring your savings rate back to target.",
  timestamp: "Just now",
};

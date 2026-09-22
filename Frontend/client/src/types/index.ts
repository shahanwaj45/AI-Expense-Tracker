import type { LucideIcon } from "lucide-react";

// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = "student" | "professional";

export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: UserRole;
}

// ── Navigation ────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string;
}

// ── Dashboard Metrics ─────────────────────────────────────────────────────────
export interface HeroMetric {
  label: string;
  value: string;
  progressLabel: string;
  progressPercent: string;
  progressValue: number;
  subtitle: string;
}

export interface StatMetric {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: LucideIcon;
  tone: "coral" | "mint";
}

// ── Transactions ──────────────────────────────────────────────────────────────
export interface Transaction {
  name: string;
  category: string;
  date: string;
  amount: string;
  color: "coral" | "cyan" | "blue" | "pink" | "mint" | "violet";
}

// ── Budget ────────────────────────────────────────────────────────────────────
export interface BudgetCategory {
  label: string;
  value: string;
  color: string;
}

// ── Savings Goal ──────────────────────────────────────────────────────────────
export interface SavingsGoal {
  name: string;
  current: number;
  target: number;
  percentComplete: number;
}

// ── Emergency Fund ────────────────────────────────────────────────────────────
export interface EmergencyFundData {
  current: number;
  recommended: number;
  monthsCovered: number;
  percentComplete: number;
}

// ── AI Insight ────────────────────────────────────────────────────────────────
export interface AIInsight {
  headline: string;
  description: string;
  timestamp: string;
}

// ── Trend Data ────────────────────────────────────────────────────────────────
export interface TrendBar {
  month: string;
  height: number;
  isHighlighted?: boolean;
  amount?: number;
}

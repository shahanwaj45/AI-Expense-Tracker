import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types";

interface Props {
  role: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  accentBg: string;
  children?: React.ReactNode;
}

/**
 * Reusable feature page header used across student/professional feature pages.
 * Preserves the Soft Signal design language from Home.tsx's "active !== Overview" view.
 */
export default function FeaturePageHeader({ role, title, description, icon: Icon, accentColor, accentBg, children }: Props) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-6 rounded-[24px] border border-[#e1e8e2] bg-white p-7 shadow-[0_14px_35px_rgba(42,65,55,.05)]"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-[#e8f8f0] px-3 py-1 text-[10px] font-bold uppercase tracking-[.13em] text-[#32795d]">
              {role} workspace
            </span>
            <h2 className="font-display text-3xl font-bold tracking-[-.05em]">{title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#7b8982]">{description}</p>
          </div>
          <div className="hidden rounded-2xl p-4 sm:block" style={{ backgroundColor: accentBg }}>
            <Icon size={24} style={{ color: accentColor }} />
          </div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f7faf7] p-4">
            <p className="text-[11px] text-[#93a09a]">Quick action</p>
            <p className="mt-1 text-sm font-bold">Add an expense</p>
          </div>
          <div className="rounded-2xl bg-[#f7faf7] p-4">
            <p className="text-[11px] text-[#93a09a]">Latest update</p>
            <p className="mt-1 text-sm font-bold">₹2,180 saved this month</p>
          </div>
          <div className="rounded-2xl bg-[#f7faf7] p-4">
            <p className="text-[11px] text-[#93a09a]">Next best action</p>
            <p className="mt-1 text-sm font-bold">
              Review your {role === "student" ? "semester" : "monthly"} budget
            </p>
          </div>
        </div>
      </motion.div>
      {children}
    </>
  );
}

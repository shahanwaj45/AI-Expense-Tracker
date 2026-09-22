import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";

interface Props {
  pageTitle: string;
  subtitle?: string;
  userInitials: string;
  role: UserRole;
  onMenuOpen: () => void;
  onSearch?: (query: string) => void;
}

export default function DashboardTopBar({
  pageTitle,
  subtitle,
  userInitials,
  role,
  onMenuOpen,
  onSearch,
}: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const handleQueryChange = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e6ebe6]/80 bg-[#f5f7f3]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          className="rounded-xl bg-white p-2.5 text-[#172532] shadow-sm lg:hidden"
          onClick={onMenuOpen}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#9ba6a0]">
            {subtitle ?? (role === "student" ? "Student workspace" : "Professional workspace")}
          </p>
          <h1 className="font-display text-[19px] font-bold tracking-[-.04em]">
            {pageTitle}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 210, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search transactions"
                className="h-10 w-[210px] rounded-xl border border-[#e2e8e1] bg-white px-3 text-[12px] outline-none ring-[#7BE2BE] focus:ring-2"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowSearch((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#728079] shadow-[3px_4px_10px_rgba(23,37,50,.06)] transition hover:-translate-y-0.5 hover:text-[#172532]"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
        <button
          onClick={() => toast.info("You have 3 new insights")}
          className="relative grid h-10 w-10 place-items-center rounded-xl bg-white text-[#728079] shadow-[3px_4px_10px_rgba(23,37,50,.06)] transition hover:-translate-y-0.5 hover:text-[#172532]"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f29b75]" />
        </button>
        <button
          onClick={() => toast.info("Profile settings ready")}
          className="hidden items-center gap-2 rounded-xl bg-white px-2 py-1.5 shadow-[3px_4px_10px_rgba(23,37,50,.06)] sm:flex"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#dbeee6] text-[10px] font-bold text-[#357963]">
            {userInitials}
          </span>
          <ChevronDown size={14} className="text-[#9ba6a0]" />
        </button>
      </div>
    </header>
  );
}

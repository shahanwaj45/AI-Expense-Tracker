import { Bell, LogOut, MoreHorizontal, Settings2, X } from "lucide-react";
import Logo from "@/components/Logo";
import { toast } from "sonner";
import { useLocation } from "wouter";
import type { NavItem, UserRole } from "@/types";

interface Props {
  role: UserRole;
  navItems: NavItem[];
  activePath: string;
  mobileOpen: boolean;
  onClose: () => void;
  userName: string;
  userInitials: string;
  onLogout: () => void;
}

export default function DashboardSidebar({
  role,
  navItems,
  activePath,
  mobileOpen,
  onClose,
  userName,
  userInitials,
  onLogout,
}: Props) {
  const [, navigate] = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-[#e3e8e2] bg-[#f8faf7]/95 px-5 py-6 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="mb-9 flex items-center justify-between px-2">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => handleNav(`/${role}`)}
            aria-label="Home"
          >
            <Logo size="md" />
          </button>
          <button
            className="rounded-lg p-1 text-[#83918d] lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace label */}
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.17em] text-[#96a19c]">
          {role === "student" ? "Student" : "Professional"} Workspace
        </p>

        {/* Navigation */}
        <nav className="space-y-1 overflow-y-auto pr-1 flex-1">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all ${
                  isActive
                    ? "bg-[#172532] text-white shadow-[5px_7px_18px_rgba(23,37,50,.16)]"
                    : "text-[#728079] hover:bg-white hover:text-[#172532] hover:shadow-[3px_4px_12px_rgba(23,37,50,.06)]"
                }`}
              >
                <item.icon
                  size={17}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={
                    isActive
                      ? "text-[#7BE2BE]"
                      : "text-[#9aa6a0] group-hover:text-[#172532]"
                  }
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-[#e4dcff] px-1.5 py-0.5 text-[9px] font-bold text-[#6d5bb7]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto space-y-1 pt-4">
          <button
            onClick={() => toast.info("Notifications are all caught up")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[#728079] hover:bg-white"
          >
            <Bell size={17} /> Notifications{" "}
            <span className="ml-auto h-2 w-2 rounded-full bg-[#f29b75]" />
          </button>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[#728079] hover:bg-white"
          >
            <LogOut size={17} /> Logout
          </button>
          <div className="mt-3 flex items-center gap-3 border-t border-[#e4eae5] px-3 pt-4">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dbeee6] text-[12px] font-bold text-[#357963]">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold">{userName}</p>
              <p className="text-[11px] text-[#98a39e]">
                {role === "student" ? "Student account" : "Professional account"}
              </p>
            </div>
            <MoreHorizontal size={17} className="ml-auto text-[#a2aaa5]" />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-[#172532]/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
    </>
  );
}

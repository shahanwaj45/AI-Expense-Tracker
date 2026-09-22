import { Settings2, LogOut, User, Bell, Shield } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";

export default function Settings() {
  const { user, role, logout } = useAuth();
  const [, navigate] = useLocation();
  const isStudent = role === "student";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Settings"
    >
      <div className="space-y-5">
        {/* Profile */}
        <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[#dbeee6] text-[18px] font-bold text-[#357963]">
              {user?.initials ?? "U"}
            </div>
            <div>
              <h3 className="font-display text-[20px] font-bold tracking-[-.04em]">{user?.name}</h3>
              <p className="text-[12px] text-[#82908a]">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full bg-[#e7f8ef] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#3b8165]">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Settings sections */}
        <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
          <h3 className="mb-4 font-display text-[18px] font-bold tracking-[-.04em]">Preferences</h3>
          <div className="space-y-2">
            {[
              { icon: User, label: "Edit Profile", action: "Profile settings opened" },
              { icon: Bell, label: "Notifications", action: "Notification preferences opened" },
              { icon: Shield, label: "Privacy & Security", action: "Security settings opened" },
              { icon: Settings2, label: "App Preferences", action: "App preferences opened" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => toast.info(item.action)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-semibold text-[#52615a] hover:bg-[#f9fbf8]"
              >
                <item.icon size={17} className="text-[#9aa6a0]" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-[#fff0eb] py-4 text-[13px] font-bold text-[#c87855] transition hover:bg-[#ffe5db]"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </DashboardLayout>
  );
}

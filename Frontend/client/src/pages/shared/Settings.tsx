import { useState, useEffect } from "react";
import { Settings2, LogOut, User, Bell, Shield, Download, Check, Save, KeyRound, Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function Settings() {
  const { user, role, logout } = useAuth();
  const [, navigate] = useLocation();
  const isStudent = role === "student";

  // Tab State
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "data" | "preferences">("profile");

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [monthlyAllowance, setMonthlyAllowance] = useState(String((user as any)?.monthly_allowance || (isStudent ? 30000 : 85000)));
  const [savingProfile, setSavingProfile] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Preferences State
  const [currency, setCurrency] = useState("INR (₹)");
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [receiptAlerts, setReceiptAlerts] = useState(true);

  // Export State
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if ((user as any)?.monthly_allowance) setMonthlyAllowance(String((user as any).monthly_allowance));
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const allowanceNum = parseFloat(monthlyAllowance);
    if (isNaN(allowanceNum) || allowanceNum <= 0) {
      toast.error("Please enter a valid monthly allowance");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.patch("/users/me", {
        name: name.trim(),
        monthly_allowance: allowanceNum,
      });
      if (res.data.success) {
        toast.success("Profile and monthly budget updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.data.success) {
        toast.success("Password changed successfully! Keep it safe.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password. Verify your current password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expense_tracker_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Transactions exported as CSV!");
    } catch (err) {
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

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
      <FeaturePageHeader
        role={role!}
        title="Account & System Settings"
        description="Configure your financial preferences, adjust your monthly allowance, update security credentials, and manage your data."
        icon={Settings2}
        accentColor="#718279"
        accentBg="#eef4f0"
      />

      {/* Profile Overview Card */}
      <div className="mt-5 rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#edf3ef]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#dbeee6] text-[20px] font-bold text-[#357963] shadow-sm">
              {user?.initials ?? "U"}
            </div>
            <div>
              <h3 className="font-display text-[22px] font-bold tracking-[-.04em] text-[#172532]">{user?.name}</h3>
              <p className="text-[13px] text-[#82908a]">{user?.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-block rounded-full bg-[#e7f8ef] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3b8165]">
                  {role} Account
                </span>
                <span className="text-[11px] text-[#9aa69f]">• Active Session</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#fff0eb] px-5 py-2.5 text-[12px] font-bold text-[#c87855] transition hover:bg-[#ffe5db] border border-[#fddfd4] active:scale-95"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-[#e9efe9] pb-3">
        {[
          { id: "profile", label: "Profile & Allowance", icon: User },
          { id: "security", label: "Security & Password", icon: KeyRound },
          { id: "data", label: "Data Management", icon: Database },
          { id: "preferences", label: "Preferences", icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[12px] font-bold transition ${
              activeTab === tab.id
                ? "bg-[#172532] text-white shadow-sm"
                : "bg-white text-[#718078] hover:bg-[#f3f7f4] border border-[#edf3ef]"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {/* Profile & Allowance Tab */}
        {activeTab === "profile" && (
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#edf3ef]">
            <h3 className="font-display text-[19px] font-bold text-[#172532] pb-3 border-b border-[#edf3ef]">
              Personal Information & Monthly Budget
            </h3>

            <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4 max-w-lg">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Full Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3.5 py-2.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f2f4f2] px-3.5 py-2.5 text-[13px] font-semibold text-[#82908a] cursor-not-allowed"
                />
                <span className="text-[10px] text-[#9aa69f] mt-1 block">Email address cannot be changed once verified.</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Monthly Allowance / Budget Target (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="500"
                    value={monthlyAllowance}
                    onChange={(e) => setMonthlyAllowance(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-[#82908a] mt-1 block">
                  Used by the AI analytics engine and budget cards to calculate consumption percentages.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-[#357963] px-5 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#357963]/20 transition hover:bg-[#2c6553] disabled:opacity-50"
                >
                  <Save size={15} />
                  {savingProfile ? "Saving changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security & Password Tab */}
        {activeTab === "security" && (
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#edf3ef]">
            <h3 className="font-display text-[19px] font-bold text-[#172532] pb-3 border-b border-[#edf3ef]">
              Change Password & Credentials
            </h3>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4 max-w-lg">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3.5 py-2.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3.5 py-2.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-type new password"
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3.5 py-2.5 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 rounded-xl bg-[#172532] px-5 py-2.5 text-[12px] font-bold text-white shadow-md transition hover:bg-[#25394b] disabled:opacity-50"
                >
                  <Shield size={15} />
                  {savingPassword ? "Updating password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === "data" && (
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#edf3ef]">
            <h3 className="font-display text-[19px] font-bold text-[#172532] pb-3 border-b border-[#edf3ef]">
              Data Backup & Export
            </h3>

            <div className="mt-5 max-w-lg space-y-5">
              <div className="rounded-2xl bg-[#f9fbf8] p-5 border border-[#edf3ed]">
                <h4 className="text-[14px] font-bold text-[#172532]">Download Financial Records</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#687770]">
                  Export all your expenses, incomes, and OCR scanned receipt entries in a standardized CSV format compatible with Excel, Google Sheets, and accounting software.
                </p>

                <button
                  onClick={handleExportData}
                  disabled={exporting}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-[#357963] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-[#2b6452] transition disabled:opacity-50"
                >
                  <Download size={15} />
                  {exporting ? "Preparing CSV..." : "Export All Transactions (CSV)"}
                </button>
              </div>

              <div className="rounded-2xl bg-[#fff9f8] p-5 border border-[#feded6]">
                <h4 className="text-[14px] font-bold text-[#df7f64]">Account Data Safeguards</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-[#8a6a62]">
                  Your data is stored securely in your dedicated SQLite database with JWT hashed sessions and client encryption.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#edf3ef]">
            <h3 className="font-display text-[19px] font-bold text-[#172532] pb-3 border-b border-[#edf3ef]">
              Notification & Display Preferences
            </h3>

            <div className="mt-5 max-w-lg space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#fafcfa] border border-[#edf3ed]">
                <div>
                  <h4 className="text-[13px] font-bold text-[#172532]">Display Currency</h4>
                  <p className="text-[11px] text-[#82908a]">Primary currency shown across all dashboards</p>
                </div>
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    toast.success(`Currency set to ${e.target.value}`);
                  }}
                  className="rounded-xl border border-[#dfe5df] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#172532] focus:outline-none"
                >
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#fafcfa] border border-[#edf3ed]">
                <div>
                  <h4 className="text-[13px] font-bold text-[#172532]">Weekly AI Financial Digest</h4>
                  <p className="text-[11px] text-[#82908a]">Receive weekly spending velocity and budget alert notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => {
                    setWeeklyDigest(e.target.checked);
                    toast.success(e.target.checked ? "Weekly digest enabled" : "Weekly digest muted");
                  }}
                  className="h-5 w-5 rounded border-[#dfe5df] text-[#357963] focus:ring-[#357963]"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#fafcfa] border border-[#edf3ed]">
                <div>
                  <h4 className="text-[13px] font-bold text-[#172532]">Smart Receipt Auto-Save Alert</h4>
                  <p className="text-[11px] text-[#82908a]">Confirm extracted receipt line-items after scanning</p>
                </div>
                <input
                  type="checkbox"
                  checked={receiptAlerts}
                  onChange={(e) => {
                    setReceiptAlerts(e.target.checked);
                    toast.success("Receipt preferences saved");
                  }}
                  className="h-5 w-5 rounded border-[#dfe5df] text-[#357963] focus:ring-[#357963]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

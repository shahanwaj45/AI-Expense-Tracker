import { useEffect, useState } from "react";
import { CreditCard, Plus, Trash2, Calendar, AlertCircle, X, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

const PRESET_COLORS = [
  "#E50914", // Netflix Red
  "#1DB954", // Spotify Green
  "#00A8E1", // Prime Blue
  "#7BE2BE", // Mint
  "#a29bf4", // Purple
  "#fed876", // Amber
  "#ffb0c8", // Pink
  "#10a37f", // OpenAI Teal
];

export default function Subscriptions() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState("₹0");
  const [totalRaw, setTotalRaw] = useState(0);

  // Add Subscription Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState("Monthly");
  const [nextDate, setNextDate] = useState("");
  const [color, setColor] = useState("#a9dced");
  const [saving, setSaving] = useState(false);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/subscriptions");
      if (res.data.success) {
        setSubscriptions(res.data.data.items || []);
        setTotal(res.data.data.total_formatted || `₹${(res.data.data.total || 0).toLocaleString("en-IN")}`);
        setTotalRaw(res.data.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim()) {
      toast.error("Please enter subscription service name");
      return;
    }
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid amount greater than ₹0");
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        name: name.trim(),
        amount: amt,
        cycle,
        color,
      };
      if (nextDate) payload.next_billing_date = nextDate;

      const res = await api.post("/subscriptions", payload);
      if (res.data.success) {
        toast.success(`Subscription "${name}" added!`);
        setIsModalOpen(false);
        setName("");
        setAmount("");
        setCycle("Monthly");
        setNextDate("");
        setColor("#a9dced");
        await fetchSubs();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add subscription");
    } finally {
      setSaving(false);
    }
  };

  const deleteSub = async (id: string, subName: string) => {
    if (!confirm(`Are you sure you want to remove ${subName}?`)) return;

    try {
      await api.delete(`/subscriptions/${id}`);
      toast.success(`${subName} removed from subscriptions`);
      await fetchSubs();
    } catch {
      toast.error("Failed to remove subscription");
    }
  };

  const yearlyCost = `₹${(totalRaw * 12).toLocaleString("en-IN")}`;
  const nextRenewal = subscriptions[0];

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Subscriptions"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FeaturePageHeader
          role={role!}
          title="Recurring Subscriptions"
          description="Manage all your digital services and recurring memberships. Track auto-renewals and prevent unnoticed financial leaks."
          icon={CreditCard}
          accentColor="#a9dced"
          accentBg="#e7f7fa"
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#172532] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#172532]/20 transition hover:bg-[#25394b] active:scale-95"
        >
          <Plus size={16} /> Add Subscription
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[26px] bg-[#172532] p-6 text-white shadow-[10px_14px_35px_rgba(23,37,50,.16)]">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#a5b9b0]">Monthly Commitments</p>
          <p className="mt-3 font-display text-[34px] font-bold tracking-[-.06em]">{total}</p>
          <p className="mt-2 text-[11px] text-[#a5b9b0]">{subscriptions.length} active recurring services</p>
        </div>

        <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#edf3ef]">
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#9aa69f]">Annualized Spend</p>
          <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em] text-[#172532]">{yearlyCost}</p>
          <p className="mt-2 text-[11px] text-[#9ba59f]">Projected 12-month recurring total</p>
        </div>

        <div className="rounded-[26px] bg-[#eef3ff] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)] border border-[#dde6fa]">
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#695db3]">Upcoming Renewal</p>
          <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em] text-[#2c2269]">
            {nextRenewal?.next ?? "None soon"}
          </p>
          <p className="mt-2 text-[11px] text-[#8c8bb3]">
            {nextRenewal ? `${nextRenewal.name} · ${nextRenewal.amount}` : "All renewals up to date"}
          </p>
        </div>
      </div>

      {/* Active Subscriptions Card */}
      <div className="mt-6 rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#edf3ef]">
        <div className="flex items-center justify-between pb-3 border-b border-[#edf3ef]">
          <div>
            <h3 className="font-display text-[21px] font-bold tracking-[-.05em] text-[#172532]">Active Subscriptions</h3>
            <p className="text-[12px] text-[#82908a]">Auto-billed software, streaming, and memberships</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 rounded-xl bg-[#f5f8f4] px-3 py-2 text-[11px] font-bold text-[#4c5c53] hover:bg-[#eaf0e9] transition"
          >
            <Plus size={14} /> Add new
          </button>
        </div>

        {loading ? (
          <div className="mt-8 flex h-32 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#a9dced] border-t-transparent" />
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="mt-4 divide-y divide-[#edf2ed]">
            {subscriptions.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-4 transition hover:bg-[#fafcfa] px-2 rounded-xl">
                <div className="flex items-center gap-3.5">
                  <div
                    className="h-11 w-11 grid place-items-center rounded-2xl shadow-sm"
                    style={{ backgroundColor: `${s.color || '#a9dced'}22` }}
                  >
                    <CreditCard size={18} style={{ color: s.color || '#333' }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#172532]">{s.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#9ba59f] mt-0.5">
                      <span>{s.cycle || "Monthly"}</span>
                      {s.next && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#695db3]">
                            <Calendar size={11} /> Renewing: {s.next}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-display text-[15px] font-bold text-[#df7f64]">
                    −₹{parseFloat(String(s.amount).replace(/[^0-9.]/g, '') || "0").toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => deleteSub(s.id, s.name)}
                    className="rounded-lg p-2 text-[#b0beba] hover:text-red-500 hover:bg-[#fdedeb] transition"
                    title="Remove subscription"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <CreditCard size={36} className="mx-auto mb-3 text-[#a9dced]" />
            <h4 className="font-display text-[18px] font-bold text-[#172532]">No active subscriptions added</h4>
            <p className="mt-1 text-[13px] text-[#82908a]">
              Keep track of Netflix, Spotify, gym memberships, and cloud tools in one central dashboard.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#172532] px-5 py-2.5 text-[12px] font-bold text-white shadow-md hover:bg-[#25394b] transition"
            >
              <Plus size={15} /> Add your first subscription
            </button>
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf2ed]">
              <h3 className="font-display text-[20px] font-bold text-[#172532]">
                Add Recurring Subscription
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#82908a] hover:bg-[#f3f6f3] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Service / Tool Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Netflix, Spotify, Gym, ChatGPT Plus, AWS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3.5 py-2.5 text-[13px] font-semibold text-[#172532] focus:border-[#a9dced] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Cost per Cycle (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#a9dced] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                    Billing Cycle
                  </label>
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value)}
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3 py-2.5 text-[12px] font-semibold text-[#172532] focus:outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                    Next Renewal Date
                  </label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3 py-2.5 text-[12px] font-semibold text-[#172532] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full transition ${
                        color === c ? "ring-2 ring-[#172532] scale-110" : "opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-[12px] font-bold text-[#82908a] hover:bg-[#f3f6f3] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#172532] px-5 py-2 text-[12px] font-bold text-white shadow-md transition hover:bg-[#25394b] disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Save Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { CreditCard, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState("₹0");
  const [totalRaw, setTotalRaw] = useState(0);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/subscriptions");
      if (res.data.success) {
        setSubscriptions(res.data.data.items);
        setTotal(res.data.data.total_formatted);
        setTotalRaw(res.data.data.total);
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSub = async (id: string, name: string) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      toast.success(`${name} removed`);
      fetchSubs();
    } catch {
      toast.error("Failed to remove subscription");
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  const yearlyCost = `₹${(totalRaw * 12).toLocaleString("en-IN")}`;
  const nextRenewal = subscriptions[0];

  return (
    <DashboardLayout role="professional" navItems={professionalNav} pageTitle="Subscriptions">
      <FeaturePageHeader
        role="professional"
        title="Subscriptions"
        description="Manage all your recurring payments in one place. See what's renewing and optimise your monthly commitments."
        icon={CreditCard}
        accentColor="#a9dced"
        accentBg="#e7f7fa"
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[26px] bg-[#172532] p-6 text-white shadow-[10px_14px_35px_rgba(23,37,50,.16)]">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#a5b9b0]">Monthly Total</p>
          <p className="mt-3 font-display text-[36px] font-bold tracking-[-.07em]">{total}</p>
          <p className="mt-2 text-[11px] text-[#a5b9b0]">{subscriptions.length} active subscriptions</p>
        </div>
        <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#9aa69f]">Yearly Cost</p>
          <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em]">{yearlyCost}</p>
          <p className="mt-2 text-[11px] text-[#9ba59f]">Based on current subscriptions</p>
        </div>
        <div className="rounded-[26px] bg-[#eef3ff] p-6 shadow-[6px_9px_23px_rgba(42,65,55,.05)]">
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#695db3]">Next Renewal</p>
          <p className="mt-3 font-display text-[32px] font-bold tracking-[-.06em]">{nextRenewal?.next ?? "—"}</p>
          <p className="mt-2 text-[11px] text-[#8c8bb3]">{nextRenewal ? `${nextRenewal.name} · ${nextRenewal.amount}` : "No subscriptions"}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-[21px] font-bold tracking-[-.05em]">Active subscriptions</h3>
          <button
            onClick={() => toast.info("To add subscriptions, use the API directly or the Settings page.")}
            className="flex items-center gap-1 rounded-xl bg-[#f5f8f4] px-3 py-2 text-[11px] font-bold text-[#718078]"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {loading ? (
          <div className="mt-6 flex h-24 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#a9dced] border-t-transparent" />
          </div>
        ) : (
          <div className="mt-5 divide-y divide-[#eef1ed]">
            {subscriptions.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 grid place-items-center rounded-xl" style={{ backgroundColor: `${s.color}18` }}>
                    <CreditCard size={17} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold">{s.name}</p>
                    <p className="text-[11px] text-[#9ba59f]">{s.cycle} · Next: {s.next ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[13px] font-bold text-[#df7f64]">−{s.amount}</p>
                  <button onClick={() => deleteSub(s.id, s.name)} className="text-[#c5c5c5] hover:text-red-400 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

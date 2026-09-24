import { useEffect, useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import TransactionList from "@/components/dashboard/TransactionList";
import AddExpenseModal from "@/components/dashboard/AddExpenseModal";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function Transactions() {
  const { role } = useAuth();
  const isStudent = role === "student";
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (typeFilter !== "all") params.type = typeFilter;
      const res = await api.get("/transactions", { params });
      if (res.data?.success) setTransactions(res.data.data.items || []);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, typeFilter]);

  return (
    <DashboardLayout
      role={role || "student"}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Transactions"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FeaturePageHeader
          role={role || "student"}
          title="Transactions"
          description="Your complete transaction history. Search, filter, and track both expenses and money received."
          icon={FileText}
          accentColor="#738ce2"
          accentBg="#eaf0ff"
        />
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#172532] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-[#203446] transition hover:-translate-y-0.5 self-start sm:self-auto mb-4 sm:mb-0"
        >
          <Plus size={16} className="text-[#7BE2BE]" /> Add Transaction
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9891]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, merchant, or notes..."
            className="h-11 w-full rounded-xl border border-[#e2e9e2] bg-white pl-10 pr-4 text-sm font-medium text-[#172532] outline-none focus:border-[#738ce2] focus:ring-2 focus:ring-[#eaf0ff]"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex rounded-xl bg-[#f0f4f1] p-1 self-start sm:self-auto">
          <button
            onClick={() => setTypeFilter("all")}
            className={`rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition ${
              typeFilter === "all" ? "bg-white text-[#172532] shadow-sm" : "text-[#73837b] hover:text-[#172532]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter("expense")}
            className={`rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition ${
              typeFilter === "expense" ? "bg-white text-[#d66f4e] shadow-sm" : "text-[#73837b] hover:text-[#172532]"
            }`}
          >
            Expenses (Spent)
          </button>
          <button
            onClick={() => setTypeFilter("income")}
            className={`rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition ${
              typeFilter === "income" ? "bg-white text-[#2b7256] shadow-sm" : "text-[#73837b] hover:text-[#172532]"
            }`}
          >
            Income (Received)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#7BE2BE] border-t-transparent" />
        </div>
      ) : (
        <TransactionList transactions={transactions} />
      )}

      {/* Add Transaction Modal */}
      <AddExpenseModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); fetchTransactions(); }}
      />
    </DashboardLayout>
  );
}

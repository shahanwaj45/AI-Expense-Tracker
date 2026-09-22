import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import TransactionList from "@/components/dashboard/TransactionList";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

export default function Transactions() {
  const { role } = useAuth();
  const isStudent = role === "student";
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get("/transactions", { params });
      if (res.data.success) setTransactions(res.data.data.items);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search]);

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Transactions"
    >
      <FeaturePageHeader
        role={role!}
        title="Transactions"
        description="Your complete transaction history. Search, filter, and export your financial records."
        icon={FileText}
        accentColor="#738ce2"
        accentBg="#eaf0ff"
      />

      {/* Search bar */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="h-11 w-full max-w-sm rounded-xl border border-[#e2e9e2] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#b8ecd6]"
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#7BE2BE] border-t-transparent" />
        </div>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </DashboardLayout>
  );
}

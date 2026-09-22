import { useEffect, useState } from "react";
import { ReceiptIndianRupee } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import TransactionList from "@/components/dashboard/TransactionList";
import { studentNav, studentTransactions } from "@/data/studentData";
import { professionalNav, professionalTransactions } from "@/data/professionalData";
import api from "@/lib/api";

export default function Expenses() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const defaultList = isStudent ? studentTransactions : professionalTransactions;
  const [expenses, setExpenses] = useState<any[]>(defaultList);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/transactions", { params: { type: "expense", limit: 30 } })
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data.data?.items)) {
          setExpenses(res.data.data.items);
        }
      })
      .catch((err) => {
        console.warn("Using fallback expenses:", err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [role]);

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Expenses"
    >
      <FeaturePageHeader
        role={role!}
        title="Expenses"
        description="View, categorise, and analyse all your expenses in one place. Filter by date, category, or payment method."
        icon={ReceiptIndianRupee}
        accentColor="#e98b68"
        accentBg="#fff5ef"
      />
      {loading && expenses.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#e98b68] border-t-transparent" />
        </div>
      ) : (
        <TransactionList transactions={expenses} />
      )}
    </DashboardLayout>
  );
}

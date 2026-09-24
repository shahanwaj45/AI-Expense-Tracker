import { useEffect, useState } from "react";
import { Grid2X2, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import BudgetHealthCard from "@/components/dashboard/BudgetHealthCard";
import { studentNav, studentBudgetCategories, studentBudgetUsed } from "@/data/studentData";
import { professionalNav, professionalBudgetCategories, professionalBudgetUsed } from "@/data/professionalData";
import type { BudgetCategory } from "@/types";
import api from "@/lib/api";

interface EnrichedBudgetCategory extends BudgetCategory {
  id?: string;
  category?: string;
  limit_amount?: number;
  spent?: number;
  spent_formatted?: string;
  remaining?: number;
  percent_used?: number;
}

const CATEGORY_OPTIONS = [
  { name: "Food", color: "#7BE2BE" },
  { name: "Travel", color: "#a29bf4" },
  { name: "Bills", color: "#f6ae8e" },
  { name: "Education", color: "#a9dced" },
  { name: "Entertainment", color: "#ffb0c8" },
  { name: "Shopping", color: "#fed876" },
  { name: "Health", color: "#83d8c9" },
  { name: "Other", color: "#b8c5d6" },
];

export default function Budget() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const defaultCategories = isStudent ? studentBudgetCategories : professionalBudgetCategories;
  const defaultUsed = isStudent ? studentBudgetUsed : professionalBudgetUsed;

  const [categories, setCategories] = useState<EnrichedBudgetCategory[]>(defaultCategories);
  const [usedPercent, setUsedPercent] = useState<number>(defaultUsed);
  const [totalLimit, setTotalLimit] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Month & Year state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<EnrichedBudgetCategory | null>(null);
  const [formCategory, setFormCategory] = useState("Food");
  const [formLimit, setFormLimit] = useState("");
  const [formColor, setFormColor] = useState("#7BE2BE");
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const fetchedCats = data.categories || data.items || [];
        setCategories(fetchedCats.length > 0 ? fetchedCats : defaultCategories);
        setUsedPercent(typeof data.usedPercent === "number" ? data.usedPercent : 0);
        setTotalLimit(data.total_limit || 0);
        setTotalSpent(data.total_spent || 0);
      }
    } catch (err: any) {
      console.warn("Using fallback budget rules:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear, role]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const openAddModal = (cat?: EnrichedBudgetCategory) => {
    if (cat) {
      setEditingBudget(cat);
      setFormCategory(cat.category || cat.label);
      setFormLimit(String(cat.limit_amount || (typeof cat.value === 'string' ? parseFloat(cat.value.replace(/[^0-9.]/g, '')) : cat.value) || 5000));
      setFormColor(cat.color || "#7BE2BE");
    } else {
      setEditingBudget(null);
      setFormCategory(CATEGORY_OPTIONS[0].name);
      setFormLimit("");
      setFormColor(CATEGORY_OPTIONS[0].color);
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(formLimit);
    if (!limitNum || limitNum <= 0) {
      toast.error("Please enter a valid budget limit greater than ₹0");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        category: formCategory,
        limit_amount: limitNum,
        color: formColor,
        month: selectedMonth,
        year: selectedYear,
      };

      await api.post("/budgets", payload);
      toast.success(editingBudget ? `Budget for ${formCategory} updated!` : `Budget limit set for ${formCategory}`);
      setIsModalOpen(false);
      await fetchBudgets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save budget limit");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id?: string, catName?: string) => {
    if (!id) {
      toast.error("Cannot delete default template category");
      return;
    }
    if (!confirm(`Are you sure you want to remove the budget rule for ${catName}?`)) return;

    try {
      await api.delete(`/budgets/${id}`);
      toast.success(`Removed budget rule for ${catName}`);
      await fetchBudgets();
    } catch (err: any) {
      toast.error("Failed to delete budget");
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Budget"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FeaturePageHeader
          role={role!}
          title="Budget"
          description="Set spending limits by category and track your progress throughout the month. Stay within your comfort zone."
          icon={Grid2X2}
          accentColor="#a29bf4"
          accentBg="#f0edff"
        />

        {/* Month Picker & Set Budget Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-2xl bg-white px-3 py-1.5 shadow-[4px_6px_16px_rgba(42,65,55,.05)] border border-[#edf2ed]">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-[#82908a] hover:bg-[#f3f6f3] transition"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-[12px] font-bold text-[#172532] whitespace-nowrap">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-[#82908a] hover:bg-[#f3f6f3] transition"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 rounded-2xl bg-[#a29bf4] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-[#a29bf4]/25 transition hover:bg-[#8e85ee] active:scale-95"
          >
            <Plus size={16} /> Set / Adjust Budget
          </button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f0f4f0]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9aa69f]">Total Allocated</span>
          <p className="mt-2 font-display text-[26px] font-bold text-[#172532]">
            ₹{totalLimit.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#82908a]">Across {categories.length} categories</p>
        </div>

        <div className="rounded-[22px] bg-white p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#f0f4f0]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9aa69f]">Spent So Far</span>
          <p className="mt-2 font-display text-[26px] font-bold text-[#df7f64]">
            ₹{totalSpent.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#82908a]">{usedPercent}% of total budget</p>
        </div>

        <div className="rounded-[22px] bg-[#eef8f4] p-5 shadow-[6px_9px_23px_rgba(42,65,55,.06)] border border-[#d6ede4]">
          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#41aa7e]">Remaining Buffer</span>
          <p className="mt-2 font-display text-[26px] font-bold text-[#2d7d5c]">
            ₹{Math.max(0, totalLimit - totalSpent).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#559b7d]">
            {totalSpent > totalLimit ? "Over budget limit" : "Safe spending room"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <BudgetHealthCard
          categories={categories}
          usedPercent={usedPercent}
        />

        {/* Detailed Category Allocations & Progress */}
        <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] border border-[#f0f4f0]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-[20px] font-bold tracking-[-.05em] text-[#172532]">Category Allocations</h3>
              <p className="mt-1 text-[12px] text-[#82908a]">
                Active limits for {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            <button
              onClick={() => openAddModal()}
              className="text-[11px] font-bold text-[#a29bf4] hover:underline"
            >
              + Add category
            </button>
          </div>

          <div className="mt-5 space-y-3.5">
            {categories.map((cat, idx) => {
              const spent = cat.spent || 0;
              const limit = cat.limit_amount || (typeof cat.value === 'string' ? parseFloat(cat.value.replace(/[^0-9.]/g, '')) : cat.value) || 0;
              const pct = typeof cat.percent_used === 'number' ? cat.percent_used : (limit > 0 ? Math.round((spent / limit) * 100) : 0);
              const isOver = pct > 100;
              const isNear = pct >= 80 && pct <= 100;

              return (
                <div
                  key={cat.id || cat.label || idx}
                  className="rounded-2xl border border-[#edf2ed] bg-[#fbfdfb] p-4 transition hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                      <div>
                        <span className="text-[13px] font-bold text-[#172532]">{cat.label || cat.category}</span>
                        <div className="flex items-center gap-2 text-[11px] text-[#82908a]">
                          <span>Spent: ₹{spent.toLocaleString("en-IN")}</span>
                          <span>•</span>
                          <span>Limit: ₹{limit.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isOver
                            ? "bg-[#ffece8] text-[#d9534f]"
                            : isNear
                            ? "bg-[#fff6e6] text-[#c97d1e]"
                            : "bg-[#e8f8f0] text-[#2e7d5a]"
                        }`}
                      >
                        {isOver ? <AlertTriangle size={11} /> : isNear ? <TrendingUp size={11} /> : <CheckCircle2 size={11} />}
                        {pct}%
                      </span>

                      <button
                        onClick={() => openAddModal(cat)}
                        className="p-1.5 text-[#9aa69f] hover:text-[#a29bf4] transition rounded-lg hover:bg-white"
                        title="Adjust Budget"
                      >
                        <Edit2 size={13} />
                      </button>

                      {cat.id && (
                        <button
                          onClick={() => handleDeleteBudget(cat.id, cat.label || cat.category)}
                          className="p-1.5 text-[#9aa69f] hover:text-red-500 transition rounded-lg hover:bg-white"
                          title="Delete Budget"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#eef2ed]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? "bg-[#e05244]"
                          : isNear
                          ? "bg-[#e59b39]"
                          : "bg-[#41aa7e]"
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Set / Adjust Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf2ed]">
              <h3 className="font-display text-[20px] font-bold text-[#172532]">
                {editingBudget ? "Adjust Category Budget" : "Set Category Budget"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-[#82908a] hover:bg-[#f3f6f3] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    const opt = CATEGORY_OPTIONS.find((c) => c.name === e.target.value);
                    if (opt) setFormColor(opt.color);
                  }}
                  className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3.5 py-2.5 text-[13px] font-semibold text-[#172532] focus:border-[#a29bf4] focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Monthly Limit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[14px] font-bold text-[#82908a]">₹</span>
                  <input
                    type="number"
                    step="50"
                    placeholder="e.g. 5000"
                    value={formLimit}
                    onChange={(e) => setFormLimit(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] py-2.5 pl-8 pr-3.5 text-[13px] font-semibold text-[#172532] focus:border-[#a29bf4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3 py-2 text-[12px] font-semibold text-[#172532] focus:outline-none"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#dfe5df] bg-[#f9fbf8] px-3 py-2 text-[12px] font-semibold text-[#172532] focus:outline-none"
                  >
                    {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[.12em] text-[#82908a] mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {CATEGORY_OPTIONS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setFormColor(c.color)}
                      className={`h-7 w-7 rounded-full transition ${
                        formColor === c.color ? "ring-2 ring-[#a29bf4] scale-110" : "opacity-75 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c.color }}
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
                  className="rounded-xl bg-[#a29bf4] px-5 py-2 text-[12px] font-bold text-white shadow-md shadow-[#a29bf4]/25 transition hover:bg-[#8e85ee] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Budget Limit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

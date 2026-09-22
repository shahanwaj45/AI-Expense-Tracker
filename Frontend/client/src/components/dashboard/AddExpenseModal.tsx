import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Zap } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = ["Food", "Travel", "Education", "Entertainment", "Bills", "Health", "Shopping", "Subscription", "Other"];
const PAYMENT_METHODS = ["UPI", "Cash", "Card", "NetBanking", "Other"];

export default function AddExpenseModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);

  const reset = () => {
    setName("");
    setAmount("");
    setCategory("Food");
    setPaymentMethod("UPI");
  };

  const submit = async () => {
    if (!name || !amount) {
      toast.error("Add a name and amount first");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      await api.post("/transactions", {
        name: name.trim(),
        amount: parsedAmount,
        category,
        payment_method: paymentMethod,
        type: "expense",
      });
      toast.success(`${name} added to your expenses`, {
        description: `₹${parsedAmount.toLocaleString("en-IN")} · ${category} · ${paymentMethod}`,
      });
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-[#172532]/25 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="w-full max-w-md rounded-[26px] bg-[#f9fbf8] p-6 shadow-[0_20px_60px_rgba(23,37,50,.2)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex rounded-full bg-[#e7f8ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#3b8165]">
                  Quick entry
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-[-.05em]">
                  Add an expense
                </h3>
                <p className="mt-1 text-[12px] text-[#8b9891]">
                  Capture it now. Keep the bigger picture clear.
                </p>
              </div>
              <button
                onClick={() => { reset(); onClose(); }}
                className="rounded-xl bg-white p-2 text-[#82908a]"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold text-[#76837b]">
                  What did you spend on?
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lunch at Green Bowl"
                  className="h-12 w-full rounded-xl border border-[#e2e9e2] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#b8ecd6]"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold text-[#76837b]">
                  Amount
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8a978f]">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="h-12 w-full rounded-xl border border-[#e2e9e2] bg-white pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#b8ecd6]"
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                  />
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Category selector */}
                <div className="relative">
                  <button
                    onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowPaymentMenu(false); }}
                    className="w-full rounded-xl bg-[#f0f5ef] p-3 text-left"
                  >
                    <p className="text-[10px] text-[#8d9992]">Category</p>
                    <p className="mt-1 text-[12px] font-bold">
                      {category} <ChevronDown size={13} className="ml-1 inline" />
                    </p>
                  </button>
                  {showCategoryMenu && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-44 rounded-xl border border-[#e2e9e2] bg-white shadow-lg">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setCategory(c); setShowCategoryMenu(false); }}
                          className="block w-full px-4 py-2 text-left text-[12px] hover:bg-[#f0f5ef]"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Payment method selector */}
                <div className="relative">
                  <button
                    onClick={() => { setShowPaymentMenu(!showPaymentMenu); setShowCategoryMenu(false); }}
                    className="w-full rounded-xl bg-[#f0f5ef] p-3 text-left"
                  >
                    <p className="text-[10px] text-[#8d9992]">Payment method</p>
                    <p className="mt-1 text-[12px] font-bold">
                      {paymentMethod} <ChevronDown size={13} className="ml-1 inline" />
                    </p>
                  </button>
                  {showPaymentMenu && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-xl border border-[#e2e9e2] bg-white shadow-lg">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m}
                          onClick={() => { setPaymentMethod(m); setShowPaymentMenu(false); }}
                          className="block w-full px-4 py-2 text-left text-[12px] hover:bg-[#f0f5ef]"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={submit}
              disabled={loading}
              className="mt-6 h-12 w-full rounded-xl bg-[#172532] text-[12px] font-bold text-white shadow-lg transition hover:bg-[#294353] active:scale-[.98] disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>Save expense <Zap size={14} className="ml-1 inline text-[#7BE2BE]" /></>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

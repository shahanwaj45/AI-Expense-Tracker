import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { ReceiptIndianRupee, Upload, Camera, FileCheck, Check, X, Loader, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

const CATEGORIES = [
  "Food",
  "Travel",
  "Education",
  "Entertainment",
  "Bills",
  "Health",
  "Shopping",
  "Subscription",
  "Other"
];

export default function ReceiptScanner() {
  const { role } = useAuth();
  const currentRole = role === "professional" ? "professional" : "student";
  const navItems = currentRole === "professional" ? professionalNav : studentNav;

  const [extracted, setExtracted] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("");
  const [useToday, setUseToday] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadRecentScans = async () => {
    try {
      const res = await api.get("/receipts/recent", { params: { limit: 6 } });
      if (res.data?.success && Array.isArray(res.data.data?.items)) {
        setRecentScans(res.data.data.items);
      }
    } catch {
      // Fallback query
      api.get("/transactions", { params: { search: "receipt", limit: 6, sort_by: "created_at" } })
        .then(res => { if (res.data?.success) setRecentScans(res.data.data.items); })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadRecentScans();
  }, []);

  const handleFile = async (file: File) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
    
    if (!isPdf && !isImage) {
      toast.error("Invalid file type. Please upload a PNG, JPG, WEBP, GIF, or PDF document.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum supported size is 10MB.");
      return;
    }

    try {
      setScanning(true);
      setFileName(file.name);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/receipts/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        setExtracted(res.data.data.extracted || {});
        toast.success("Receipt scanned! Please review and confirm the extracted details.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || "Scan failed. Please try again or enter details manually.";
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  const confirmSave = async () => {
    if (!extracted) return;
    const amt = parseFloat(extracted.amount);
    if (!amt || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    try {
      setSaving(true);
      const res = await api.post("/receipts/confirm", {
        name: (extracted.merchant || "Receipt expense").trim(),
        amount: amt,
        category: extracted.category || "Other",
        date: useToday ? undefined : extracted.date || undefined,
        use_today: useToday,
        notes: `Scanned receipt: ${extracted.merchant || "Receipt"}`,
      });

      toast.success("Receipt expense saved into database!");

      // Immediately prepend to recentScans so it appears on screen without delay
      if (res.data?.data) {
        setRecentScans(prev => [res.data.data, ...prev.slice(0, 5)]);
      }

      setExtracted(null);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadRecentScans();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "Failed to save receipt transaction";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const transactionsPath = currentRole === "professional" ? "/professional/expenses" : "/student/expenses";

  return (
    <DashboardLayout role={currentRole} navItems={navItems} pageTitle="Receipt Scanner">
      <FeaturePageHeader
        role={currentRole}
        title="Receipt & Document Scanner"
        description="Upload a photo or PDF document of any receipt. AI extracts the merchant, amount, date, and category automatically."
        icon={ReceiptIndianRupee}
        accentColor="#e98b68"
        accentBg="#fff5ef"
      />

      <div className="rounded-[26px] bg-white p-8 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
        {/* Drop zone */}
        <div
          className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#d5ddd6] bg-[#f9fbf8] p-10 transition hover:border-[#7BE2BE] hover:bg-[#f0f8f3] cursor-pointer"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#fff0eb]">
            {scanning ? <Loader size={28} className="animate-spin text-[#e98b68]" /> : <Camera size={28} className="text-[#e98b68]" />}
          </div>
          <p className="mt-4 font-display text-[18px] font-bold tracking-[-.04em]">
            {scanning ? "Scanning document with AI..." : "Upload or capture receipt / document"}
          </p>
          <p className="mt-2 max-w-sm text-center text-[12px] leading-5 text-[#82908a]">
            Drag and drop your receipt image (PNG, JPG, WEBP) or PDF invoice here, or click to browse.
          </p>
          {!scanning && (
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="flex items-center gap-2 rounded-xl bg-[#172532] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:-translate-y-0.5"
              >
                <Upload size={14} className="text-[#7BE2BE]" /> Choose File / Document
              </button>
            </div>
          )}
          {fileName && !scanning && (
            <p className="mt-3 text-[11px] font-medium text-[#5c8272] flex items-center gap-1.5">
              <FileText size={13} /> {fileName}
            </p>
          )}
        </div>

        {/* Extracted result (Editable form) */}
        {extracted && (
          <div className="mt-6 rounded-[20px] border border-[#d5f0e6] bg-[#f2faf6] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12px] font-bold uppercase tracking-[.1em] text-[#2b7256]">
                Extracted Details (Review & Edit)
              </p>
              <span className="text-[11px] text-[#5c8272] bg-[#e1f5ec] px-2.5 py-1 rounded-full font-medium">
                AI Auto-Detected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#5c8272] mb-1">Merchant / Vendor</label>
                <input
                  type="text"
                  value={extracted.merchant || ""}
                  onChange={(e) => setExtracted({ ...extracted, merchant: e.target.value })}
                  placeholder="e.g. Starbucks, Uber, Amazon"
                  className="w-full rounded-xl border border-[#d2e4db] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c8272] mb-1">Total Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={extracted.amount ?? ""}
                  onChange={(e) => setExtracted({ ...extracted, amount: e.target.value })}
                  placeholder="e.g. 250.00"
                  className="w-full rounded-xl border border-[#d2e4db] bg-white px-3.5 py-2 text-[13px] font-bold text-[#172532] focus:border-[#4caf89] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c8272] mb-1">Receipt Date</label>
                <input
                  type="date"
                  value={extracted.date || ""}
                  disabled={useToday}
                  onChange={(e) => setExtracted({ ...extracted, date: e.target.value })}
                  className="w-full rounded-xl border border-[#d2e4db] bg-white px-3.5 py-2 text-[13px] text-[#172532] focus:border-[#4caf89] focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c8272] mb-1">Category</label>
                <select
                  value={extracted.category || "Other"}
                  onChange={(e) => setExtracted({ ...extracted, category: e.target.value })}
                  className="w-full rounded-xl border border-[#d2e4db] bg-white px-3.5 py-2 text-[13px] font-medium text-[#172532] focus:border-[#4caf89] focus:outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save date option */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="useTodayToggle"
                checked={useToday}
                onChange={(e) => setUseToday(e.target.checked)}
                className="h-4 w-4 rounded border-[#d2e4db] text-[#3b8165] focus:ring-[#7BE2BE]"
              />
              <label htmlFor="useTodayToggle" className="text-[12px] font-medium text-[#5c8272] cursor-pointer">
                Save with today's date so it immediately updates your current month's budget & dashboard
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={confirmSave}
                disabled={saving || !extracted.amount}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#172532] py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#203446] disabled:opacity-50"
              >
                <Check size={15} className="text-[#7BE2BE]" />
                {saving ? "Saving to Database..." : "Confirm & Save into Database"}
              </button>
              <button
                type="button"
                onClick={() => { setExtracted(null); setFileName(""); }}
                className="flex items-center gap-1.5 rounded-xl border border-[#d5ddd6] bg-white px-4 py-2.5 text-[12px] font-bold text-[#627068] hover:bg-[#f6f8f6]"
              >
                <X size={15} /> Discard
              </button>
            </div>
          </div>
        )}

        {/* Recent scans */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[18px] font-bold tracking-[-.04em]">Recent scanned receipts</h3>
            <Link
              to={transactionsPath}
              className="text-[12px] font-bold text-[#3b8165] flex items-center gap-1 hover:underline"
            >
              View in Expenses <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentScans.length > 0 ? recentScans.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-[#f9fbf8] px-4 py-3 border border-[#f0f4f1]">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e7f8ef]">
                    <FileCheck size={16} className="text-[#4caf89]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#172532]">{s.name}</p>
                    <p className="text-[10px] text-[#9ba59f]">{s.date} · {s.category}</p>
                  </div>
                </div>
                <p className="text-[12px] font-bold text-[#df7f64]">
                  {s.amount}
                </p>
              </div>
            )) : (
              <p className="text-[12px] text-[#9ba59f]">No scanned receipts yet in database.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

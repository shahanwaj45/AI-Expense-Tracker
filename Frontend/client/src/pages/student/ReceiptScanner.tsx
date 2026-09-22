import { useEffect, useState, useRef } from "react";
import { ReceiptIndianRupee, Upload, Camera, FileCheck, Check, X, Loader } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import api from "@/lib/api";

export default function ReceiptScanner() {
  const [extracted, setExtracted] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load recent scanned transactions
  useEffect(() => {
    api.get("/transactions", { params: { search: "receipt", limit: 5 } })
      .then(res => { if (res.data.success) setRecentScans(res.data.data.items.slice(0, 3)); })
      .catch(() => {});
  }, []);

  const handleFile = async (file: File) => {
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type. Please upload PNG, JPG, GIF, WEBP, or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum 10MB.");
      return;
    }

    try {
      setScanning(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/receipts/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setExtracted(res.data.data.extracted);
        toast.success("Receipt scanned! Review the extracted details.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "Scan failed. Please try again or enter manually.";
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  const confirmSave = async () => {
    if (!extracted) return;
    try {
      setSaving(true);
      await api.post("/receipts/confirm", {
        name: extracted.merchant || "Receipt",
        amount: extracted.amount,
        category: extracted.category || "Other",
        date: extracted.date,
      });
      toast.success("Receipt expense saved!");
      setExtracted(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refresh recent scans
      const res = await api.get("/transactions", { params: { limit: 3 } });
      if (res.data.success) setRecentScans(res.data.data.items.slice(0, 3));
    } catch {
      toast.error("Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <DashboardLayout role="student" navItems={studentNav} pageTitle="Receipt Scanner">
      <FeaturePageHeader
        role="student"
        title="Receipt Scanner"
        description="Snap a photo of any receipt and let AI extract and categorise the expense automatically. No manual entry needed."
        icon={ReceiptIndianRupee}
        accentColor="#e98b68"
        accentBg="#fff5ef"
      />

      <div className="rounded-[26px] bg-white p-8 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
        {/* Drop zone */}
        <div
          className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#d5ddd6] bg-[#f9fbf8] p-12 transition hover:border-[#7BE2BE] hover:bg-[#f0f8f3] cursor-pointer"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#fff0eb]">
            {scanning ? <Loader size={28} className="animate-spin text-[#e98b68]" /> : <Camera size={28} className="text-[#e98b68]" />}
          </div>
          <p className="mt-5 font-display text-[18px] font-bold tracking-[-.04em]">
            {scanning ? "Scanning receipt..." : "Upload or capture a receipt"}
          </p>
          <p className="mt-2 max-w-xs text-center text-[12px] leading-5 text-[#82908a]">
            Drag and drop an image here, or click to browse files.
          </p>
          {!scanning && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="flex items-center gap-2 rounded-xl bg-[#172532] px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:-translate-y-0.5"
              >
                <Camera size={15} className="text-[#7BE2BE]" /> Take / Upload Photo
              </button>
            </div>
          )}
        </div>

        {/* Extracted result */}
        {extracted && (
          <div className="mt-6 rounded-[20px] border border-[#d5f0e6] bg-[#eafaf3] p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[.12em] text-[#3b8165]">Extracted from Receipt</p>
            <div className="space-y-2">
              {[
                { label: "Merchant", value: extracted.merchant ?? "—" },
                { label: "Amount", value: extracted.amount != null ? `₹${extracted.amount}` : "Not detected" },
                { label: "Date", value: extracted.date ?? "—" },
                { label: "Category", value: extracted.category ?? "Other" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-[#5c8272]">{label}</span>
                  <span className="text-[12px] font-bold text-[#172532]">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={confirmSave}
                disabled={saving || !extracted.amount}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#172532] py-2.5 text-[12px] font-bold text-white disabled:opacity-60"
              >
                <Check size={14} className="text-[#7BE2BE]" />
                {saving ? "Saving..." : "Confirm & Save"}
              </button>
              <button onClick={() => setExtracted(null)} className="flex items-center gap-1 rounded-xl bg-white px-4 py-2.5 text-[12px] font-bold text-[#8b9891]">
                <X size={14} /> Discard
              </button>
            </div>
          </div>
        )}

        {/* Recent scans */}
        <div className="mt-8">
          <h3 className="font-display text-[18px] font-bold tracking-[-.04em]">Recent scans</h3>
          <div className="mt-4 space-y-3">
            {recentScans.length > 0 ? recentScans.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-[#f9fbf8] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#e7f8ef]">
                    <FileCheck size={16} className="text-[#4caf89]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold">{s.name}</p>
                    <p className="text-[10px] text-[#9ba59f]">{s.date} · {s.category}</p>
                  </div>
                </div>
                <p className="text-[12px] font-bold text-[#df7f64]">{s.amount}</p>
              </div>
            )) : (
              <p className="text-[12px] text-[#9ba59f]">No scanned receipts yet.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

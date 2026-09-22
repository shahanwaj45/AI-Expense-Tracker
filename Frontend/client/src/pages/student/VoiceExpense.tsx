import { useState, useRef } from "react";
import { Mic, MicOff, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import api from "@/lib/api";

type ParsedExpense = { name?: string; amount?: number | null; category?: string; payment_method?: string };

export default function VoiceExpense() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ParsedExpense | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      await parseText(text);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast.error(`Voice error: ${event.error}. Please try again.`);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    toast.info("Listening... Say something like: 'Spent 250 on lunch at Green Bowl'");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const parseText = async (text: string) => {
    try {
      setProcessing(true);
      const res = await api.post("/voice/parse", { text });
      if (res.data.success) {
        setParsed(res.data.data.parsed);
        toast.success("Expense parsed! Review and confirm.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "Parsing failed. Please try again.";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const confirmSave = async () => {
    if (!parsed || !parsed.amount) {
      toast.error("Please ensure an amount was detected.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/voice/confirm", { ...parsed, original_text: transcript });
      toast.success("Expense saved!", { description: `${parsed.name} · ₹${parsed.amount}` });
      setParsed(null);
      setTranscript("");
    } catch (err) {
      toast.error("Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const toggleListening = () => isListening ? stopListening() : startListening();

  return (
    <DashboardLayout role="student" navItems={studentNav} pageTitle="Voice Expense">
      <FeaturePageHeader
        role="student"
        title="Voice Expense"
        description="Add expenses hands-free with voice commands. Just say what you spent on and let AI do the rest."
        icon={Mic}
        accentColor="#a9dced"
        accentBg="#e7f7fa"
      />

      <div className="rounded-[26px] bg-white p-8 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
        <div className="flex flex-col items-center py-8">
          {/* Mic button */}
          <button
            onClick={toggleListening}
            disabled={processing}
            className={`grid h-24 w-24 place-items-center rounded-full transition-all duration-300 disabled:opacity-60 ${
              isListening
                ? "bg-[#172532] shadow-[0_0_0_12px_rgba(123,226,190,.2),0_0_0_24px_rgba(123,226,190,.1)] scale-110"
                : "bg-[#f5f8f4] shadow-[6px_9px_23px_rgba(42,65,55,.08)] hover:scale-105"
            }`}
          >
            {isListening ? (
              <MicOff size={32} className="text-[#7BE2BE]" />
            ) : (
              <Mic size={32} className="text-[#728079]" />
            )}
          </button>

          <p className="mt-6 font-display text-[20px] font-bold tracking-[-.04em]">
            {processing ? "Processing..." : isListening ? "Listening..." : "Tap to speak"}
          </p>
          <p className="mt-2 max-w-xs text-center text-[12px] leading-5 text-[#82908a]">
            {isListening
              ? "Speak naturally — \"Spent two hundred fifty on lunch at Green Bowl\""
              : "Say what you spent on, the amount, and optionally the category."}
          </p>

          {/* Transcript */}
          {transcript && (
            <div className="mt-6 w-full max-w-md rounded-xl bg-[#f0f5ef] px-4 py-3">
              <p className="text-[11px] font-bold uppercase text-[#7a9285]">Heard</p>
              <p className="mt-1 text-[13px] italic text-[#172532]">"{transcript}"</p>
            </div>
          )}

          {/* Parsed result with confirmation */}
          {parsed && (
            <div className="mt-5 w-full max-w-md rounded-[20px] border border-[#d5f0e6] bg-[#eafaf3] p-5">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.12em] text-[#3b8165]">AI Extracted</p>
              <div className="space-y-2">
                {[
                  { label: "Name", value: parsed.name ?? "—" },
                  { label: "Amount", value: parsed.amount != null ? `₹${parsed.amount}` : "Not detected" },
                  { label: "Category", value: parsed.category ?? "Other" },
                  { label: "Payment", value: parsed.payment_method ?? "UPI" },
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
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#172532] py-2.5 text-[12px] font-bold text-white disabled:opacity-60"
                >
                  <Check size={14} className="text-[#7BE2BE]" />
                  {saving ? "Saving..." : "Confirm & Save"}
                </button>
                <button
                  onClick={() => { setParsed(null); setTranscript(""); }}
                  className="flex items-center justify-center gap-1 rounded-xl bg-white px-4 py-2.5 text-[12px] font-bold text-[#8b9891]"
                >
                  <X size={14} /> Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

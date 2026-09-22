import { useEffect, useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FeaturePageHeader from "@/components/dashboard/FeaturePageHeader";
import { studentNav } from "@/data/studentData";
import { professionalNav } from "@/data/professionalData";
import api from "@/lib/api";

interface ReportItem {
  id?: string;
  name: string;
  type: string;
  date: string;
  month?: number;
  year?: number;
}

const defaultReports: ReportItem[] = [
  { name: "Monthly Summary — August 2026", type: "PDF", date: "Generated today" },
  { name: "Category Breakdown — July 2026", type: "PDF", date: "1 Aug 2026" },
  { name: "Semester Overview — H1 2026", type: "PDF", date: "30 Jun 2026" },
];

export default function Reports() {
  const { role } = useAuth();
  const isStudent = role === "student";

  const [availableReports, setAvailableReports] = useState<ReportItem[]>(defaultReports);
  const [downloadingName, setDownloadingName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get("/reports/list")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setAvailableReports(res.data.data);
        }
      })
      .catch(() => {
        // Keep default list on error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownload = async (report: ReportItem) => {
    setDownloadingName(report.name);
    try {
      const response = await api.get("/reports/download", {
        params: {
          name: report.name,
          month: report.month,
          year: report.year,
        },
        responseType: "blob",
      });

      // Extract filename from response headers if present, else synthesize
      let filename = `${report.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      const disposition = response.headers["content-disposition"];
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Create browser blob download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Report downloaded: ${filename}`);
    } catch (err: any) {
      console.error("PDF download failed:", err);
      toast.error("Failed to generate and download PDF report. Please try again.");
    } finally {
      setDownloadingName(null);
    }
  };

  return (
    <DashboardLayout
      role={role!}
      navItems={isStudent ? studentNav : professionalNav}
      pageTitle="Reports"
    >
      <FeaturePageHeader
        role={role!}
        title="Reports"
        description="Generate and download detailed financial reports. Share insights with yourself or your financial advisor."
        icon={FileText}
        accentColor="#738ce2"
        accentBg="#eaf0ff"
      />

      <div className="rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)]">
        <h3 className="font-display text-[21px] font-bold tracking-[-.05em]">Available reports</h3>
        <p className="mt-1 text-[12px] text-[#82908a]">
          Download official statements formatted with ReportLab.
        </p>

        <div className="mt-5 space-y-3">
          {availableReports.map((r) => {
            const isDownloading = downloadingName === r.name;
            return (
              <div
                key={r.name}
                className="flex items-center justify-between rounded-xl bg-[#f9fbf8] px-4 py-4 border border-[#edf2ed]"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf0ff]">
                    <FileText size={17} className="text-[#738ce2]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#172532]">{r.name}</p>
                    <p className="text-[11px] text-[#9ba59f]">
                      {r.type} · {r.date}
                    </p>
                  </div>
                </div>
                <button
                  disabled={isDownloading}
                  onClick={() => handleDownload(r)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#f5f8f4] px-3.5 py-2 text-[11px] font-bold text-[#718078] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#e2e8e2] transition disabled:opacity-60"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-[#738ce2]" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      Download
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Soft Signal style: warm paper surface, ink typography, signal mint details, calm money-coach voice.
import { Link } from "wouter";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import Logo from "@/components/Logo";

export default function NotFound() {
  const { isAuthenticated, role } = useAuth();
  const homePath = isAuthenticated && role ? `/${role}` : "/";

  return (
    <main className="min-h-screen bg-[#f5f7f3] px-5 py-8 text-[#172532] sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href={homePath} className="flex items-center gap-3">
          <Logo size="md" />
        </Link>
        <span className="hidden text-[10px] font-bold uppercase tracking-[.15em] text-[#98a49d] sm:block">A calmer way to stay ahead</span>
      </div>
      <section className="mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[32px] border border-[#e1e9e1] bg-white p-8 text-center shadow-[12px_18px_45px_rgba(42,65,55,.08)] sm:p-14">
          <div className="absolute left-1/2 top-0 h-1 w-28 -translate-x-1/2 rounded-b-full bg-[#7BE2BE]" />
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#e7f8ef] text-[#4caf89]"><SearchX size={28} strokeWidth={1.8} /></div>
          <p className="mt-7 text-[11px] font-bold uppercase tracking-[.18em] text-[#99a69f]">Signal lost</p>
          <h1 className="mt-2 font-display text-[52px] font-bold tracking-[-.08em] sm:text-[72px]">404</h1>
          <h2 className="font-display text-2xl font-bold tracking-[-.05em] sm:text-3xl">This page took a different route.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#82908a]">No worries — your money view is still right where you left it. Head back to the dashboard and keep the month moving comfortably.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={homePath} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#172532] px-5 text-[12px] font-bold text-white shadow-[5px_7px_16px_rgba(23,37,50,.14)] transition hover:-translate-y-0.5"><Home size={16} className="text-[#7BE2BE]" /> {isAuthenticated ? "Back to dashboard" : "Back to home"}</Link>
            <button onClick={() => window.history.back()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#f1f6f1] px-5 text-[12px] font-bold text-[#63736a] transition hover:-translate-y-0.5"><ArrowLeft size={16} /> Go back</button>
          </div>
        </div>
      </section>
    </main>
  );
}

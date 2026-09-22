import { useMemo, useState } from "react";
import { CircleDollarSign, Filter } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
  externalQuery?: string;
}

const colorMap: Record<string, string> = {
  coral: "bg-[#fff0eb] text-[#e68c6c]",
  cyan: "bg-[#e7f7fa] text-[#55a9bc]",
  blue: "bg-[#eaf0ff] text-[#738ce2]",
  pink: "bg-[#ffeaf1] text-[#de759b]",
  mint: "bg-[#e7f8ef] text-[#41aa7e]",
  violet: "bg-[#f0edff] text-[#7c6dc7]",
};

export default function TransactionList({ transactions, externalQuery }: Props) {
  const [query, setQuery] = useState("");
  const activeQuery = externalQuery ?? query;

  const safeTxns = transactions ?? [];
  const filtered = useMemo(
    () =>
      safeTxns.filter(
        (t) =>
          t.name.toLowerCase().includes(activeQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(activeQuery.toLowerCase()),
      ),
    [safeTxns, activeQuery],
  );

  return (
    <section className="mt-5 rounded-[26px] bg-white p-6 shadow-[6px_9px_23px_rgba(42,65,55,.07)] sm:p-7">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-[#9aa69f]">
            Latest activity
          </p>
          <h3 className="mt-1 font-display text-[21px] font-bold tracking-[-.05em]">
            Recent transactions
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setQuery("")}
            className="flex items-center gap-2 rounded-xl bg-[#f5f8f4] px-3 py-2 text-[11px] font-bold text-[#718078]"
          >
            <Filter size={14} /> Filter
          </button>
          <button
            onClick={() => toast.info("All transactions opened")}
            className="rounded-xl px-3 py-2 text-[11px] font-bold text-[#4a9b78]"
          >
            View all
          </button>
        </div>
      </div>
      <div className="divide-y divide-[#eef1ed]">
        {filtered.length ? (
          filtered.map((item) => (
            <div
              key={item.name}
              className="group flex items-center justify-between gap-4 py-4 first:pt-1"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                    colorMap[item.color] ?? colorMap.coral
                  }`}
                >
                  <CircleDollarSign size={17} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">{item.name}</p>
                  <p className="mt-1 text-[11px] text-[#9ba59f]">
                    {item.category} · {item.date}
                  </p>
                </div>
              </div>
              <p
                className={`shrink-0 text-[13px] font-bold ${
                  item.amount.startsWith("+") ? "text-[#41aa7e]" : "text-[#df7f64]"
                }`}
              >
                {item.amount}
              </p>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-sm text-[#8c9891]">
            No transactions match "{activeQuery}".
          </div>
        )}
      </div>
    </section>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt, ChevronRight } from "lucide-react";
import api from "../services/api";
import type { Expense, TxnDetail } from "../types";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";
import CategoryIcon from "../components/CategoryIcon";
import TransactionDrawer from "../components/TransactionDrawer";
import { PageHeader } from "./ExpensesPage";

type Period = "daily" | "weekly" | "monthly" | "annual";
const PERIODS: Period[] = ["daily", "weekly", "monthly", "annual"];

export default function ReportsPage() {
  const { user } = useAuth();
  const cur = user?.currency;
  const [period, setPeriod] = useState<Period>("monthly");
  const [selected, setSelected] = useState<TxnDetail | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["report-expenses", period],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case "daily": startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
        case "weekly": startDate = new Date(now.getTime() - 7 * 864e5); break;
        case "annual": startDate = new Date(now.getFullYear(), 0, 1); break;
        default: startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const res = await api.get("/expenses", { params: { startDate: startDate.toISOString(), endDate: now.toISOString() } });
      return res.data.data as Expense[];
    },
  });

  const total = data?.reduce((s, e) => s + Number(e.amount), 0) || 0;
  const byCategory = data?.reduce<Record<string, { total: number; icon?: string; color?: string }>>((acc, e) => {
    const name = e.category?.name || "Unknown";
    acc[name] = acc[name] || { total: 0, icon: e.category?.icon, color: e.category?.color };
    acc[name].total += Number(e.amount);
    return acc;
  }, {});
  const sortedCats = byCategory ? Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total) : [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Reports" subtitle="Spending summarized over time." />

      <div className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto">
        <div className="neu-inset inline-flex shrink-0 gap-1.5 rounded-full p-1.5" style={{ ["--neu-d" as string]: "3px" }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold capitalize transition-all ${period === p ? "btn-brand" : "text-muted hover:text-ink"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2"><div className="h-40 animate-pulse rounded-xl bg-base-2" /><div className="h-40 animate-pulse rounded-xl bg-base-2" /></div>
      ) : !data || data.length === 0 ? (
        <div className="neu-raised flex flex-col items-center gap-3 rounded-xl py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand"><Receipt size={26} /></span>
          <p className="text-muted">No expenses recorded for this period.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div
            className="rounded-xl p-7 text-white"
            style={{ background: "linear-gradient(140deg, var(--color-brand), var(--color-brand-strong))", boxShadow: "8px 8px 22px oklch(0.56 0.205 285 / 0.35)" }}
          >
            <p className="text-sm capitalize text-white/75">{period} total expenses</p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums sm:text-4xl">{money(total, cur)}</p>
            <p className="mt-1 text-sm text-white/70">{data.length} transaction{data.length !== 1 && "s"}</p>
          </div>

          <section className="neu-raised rounded-xl p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Spending by Category</h2>
            <div className="space-y-3">
              {sortedCats.map(([name, info]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: info.color || "var(--color-brand)" }}>
                    <CategoryIcon name={info.icon} size={16} />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-ink">{name}</span>
                  <div className="hidden h-2 w-24 overflow-hidden rounded-full neu-inset sm:block" style={{ ["--neu-d" as string]: "1px" }}>
                    <div className="h-full rounded-full" style={{ width: `${(info.total / total) * 100}%`, background: "var(--color-brand)" }} />
                  </div>
                  <span className="w-24 text-right text-sm font-bold text-ink">{money(info.total, cur)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="neu-raised rounded-xl p-6 lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-ink">Transactions</h2>
            <div className="space-y-1.5">
              {data.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setSelected({
                    id: exp.id, type: "expense", amount: Number(exp.amount), categoryId: exp.categoryId,
                    category: exp.category ? { name: exp.category.name, icon: exp.category.icon, color: exp.category.color } : undefined,
                    description: exp.description, date: exp.date, createdAt: exp.createdAt,
                  })}
                  className="group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-base-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: exp.category?.color || "var(--color-brand)" }}>
                      <CategoryIcon name={exp.category?.icon} size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{exp.category?.name}</p>
                      <p className="truncate text-xs text-muted">{exp.description || "—"} · {new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap font-bold text-expense">-{money(exp.amount, cur)}</span>
                    <ChevronRight size={16} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <TransactionDrawer txn={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

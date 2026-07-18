import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Wallet, TrendingDown, PiggyBank, Scale, ArrowUpRight,
  ArrowDownRight, Plus, ArrowRight, ChevronRight,
} from "lucide-react";
import api from "../services/api";
import type { DashboardData, TxnDetail } from "../types";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";
import TransactionDrawer from "../components/TransactionDrawer";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const cur = user?.currency;
  const [selected, setSelected] = useState<TxnDetail | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard");
      return res.data.data as DashboardData;
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  const d = data!;

  const stats = [
    { label: "Total Income", value: d.totalIncome, icon: Wallet, tone: "brand" as const },
    { label: "Total Expenses", value: d.totalExpenses, icon: TrendingDown, tone: "expense" as const },
    { label: "Remaining Balance", value: d.remainingBalance, icon: Scale, tone: "plain" as const },
    { label: "Savings", value: d.savings, icon: PiggyBank, tone: "plain" as const },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
            {greeting()}, {user?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted sm:text-base">Here's an overview of your financial health.</p>
        </div>
        <Link to="/expenses" className="btn-brand flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
          <Plus size={17} /> New Transaction
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} cur={cur} />
        ))}
      </div>

      {/* Body */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Budget status */}
        <section className="neu-raised rounded-xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Budget Status</h2>
            <Link to="/budget" className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              Manage <ArrowRight size={15} />
            </Link>
          </div>
          {d.budgetStatus.length === 0 ? (
            <EmptyHint
              text="No budgets yet. Set a limit per category and PanTrack will warn you before you overspend."
              cta="Create a budget"
              to="/budget"
            />
          ) : (
            <div className="space-y-5">
              {d.budgetStatus.map((b, i) => {
                const over = b.percentageUsed >= 100;
                const warn = b.percentageUsed >= 80 && !over;
                const color = over ? "var(--color-expense)" : warn ? "var(--color-warning)" : "var(--color-brand)";
                return (
                  <div key={i}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-semibold text-ink">{b.category}</span>
                      <span className="font-medium text-muted">
                        {money(b.spent, cur)} / {money(b.limit, cur)}
                      </span>
                    </div>
                    <div className="neu-inset h-3 overflow-hidden rounded-full" style={{ ["--neu-d" as string]: "2px" }}>
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${Math.min(b.percentageUsed, 100)}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent transactions */}
        <section className="neu-raised rounded-xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Recent Transactions</h2>
            <div className="flex gap-2 text-sm font-semibold">
              <Link to="/income" className="text-brand hover:underline">+ Income</Link>
              <Link to="/expenses" className="text-brand hover:underline">+ Expense</Link>
            </div>
          </div>
          {d.recentTransactions.length === 0 ? (
            <EmptyHint text="No transactions yet. Add your first income or expense to see it here." cta="Add income" to="/income" />
          ) : (
            <div className="space-y-1.5">
              {d.recentTransactions.map((t) => {
                const income = t.type === "income";
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-base-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-lg ${income ? "bg-income-soft text-income" : "bg-expense-soft text-expense"}`}
                      >
                        {income ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{t.category.name}</p>
                        <p className="text-xs text-muted">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`whitespace-nowrap text-sm font-bold ${income ? "text-income" : "text-expense"}`}>
                        {income ? "+" : "-"}{money(t.amount, cur)}
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <TransactionDrawer txn={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, tone, cur,
}: {
  label: string;
  value: number;
  icon: typeof Wallet;
  tone: "brand" | "expense" | "plain";
  cur?: string;
}) {
  if (tone === "brand") {
    return (
      <div
        className="rounded-xl p-5 text-white transition-transform duration-300 hover:-translate-y-1"
        style={{
          background: "linear-gradient(140deg, var(--color-brand), var(--color-brand-strong))",
          boxShadow: "6px 6px 18px oklch(0.56 0.205 285 / 0.3), -5px -5px 14px var(--neu-light)",
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="grid size-10 place-items-center rounded-lg bg-white/20"><Icon size={20} /></span>
          <ArrowUpRight size={18} className="opacity-80" />
        </div>
        <p className="text-sm text-white/75">{label}</p>
        <p className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">{money(value, cur)}</p>
      </div>
    );
  }
  const accent = tone === "expense" ? "text-expense" : "text-brand";
  const accentBg = tone === "expense" ? "bg-expense-soft" : "bg-brand-tint";
  return (
    <div className="neu-raised neu-card rounded-xl p-5">
      <div className="mb-6 flex items-center justify-between">
        <span className={`grid size-10 place-items-center rounded-lg ${accentBg} ${accent}`}><Icon size={20} /></span>
      </div>
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-xl font-extrabold tabular-nums sm:text-2xl ${tone === "expense" ? "text-expense" : "text-ink"}`}>
        {money(value, cur)}
      </p>
    </div>
  );
}

function EmptyHint({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <p className="max-w-xs text-sm text-muted">{text}</p>
      <Link to={to} className="neu-btn rounded-full px-5 py-2.5 text-sm font-bold text-brand">{cta}</Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="mb-8 h-10 w-64 rounded-lg bg-base-2" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-base-2" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-72 rounded-xl bg-base-2" />
        <div className="h-72 rounded-xl bg-base-2" />
      </div>
    </div>
  );
}

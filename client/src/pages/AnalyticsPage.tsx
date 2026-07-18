import { useQuery } from "@tanstack/react-query";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import type { AnalyticsData } from "../types";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";
import { PageHeader } from "./ExpensesPage";

const AXIS = { fontSize: 12, fill: "oklch(0.56 0.028 285)" };

/** Compact axis labels: 150000 → 150k, 2_400_000 → 2.4M */
const abbr = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
};

function ChartTip({ active, payload, label, cur }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="neu-raised rounded-lg px-3 py-2 text-xs" style={{ ["--neu-d" as string]: "4px" }}>
      {label && <p className="mb-1 font-bold text-ink">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color || p.payload?.color }}>
          {p.name}: {money(p.value, cur)}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const cur = user?.currency;
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/analytics")).data.data as AnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Analytics" subtitle="The story your money tells." />
        <div className="grid gap-6 lg:grid-cols-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-xl bg-base-2" />)}</div>
      </div>
    );
  }
  const d = data!;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Analytics" subtitle="The story your money tells." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Expenses by Category">
          {d.expensePieChart.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={d.expensePieChart} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={64} outerRadius={104} paddingAngle={3} stroke="none">
                  {d.expensePieChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<ChartTip cur={cur} />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {d.expensePieChart.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {d.expensePieChart.map((e) => (
                <span key={e.category} className="flex items-center gap-2 text-sm text-ink-2">
                  <span className="size-3 rounded-full" style={{ background: e.color }} />
                  {e.category}
                </span>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Income vs Expenses">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ name: "This period", Income: d.incomeVsExpense.income, Expenses: d.incomeVsExpense.expense }]} barGap={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 285)" vertical={false} />
              <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} tickFormatter={abbr} />
              <Tooltip cursor={{ fill: "oklch(0.9 0.02 285 / 0.4)" }} content={<ChartTip cur={cur} />} />
              <Bar dataKey="Income" fill="var(--color-income)" radius={[8, 8, 0, 0]} maxBarSize={72} />
              <Bar dataKey="Expenses" fill="var(--color-expense)" radius={[8, 8, 0, 0]} maxBarSize={72} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <div className="lg:col-span-2">
          <Panel title="Monthly Trend">
            {d.monthlyTrend.length === 0 ? <NoData /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={d.monthlyTrend} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 285)" vertical={false} />
                  <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} tickFormatter={abbr} />
                  <Tooltip cursor={{ fill: "oklch(0.9 0.02 285 / 0.4)" }} content={<ChartTip cur={cur} />} />
                  <Bar dataKey="income" name="Income" fill="var(--color-income)" radius={[6, 6, 0, 0]} maxBarSize={26} />
                  <Bar dataKey="expense" name="Expenses" fill="var(--color-brand)" radius={[6, 6, 0, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="neu-raised rounded-xl p-6">
      <h2 className="mb-5 text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function NoData() {
  return <div className="grid h-[300px] place-items-center text-muted">No data for this period yet.</div>;
}

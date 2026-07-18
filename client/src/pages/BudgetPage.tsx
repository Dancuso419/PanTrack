import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import type { Budget, Category } from "../types";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";
import CategoryIcon from "../components/CategoryIcon";
import Select from "../components/Select";
import { PageHeader } from "./ExpensesPage";

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const cur = user?.currency;
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => (await api.get("/budget")).data.data as Budget[],
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.data as Category[],
  });

  const createMutation = useMutation({
    mutationFn: (body: { categoryId: string; amount: number; month: number; year: number }) => api.post("/budget", body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["budgets"] }); setCategoryId(""); setAmount(""); setShowForm(false); },
    onError: (err: any) => alert(err.response?.data?.message || "Could not create budget"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/budget/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ categoryId, amount: parseFloat(amount), month, year });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Budget"
        subtitle="Set limits per category. We'll warn you before you overspend."
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn-brand flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
            {showForm ? <><X size={17} /> Cancel</> : <><Plus size={17} /> New Budget</>}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="neu-raised mb-6 grid gap-4 rounded-xl p-6 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-2">Category</span>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-2">Limit</span>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="field w-full rounded-xl px-4 py-3 text-sm" placeholder="0.00" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-2">Month</span>
            <Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>)}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-2">Year</span>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="field w-full rounded-xl px-4 py-3 text-sm" />
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" disabled={createMutation.isPending} className="btn-brand rounded-full px-7 py-3 text-sm font-bold disabled:opacity-60">
              {createMutation.isPending ? "Creating…" : "Create budget"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-base-2" />)}</div>
      ) : !budgets || budgets.length === 0 ? (
        <div className="neu-raised rounded-xl py-16 text-center">
          <p className="text-muted">No budgets yet. Create one above to start getting overspend alerts.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map((b) => {
            const pct = b.percentage || 0;
            const over = b.status === "exceeded";
            const warn = b.status === "warning";
            const color = over ? "var(--color-expense)" : warn ? "var(--color-warning)" : "var(--color-brand)";
            return (
              <div key={b.id} className="neu-raised neu-card rounded-xl p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-lg text-white" style={{ background: b.category?.color || "var(--color-brand)" }}>
                      <CategoryIcon name={b.category?.icon} size={18} />
                    </span>
                    <div>
                      <p className="font-bold text-ink">{b.category?.name}</p>
                      <p className="text-xs text-muted">{new Date(b.year, b.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(b.id)} className="grid size-9 place-items-center rounded-md text-muted hover:bg-base-2 hover:text-expense" aria-label="Delete"><Trash2 size={16} /></button>
                </div>

                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-ink">{money(b.spent || 0, cur)}</span>
                  <span className="text-sm font-medium text-muted">of {money(b.amount, cur)}</span>
                </div>

                <div className="neu-inset h-3 overflow-hidden rounded-full" style={{ ["--neu-d" as string]: "2px" }}>
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                </div>

                <p className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
                  {over ? <AlertTriangle size={15} /> : warn ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                  {pct}% used{over ? " — over budget!" : warn ? " — approaching limit" : " — on track"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

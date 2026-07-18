import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, AlertTriangle, X, ChevronRight } from "lucide-react";
import api from "../services/api";
import type { Expense, Income, Category, TxnDetail } from "../types";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";
import CategoryIcon from "../components/CategoryIcon";
import Select from "../components/Select";
import TransactionDrawer from "../components/TransactionDrawer";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const cur = user?.currency;
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterCat, setFilterCat] = useState("");
  const [warning, setWarning] = useState<{ severity: string; message: string } | null>(null);
  const [selected, setSelected] = useState<TxnDetail | null>(null);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", filterCat],
    queryFn: async () => {
      const params = filterCat ? { categoryId: filterCat } : {};
      const res = await api.get("/expenses", { params });
      return res.data.data as Expense[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.data as Category[],
  });

  const saveMutation = useMutation({
    mutationFn: async (body: { amount: number; categoryId: string; description?: string; date: string }) =>
      api.post("/expenses", body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      if (res.data.data.budgetWarning) setWarning(res.data.data.budgetWarning);
      else { setWarning(null); resetForm(); }
    },
  });

  function resetForm() {
    setAmount(""); setCategoryId(""); setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setShowForm(false); setWarning(null);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({ amount: parseFloat(amount), categoryId, description: description || undefined, date });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Expenses"
        subtitle="Every outgoing, categorized and searchable."
        action={
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-brand flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
            {showForm ? <><X size={17} /> Cancel</> : <><Plus size={17} /> Add Expense</>}
          </button>
        }
      />

      {warning && (
        <div className={`mb-6 flex items-start gap-3 rounded-xl px-4 py-4 text-sm font-medium ${warning.severity === "exceeded" ? "bg-expense-soft text-expense" : "bg-warning-soft text-warning"}`}>
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{warning.message} <span className="opacity-70">The expense was still saved.</span></div>
          <button onClick={resetForm} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {showForm && (
        <TxnForm
          type="expense"
          amount={amount} setAmount={setAmount}
          categoryId={categoryId} setCategoryId={setCategoryId}
          description={description} setDescription={setDescription}
          date={date} setDate={setDate}
          categories={categories} onSubmit={handleSubmit}
          pending={saveMutation.isPending}
        />
      )}

      <TxnTable
        rows={expenses} isLoading={isLoading} cur={cur} tone="expense"
        categories={categories} filterCat={filterCat} setFilterCat={setFilterCat}
        onSelect={setSelected}
        emptyText="No expenses yet. Add your first one to start tracking."
      />

      <TransactionDrawer txn={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

/* ---------- Shared building blocks (used by Income too) ---------- */

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function TxnForm({
  type, amount, setAmount, categoryId, setCategoryId, description, setDescription,
  date, setDate, categories, onSubmit, pending,
}: {
  type: "income" | "expense";
  amount: string; setAmount: (v: string) => void;
  categoryId: string; setCategoryId: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  date: string; setDate: (v: string) => void;
  categories?: Category[];
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="neu-raised mb-6 grid gap-4 rounded-xl p-6 sm:grid-cols-2">
      <FormField label="Amount">
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="field w-full rounded-xl px-4 py-3 text-sm" placeholder="0.00" />
      </FormField>
      <FormField label="Category">
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Select category</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </FormField>
      <FormField label="Description">
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="field w-full rounded-xl px-4 py-3 text-sm" placeholder="Optional note" />
      </FormField>
      <FormField label="Date">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="field w-full rounded-xl px-4 py-3 text-sm" />
      </FormField>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-brand rounded-full px-7 py-3 text-sm font-bold disabled:opacity-60">
          {pending ? "Saving…" : `Save ${type}`}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}

/** Maps an Income/Expense row to the drawer's normalized detail shape. */
function toDetail(r: Expense | Income, type: "income" | "expense"): TxnDetail {
  return {
    id: r.id,
    type,
    amount: Number(r.amount),
    categoryId: r.categoryId,
    category: r.category ? { name: r.category.name, icon: r.category.icon, color: r.category.color } : undefined,
    description: r.description,
    date: r.date,
    createdAt: r.createdAt,
  };
}

export function TxnTable({
  rows, isLoading, cur, tone, categories, filterCat, setFilterCat, onSelect, emptyText,
}: {
  rows?: Expense[] | Income[];
  isLoading: boolean;
  cur?: string;
  tone: "income" | "expense";
  categories?: Category[];
  filterCat: string; setFilterCat: (v: string) => void;
  onSelect: (t: TxnDetail) => void;
  emptyText: string;
}) {
  const accent = tone === "income" ? "text-income" : "text-expense";
  const sign = tone === "income" ? "+" : "-";
  return (
    <div className="neu-raised rounded-xl p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">History</h2>
        <Select pill value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="min-w-[10rem]">
          <option value="">All categories</option>
          {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-base-2" />)}</div>
      ) : !rows || rows.length === 0 ? (
        <p className="py-10 text-center text-muted">{emptyText}</p>
      ) : (
        <div className="space-y-1.5">
          {(rows as (Expense | Income)[]).map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(toDetail(r, tone))}
              className="group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-3 text-left transition-colors hover:bg-base-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand">
                  <CategoryIcon name={r.category?.icon} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{r.category?.name}</p>
                  <p className="truncate text-xs text-muted">
                    {r.description || "—"} · {new Date(r.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`whitespace-nowrap font-bold ${accent}`}>{sign}{money(r.amount, cur)}</span>
                <ChevronRight size={16} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

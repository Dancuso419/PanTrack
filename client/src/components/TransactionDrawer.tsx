import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Calendar, Clock, Tag, AlertTriangle,
} from "lucide-react";
import api from "../services/api";
import type { TxnDetail, Category } from "../types";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";
import CategoryIcon from "./CategoryIcon";
import Select from "./Select";

const INVALIDATE = ["dashboard", "expenses", "incomes", "budgets", "analytics", "report-expenses"];

export default function TransactionDrawer({ txn, onClose }: { txn: TxnDetail | null; onClose: () => void }) {
  const { user } = useAuth();
  const cur = user?.currency;
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [closing, setClosing] = useState(false);
  const [form, setForm] = useState({ amount: "", categoryId: "", description: "", date: "" });

  // Play the pop-out animation, then tell the parent to unmount.
  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => { setClosing(false); onClose(); }, 190);
  }, [onClose]);

  // Reset local state whenever a new transaction is opened
  useEffect(() => {
    if (txn) {
      setEditing(false);
      setConfirmDelete(false);
      setClosing(false);
      setForm({
        amount: String(txn.amount),
        categoryId: txn.categoryId,
        description: txn.description || "",
        date: new Date(txn.date).toISOString().slice(0, 10),
      });
    }
  }, [txn]);

  // Esc to close
  useEffect(() => {
    if (!txn) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [txn, requestClose]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.data as Category[],
    enabled: !!txn,
  });

  const base = txn?.type === "income" ? "income" : "expenses";

  function invalidateAll() {
    INVALIDATE.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/${base}/${txn!.id}`, {
        amount: parseFloat(form.amount),
        categoryId: form.categoryId,
        description: form.description || undefined,
        date: form.date,
      }),
    onSuccess: () => { invalidateAll(); setEditing(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/${base}/${txn!.id}`),
    onSuccess: () => { invalidateAll(); requestClose(); },
  });

  if (!txn) return null;
  const income = txn.type === "income";

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Transaction details">
      <button
        className={`absolute inset-0 bg-[oklch(0.3_0.03_285/0.35)] ${closing ? "backdrop-out" : "backdrop-in"}`}
        aria-label="Close"
        onClick={requestClose}
      />

      <div className={`relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl bg-base p-6 shadow-2xl sm:p-7 ${closing ? "pop-out" : "pop-in"}`}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Transaction details</h2>
          <button onClick={requestClose} className="neu-btn grid size-10 place-items-center rounded-full text-ink-2" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Amount hero */}
        <div className="neu-inset mb-6 rounded-2xl p-6 text-center" style={{ ["--neu-d" as string]: "3px" }}>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${income ? "bg-income-soft text-income" : "bg-expense-soft text-expense"}`}>
            {income ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {income ? "Income" : "Expense"}
          </span>
          <p className={`mt-3 text-4xl font-extrabold tabular-nums ${income ? "text-income" : "text-expense"}`}>
            {income ? "+" : "-"}{money(txn.amount, cur)}
          </p>
        </div>

        {editing ? (
          <form
            onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(); }}
            className="space-y-4"
          >
            <FormRow label="Amount">
              <input type="number" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="field w-full rounded-xl px-4 py-3 text-sm" />
            </FormRow>
            <FormRow label="Category">
              <Select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select category</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormRow>
            <FormRow label="Description">
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional note" className="field w-full rounded-xl px-4 py-3 text-sm" />
            </FormRow>
            <FormRow label="Date">
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="field w-full rounded-xl px-4 py-3 text-sm" />
            </FormRow>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)} className="neu-btn flex-1 rounded-full py-3 text-sm font-bold text-ink-2">Cancel</button>
              <button type="submit" disabled={updateMutation.isPending} className="btn-brand flex-1 rounded-full py-3 text-sm font-bold disabled:opacity-60">
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Detail rows */}
            <dl className="space-y-1">
              <DetailRow icon={<Tag size={16} />} label="Category">
                <span className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-md text-white" style={{ background: txn.category?.color || "var(--color-brand)" }}>
                    <CategoryIcon name={txn.category?.icon} size={14} />
                  </span>
                  <span className="font-semibold text-ink">{txn.category?.name || "—"}</span>
                </span>
              </DetailRow>
              <DetailRow icon={<Calendar size={16} />} label="Date">
                <span className="font-semibold text-ink">
                  {new Date(txn.date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </DetailRow>
              <DetailRow icon={<Pencil size={16} />} label="Description">
                <span className={txn.description ? "font-medium text-ink" : "text-faint"}>{txn.description || "No description"}</span>
              </DetailRow>
              {txn.createdAt && (
                <DetailRow icon={<Clock size={16} />} label="Added">
                  <span className="text-ink-2">{new Date(txn.createdAt).toLocaleString()}</span>
                </DetailRow>
              )}
            </dl>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <button onClick={() => setEditing(true)} className="btn-brand flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold">
                <Pencil size={16} /> Edit transaction
              </button>

              {confirmDelete ? (
                <div className="rounded-xl bg-expense-soft p-4 text-center">
                  <p className="flex items-center justify-center gap-2 text-sm font-semibold text-expense">
                    <AlertTriangle size={16} /> Delete this transaction?
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} className="neu-btn flex-1 rounded-full py-2.5 text-sm font-bold text-ink-2">Cancel</button>
                    <button
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="flex-1 rounded-full bg-expense py-2.5 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {deleteMutation.isPending ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="neu-btn flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-expense">
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-[oklch(0.9_0.01_285)] py-3.5 last:border-0">
      <span className="mt-0.5 text-faint">{icon}</span>
      <dt className="w-24 shrink-0 text-sm text-muted">{label}</dt>
      <dd className="flex-1 text-right text-sm">{children}</dd>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import api from "../services/api";
import type { Income, Category, TxnDetail } from "../types";
import { useAuth } from "../context/AuthContext";
import { PageHeader, TxnForm, TxnTable } from "./ExpensesPage";
import TransactionDrawer from "../components/TransactionDrawer";

export default function IncomePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const cur = user?.currency;
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterCat, setFilterCat] = useState("");
  const [selected, setSelected] = useState<TxnDetail | null>(null);

  const { data: incomes, isLoading } = useQuery({
    queryKey: ["incomes", filterCat],
    queryFn: async () => {
      const params = filterCat ? { categoryId: filterCat } : {};
      return (await api.get("/income", { params })).data.data as Income[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.data as Category[],
  });

  const saveMutation = useMutation({
    mutationFn: async (body: { amount: number; categoryId: string; description?: string; date: string }) =>
      api.post("/income", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      resetForm();
    },
  });

  function resetForm() {
    setAmount(""); setCategoryId(""); setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate({ amount: parseFloat(amount), categoryId, description: description || undefined, date });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Income"
        subtitle="Every earning, in one place."
        action={
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-brand flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
            {showForm ? <><X size={17} /> Cancel</> : <><Plus size={17} /> Add Income</>}
          </button>
        }
      />

      {showForm && (
        <TxnForm
          type="income"
          amount={amount} setAmount={setAmount}
          categoryId={categoryId} setCategoryId={setCategoryId}
          description={description} setDescription={setDescription}
          date={date} setDate={setDate}
          categories={categories} onSubmit={handleSubmit}
          pending={saveMutation.isPending}
        />
      )}

      <TxnTable
        rows={incomes} isLoading={isLoading} cur={cur} tone="income"
        categories={categories} filterCat={filterCat} setFilterCat={setFilterCat}
        onSelect={setSelected}
        emptyText="No income yet. Record your first earning to get started."
      />

      <TransactionDrawer txn={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

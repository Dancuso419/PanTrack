import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import api from "../services/api";
import type { Category } from "../types";
import CategoryIcon, { ICON_NAMES } from "../components/CategoryIcon";
import { PageHeader } from "./ExpensesPage";

const COLOR_OPTIONS = ["#6D4AFF", "#16B378", "#F0564E", "#E0A63B", "#4ECDC4", "#45B7D1", "#DDA0DD", "#FF8A80"];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("utensils");
  const [color, setColor] = useState("#6D4AFF");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data.data as Category[],
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; icon: string; color: string }) => api.post("/categories", body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setName(""); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    onError: (err: any) => alert(err.response?.data?.message || "Could not delete category"),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, icon, color });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Categories" subtitle="Organize where your money flows." />

      <form onSubmit={handleCreate} className="neu-raised mb-6 rounded-xl p-6">
        <div className="grid gap-5 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-2">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="field w-full rounded-xl px-4 py-3 text-sm" placeholder="e.g. Groceries" />
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold text-ink-2">Icon</span>
              <div className="flex flex-wrap gap-2">
                {ICON_NAMES.map((ic) => (
                  <button
                    key={ic} type="button" onClick={() => setIcon(ic)}
                    className={`grid size-11 place-items-center rounded-lg transition-all ${icon === ic ? "btn-brand text-white" : "neu-btn text-ink-2"}`}
                    aria-label={ic}
                  >
                    <CategoryIcon name={ic} size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-semibold text-ink-2">Color</span>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c} type="button" onClick={() => setColor(c)}
                    className="size-9 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, boxShadow: color === c ? `0 0 0 3px var(--color-base), 0 0 0 5px ${c}` : "3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light)" }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="neu-inset grid size-24 place-items-center rounded-2xl">
              <span className="grid size-14 place-items-center rounded-xl text-white" style={{ background: color }}>
                <CategoryIcon name={icon} size={26} />
              </span>
            </div>
            <button type="submit" disabled={createMutation.isPending} className="btn-brand flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:opacity-60">
              <Plus size={16} /> {createMutation.isPending ? "Adding…" : "Add category"}
            </button>
          </div>
        </div>
      </form>

      <div className="neu-raised rounded-xl p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-base-2" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categories?.map((cat) => (
              <div key={cat.id} className="group flex items-center justify-between gap-2 rounded-lg px-3 py-3 transition-colors hover:bg-base-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: cat.color }}>
                    <CategoryIcon name={cat.icon} size={16} />
                  </span>
                  <span className="truncate text-sm font-semibold text-ink">{cat.name}</span>
                </div>
                {cat.isDefault ? (
                  <span className="shrink-0 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">Default</span>
                ) : (
                  <button
                    onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id); }}
                    className="grid size-9 shrink-0 place-items-center rounded-md text-muted opacity-100 transition-opacity hover:bg-base-2 hover:text-expense sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

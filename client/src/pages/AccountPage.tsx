import { useState } from "react";
import { CheckCircle2, User as UserIcon, KeyRound } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { currencySymbol } from "../utils/format";
import { PageHeader } from "./ExpensesPage";
import Select from "../components/Select";

const PROFILE_TYPES = ["Student", "Employee", "Freelancer", "Business Owner", "Other"];
const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
];

export default function AccountPage() {
  const { user, updateUser } = useAuth();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Account settings" subtitle="Manage your profile and password." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard key={user?.id} initial={user} onSaved={updateUser} />
        <PasswordCard />
      </div>
    </div>
  );
}

function ProfileCard({ initial, onSaved }: { initial: any; onSaved: (u: any) => void }) {
  const [fullName, setFullName] = useState(initial?.fullName || "");
  const [profileType, setProfileType] = useState(initial?.profileType || "");
  const [currency, setCurrency] = useState(initial?.currency || "NGN");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setStatus("saving");
    try {
      const res = await api.patch("/auth/profile", { fullName, profileType, currency });
      onSaved(res.data.data);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err: any) {
      setStatus("idle");
      setError(err.response?.data?.message || "Could not save profile");
    }
  }

  return (
    <form onSubmit={save} className="neu-raised rounded-xl p-6">
      <CardHeader icon={<UserIcon size={20} />} title="Profile" />

      <div className="mt-6 space-y-5">
        <Field label="Full name">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="field w-full rounded-xl px-4 py-3 text-sm" />
        </Field>

        <div>
          <span className="mb-2 block text-sm font-semibold text-ink-2">Profile type</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PROFILE_TYPES.map((t) => {
              const active = profileType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setProfileType(t)}
                  className={`rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${active ? "btn-brand" : "neu-btn text-ink-2"}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Currency">
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </Select>
        </Field>
      </div>

      {error && <p className="mt-4 rounded-lg bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-brand rounded-full px-6 py-3 text-sm font-bold disabled:opacity-60">
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-income"><CheckCircle2 size={16} /> Saved</span>
        )}
        <span className="ml-auto text-sm text-muted">Symbol: <span className="font-bold text-ink">{currencySymbol(currency)}</span></span>
      </div>
    </form>
  );
}

function PasswordCard() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters");
    if (newPassword !== confirm) return setError("Passwords do not match");
    setStatus("saving");
    try {
      await api.post("/auth/change-password", { newPassword });
      setStatus("saved");
      setNewPassword(""); setConfirm("");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err: any) {
      setStatus("idle");
      setError(err.response?.data?.message || "Could not change password");
    }
  }

  return (
    <form onSubmit={save} className="neu-raised rounded-xl p-6">
      <CardHeader icon={<KeyRound size={20} />} title="Password" />

      <div className="mt-6 space-y-5">
        <Field label="New password">
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="field w-full rounded-xl px-4 py-3 text-sm" />
        </Field>
        <Field label="Confirm new password">
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter new password" className="field w-full rounded-xl px-4 py-3 text-sm" />
        </Field>
      </div>

      {error && <p className="mt-4 rounded-lg bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">{error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-brand rounded-full px-6 py-3 text-sm font-bold disabled:opacity-60">
          {status === "saving" ? "Updating…" : "Change password"}
        </button>
        {status === "saved" && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-income"><CheckCircle2 size={16} /> Password changed</span>
        )}
      </div>
    </form>
  );
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-lg bg-brand-tint text-brand">{icon}</span>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Target, BarChart3, PartyPopper,
  ArrowRight, GraduationCap, Briefcase, Rocket, Building2, User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { currencySymbol } from "../utils/format";
import Logo from "../components/Logo";

const PROFILE_TYPES = [
  { label: "Student", icon: GraduationCap },
  { label: "Employee", icon: Briefcase },
  { label: "Freelancer", icon: Rocket },
  { label: "Business Owner", icon: Building2 },
  { label: "Other", icon: User },
];
const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
];
const FEATURES = [
  { icon: TrendingUp, title: "Track Income", desc: "Record all your earnings in one place" },
  { icon: TrendingDown, title: "Track Expenses", desc: "Monitor where your money goes" },
  { icon: Target, title: "Smart Budgeting", desc: "Set limits and get alerts" },
  { icon: BarChart3, title: "Analytics", desc: "Visualize your spending habits" },
];
const DEFAULT_CATS = ["Food", "Rent", "Transport", "Shopping", "Bills", "Entertainment", "Healthcare", "Education"];
const STEPS = 8;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [profileType, setProfileType] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  async function handleFinish() {
    setLoading(true);
    setError("");
    try {
      const res = await api.patch("/auth/onboarding", {
        profileType,
        currency,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
      });
      updateUser(res.data.data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const sym = currencySymbol(currency);

  const screens = [
    // 0 — Welcome
    <Screen key="welcome" center>
      <Logo size={54} withWordmark={false} className="mx-auto justify-center" />
      <h2 className="mt-6 text-3xl font-extrabold text-ink">Welcome to PanTrack</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Track your income, manage expenses, create budgets, and achieve your financial goals.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <PrimaryBtn onClick={next}>Get started</PrimaryBtn>
        <button onClick={handleFinish} disabled={loading} className="text-sm font-semibold text-muted hover:text-brand disabled:opacity-50">
          Skip onboarding
        </button>
      </div>
    </Screen>,

    // 1 — Features
    <Screen key="features" center>
      <h2 className="text-2xl font-extrabold text-ink">Here's what you can do</h2>
      <div className="mt-7 grid grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="neu-raised rounded-xl p-5 text-left" style={{ ["--neu-d" as string]: "5px" }}>
            <span className="grid size-11 place-items-center rounded-lg bg-brand-tint text-brand"><f.icon size={22} /></span>
            <h3 className="mt-4 font-bold text-ink">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
      <NavRow onBack={back} onNext={next} />
    </Screen>,

    // 2 — Profile
    <Screen key="profile" center>
      <h2 className="text-2xl font-extrabold text-ink">What best describes you?</h2>
      <div className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3">
        {PROFILE_TYPES.map((t) => {
          const active = profileType === t.label;
          return (
            <button
              key={t.label}
              onClick={() => setProfileType(t.label)}
              className={`flex items-center gap-3 rounded-xl px-4 py-4 text-left text-sm font-semibold transition-all ${active ? "btn-brand" : "neu-btn text-ink-2"}`}
            >
              <t.icon size={20} className={active ? "text-white" : "text-brand"} />
              {t.label}
            </button>
          );
        })}
      </div>
      <NavRow onBack={back} onNext={next} nextDisabled={!profileType} />
    </Screen>,

    // 3 — Currency
    <Screen key="currency" center>
      <h2 className="text-2xl font-extrabold text-ink">Choose your currency</h2>
      <div className="mx-auto mt-7 max-w-sm space-y-3">
        {CURRENCIES.map((c) => {
          const active = currency === c.code;
          return (
            <button
              key={c.code}
              onClick={() => setCurrency(c.code)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left font-semibold transition-all ${active ? "btn-brand" : "neu-btn text-ink-2"}`}
            >
              <span className={`grid size-9 place-items-center rounded-lg text-lg ${active ? "bg-white/20 text-white" : "bg-brand-tint text-brand"}`}>
                {currencySymbol(c.code)}
              </span>
              {c.label}
            </button>
          );
        })}
      </div>
      <NavRow onBack={back} onNext={next} />
    </Screen>,

    // 4 — Income
    <Screen key="income" center>
      <h2 className="text-2xl font-extrabold text-ink">Your estimated monthly income?</h2>
      <p className="mt-2 text-muted">This helps us tailor your dashboard.</p>
      <MoneyInput sym={sym} value={monthlyIncome} onChange={setMonthlyIncome} placeholder="150,000" />
      <NavRow onBack={back} onNext={next} />
    </Screen>,

    // 5 — Budget
    <Screen key="budget" center>
      <h2 className="text-2xl font-extrabold text-ink">How much do you plan to spend monthly?</h2>
      <p className="mt-2 text-muted">You can fine-tune budgets per category later.</p>
      <MoneyInput sym={sym} value={monthlyBudget} onChange={setMonthlyBudget} placeholder="100,000" />
      <NavRow onBack={back} onNext={next} />
    </Screen>,

    // 6 — Categories
    <Screen key="categories" center>
      <h2 className="text-2xl font-extrabold text-ink">We've pre-loaded categories</h2>
      <p className="mt-2 text-muted">You can customize these anytime.</p>
      <div className="mx-auto mt-7 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
        {DEFAULT_CATS.map((cat) => (
          <div key={cat} className="neu-inset rounded-lg px-3 py-3 text-sm font-semibold text-ink-2" style={{ ["--neu-d" as string]: "3px" }}>
            {cat}
          </div>
        ))}
      </div>
      <NavRow onBack={back} onNext={next} />
    </Screen>,

    // 7 — Success
    <Screen key="success" center>
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-tint text-brand"><PartyPopper size={32} /></span>
      <h2 className="mt-6 text-2xl font-extrabold text-ink">You're all set!</h2>
      <p className="mt-2 text-muted">Welcome to PanTrack. Start managing your finances today.</p>
      {error && <div className="mx-auto mt-5 max-w-sm rounded-lg bg-expense-soft px-4 py-3 text-sm font-medium text-expense">{error}</div>}
      <div className="mt-8 flex justify-center gap-3">
        <button onClick={back} className="neu-btn rounded-full px-6 py-3 text-sm font-bold text-ink-2">Back</button>
        <PrimaryBtn onClick={handleFinish} disabled={loading}>
          {loading ? "Setting up…" : "Go to Dashboard"}
        </PrimaryBtn>
      </div>
    </Screen>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-1.5">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 28 : 16,
                background: i <= step ? "var(--color-brand)" : "var(--color-base-2)",
              }}
            />
          ))}
        </div>
        <div className="neu-raised rounded-2xl p-8 sm:p-10">{screens[step]}</div>
      </div>
    </div>
  );
}

function Screen({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return <div className={center ? "text-center" : ""}>{children}</div>;
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn-brand flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold disabled:opacity-60">
      {children}
    </button>
  );
}

function NavRow({ onBack, onNext, nextDisabled }: { onBack: () => void; onNext: () => void; nextDisabled?: boolean }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button onClick={onBack} className="neu-btn rounded-full px-6 py-3 text-sm font-bold text-ink-2">Back</button>
      <button onClick={onNext} disabled={nextDisabled} className="btn-brand flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold disabled:opacity-50">
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}

function MoneyInput({ sym, value, onChange, placeholder }: { sym: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="mx-auto mt-8 flex max-w-xs items-center gap-2 field rounded-xl px-4 py-4">
      <span className="text-xl font-bold text-brand">{sym}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-lg font-semibold text-ink outline-none placeholder:text-faint"
      />
    </div>
  );
}

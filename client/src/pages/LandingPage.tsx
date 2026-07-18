import { Link } from "react-router-dom";
import {
  ArrowRight, TrendingUp, PieChart, Target, ShieldCheck,
  ArrowUpRight, ArrowDownRight, Sparkles, Wallet, Bell, LineChart,
  Star, Check, UserPlus, ListChecks, Rocket,
} from "lucide-react";
import Logo from "../components/Logo";

const NAV = ["Features", "How it works", "Reviews"];

const FEATURES = [
  { icon: TrendingUp, title: "Track every penny", body: "Log income and expenses in seconds. Filter by category or date and always know where your money went." },
  { icon: Target, title: "Budgets that warn you", body: "Set a limit per category. PanTrack nudges you at 80% and flags the moment you cross 100% — before it hurts." },
  { icon: PieChart, title: "See the whole picture", body: "Pie, bar, and trend charts turn raw transactions into the story of your month, quarter, and year." },
];

const STATS = [
  { value: "25K+", label: "Active trackers" },
  { value: "₦2.4B", label: "Tracked monthly" },
  { value: "4.9/5", label: "Average rating" },
  { value: "80%", label: "Overspend caught early" },
];

const STEPS = [
  { icon: UserPlus, title: "Create your account", body: "Sign up in under two minutes — no card required. Pick your currency and you're in." },
  { icon: ListChecks, title: "Log income & expenses", body: "Add transactions and organize them with eight ready-made categories, or make your own." },
  { icon: Rocket, title: "Watch it come together", body: "Your dashboard, budgets, and analytics update instantly. Spend less time budgeting, more time living." },
];

const REVIEWS = [
  { quote: "I finally know where my salary goes each month. The budget warnings alone paid for themselves.", name: "Amara O.", role: "Freelance designer" },
  { quote: "Clean, calm, and genuinely pleasant to open. It doesn't feel like a spreadsheet.", name: "Tunde A.", role: "Software engineer" },
  { quote: "Set budgets for every category and PanTrack tells me the moment I'm close. Game changer.", name: "Ngozi E.", role: "Small business owner" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-base text-ink-2">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 80% -10%, oklch(0.82 0.11 285 / 0.5), transparent 60%), radial-gradient(90% 60% at 0% 0%, oklch(0.88 0.07 250 / 0.45), transparent 55%)",
        }}
        aria-hidden="true"
      />

      {/* Nav */}
      <header className="sticky top-0 z-[200] px-5 pt-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div
            className="neu-raised flex w-full items-center justify-between rounded-full py-2.5 pl-5 pr-2.5"
            style={{ ["--neu-d" as string]: "4px", background: "color-mix(in oklch, var(--color-surface) 88%, transparent)", backdropFilter: "blur(12px)" }}
          >
            <Logo size={34} />
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <a key={n} href={`#${n.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-brand">
                  {n}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-ink transition-colors hover:text-brand sm:block">Sign in</Link>
              <Link to="/register" className="btn-brand flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold">
                Get started <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-10 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
        <div>
          <span className="animate-rise neu-raised inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-brand" style={{ ["--neu-d" as string]: "3px", animationDelay: "0.05s" }}>
            <Sparkles size={15} /> Your money, your control
          </span>
          <h1 className="animate-rise mt-6 text-[clamp(2.2rem,6.5vw,4.75rem)] font-bold leading-[1.0]" style={{ animationDelay: "0.12s" }}>
            Track Every Penny.
            <br />
            <span className="text-brand">Plan Every Future.</span>
          </h1>
          <p className="animate-rise mt-6 max-w-lg text-lg leading-relaxed text-ink-2" style={{ animationDelay: "0.2s" }}>
            The calm way to manage your money. Record income and expenses, set
            budgets that actually warn you, and watch your finances come into focus.
          </p>
          <div className="animate-rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.28s" }}>
            <Link to="/register" className="btn-brand flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-bold">
              Start for free <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="neu-btn rounded-full px-7 py-3.5 text-base font-bold text-ink">See how it works</a>
          </div>
          <div className="animate-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted" style={{ animationDelay: "0.36s" }}>
            <span className="flex items-center gap-2"><ShieldCheck size={17} className="text-income" /> Bank-grade security</span>
            <span className="flex items-center gap-2"><Check size={17} className="text-income" /> Free to start</span>
            <span className="flex items-center gap-2"><Check size={17} className="text-income" /> No card required</span>
          </div>
        </div>
        <HeroPreview />
      </section>

      {/* Trust band */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-faint">
          Trusted by people who like to know exactly where they stand
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xl font-bold text-muted/70">
          <span>Notion</span><span>Mailchimp</span><span>Airtable</span><span>Gumroad</span><span>Framer</span>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="neu-raised grid grid-cols-2 gap-6 rounded-2xl px-8 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-bold text-brand">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16">
        <SectionHead title="Everything you need, nothing you don't" sub="Three tools that work together so you spend less time budgeting and more time living." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="neu-raised neu-card rounded-xl p-7">
              <span className="grid size-14 place-items-center rounded-lg text-brand" style={{ background: "var(--color-brand-tint)", boxShadow: "inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light)" }}>
                <f.icon size={26} />
              </span>
              <h3 className="mt-6 text-xl font-semibold text-ink">{f.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-2">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Showcase — alternating rows */}
      <section className="mx-auto max-w-6xl space-y-20 px-5 py-16">
        <ShowcaseRow
          eyebrow="Real-time dashboard"
          title="Your whole financial picture, at a glance"
          body="Income, expenses, remaining balance, and savings — all live. Add a transaction on your phone and the dashboard updates instantly, no refresh."
          bullets={["Live totals & budget status", "Five most recent transactions", "Works beautifully on mobile"]}
          visual={<HeroPreview compact />}
        />
        <ShowcaseRow
          reverse
          eyebrow="Never overspend again"
          title="Budgets that speak up before it's too late"
          body="Set a monthly limit per category. PanTrack quietly tracks your spend and warns you at 80%, then flags red at 100% — so a tight month never becomes a surprise."
          bullets={["Per-category monthly limits", "Gentle 80% nudge, red at 100%", "Progress bars you can read in a glance"]}
          visual={<BudgetVisual />}
        />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16">
        <SectionHead title="Up and running in minutes" sub="No finance degree required. Three steps and you're tracking." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="neu-raised neu-card relative rounded-xl p-7">
              <span className="font-display absolute right-6 top-5 text-5xl font-bold text-brand/12">{i + 1}</span>
              <span className="grid size-12 place-items-center rounded-lg btn-brand text-white"><s.icon size={22} /></span>
              <h3 className="mt-6 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-2">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-6xl px-5 py-16">
        <SectionHead title="Loved by everyday money-trackers" sub="Real people, real control over their finances." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="neu-raised neu-card flex flex-col rounded-xl p-7">
              <div className="flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed text-ink-2">"{r.quote}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(140deg, var(--color-brand), var(--color-brand-strong))" }}>
                  {r.name[0]}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{r.name}</span>
                  <span className="block text-xs text-muted">{r.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-8">
        <div className="relative overflow-hidden rounded-2xl px-8 py-16 text-center" style={{ background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-strong) 100%)", boxShadow: "8px 12px 34px oklch(0.56 0.205 285 / 0.35)" }}>
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full" style={{ background: "oklch(1 0 0 / 0.12)" }} aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full" style={{ background: "oklch(1 0 0 / 0.08)" }} aria-hidden="true" />
          <h2 className="relative mx-auto max-w-2xl text-[clamp(2rem,4vw,3rem)] font-bold text-white">Take control of your financial future</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">Join thousands tracking smarter with PanTrack. It takes two minutes to set up — and it's free.</p>
          <Link to="/register" className="relative mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand transition-transform hover:-translate-y-0.5">
            Create your account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size={34} />
            <p className="mt-4 max-w-xs text-sm text-muted">Track Every Penny. Plan Every Future. The calm way to manage your money.</p>
          </div>
          <FooterCol title="Product" links={["Features", "How it works", "Reviews"]} />
          <FooterCol title="Company" links={["About", "Blog", "Careers"]} />
          <FooterCol title="Legal" links={["Privacy", "Terms", "Security"]} />
        </div>
        <div className="border-t border-white/50">
          <p className="mx-auto max-w-6xl px-5 py-6 text-sm text-muted">© {new Date().getFullYear()} PanTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-[clamp(1.9rem,4vw,2.75rem)] font-semibold text-ink">{title}</h2>
      <p className="mt-4 text-lg text-ink-2">{sub}</p>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-ink">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l}><a href="#" className="text-sm text-muted transition-colors hover:text-brand">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}

function ShowcaseRow({ eyebrow, title, body, bullets, visual, reverse }: {
  eyebrow: string; title: string; body: string; bullets: string[]; visual: React.ReactNode; reverse?: boolean;
}) {
  return (
    <div className={`grid items-center gap-12 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <div>
        <span className="text-sm font-bold uppercase tracking-wider text-brand">{eyebrow}</span>
        <h3 className="mt-3 text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold text-ink">{title}</h3>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">{body}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 font-medium text-ink-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-income-soft text-income"><Check size={14} /></span>
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div>{visual}</div>
    </div>
  );
}

/* Self-contained product preview — echoes the dashboard, no external assets. */
function HeroPreview({ compact }: { compact?: boolean }) {
  const bars = [42, 60, 38, 74, 52, 88, 46];
  return (
    <div className={compact ? "relative" : "animate-rise relative"} style={compact ? undefined : { animationDelay: "0.3s" }}>
      <div className="neu-raised rounded-2xl p-6" style={{ ["--neu-d" as string]: "8px" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted">Total Balance</p>
            <p className="mt-1 text-3xl font-bold text-ink">₦867,550</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-income-soft px-2.5 py-1 text-xs font-bold text-income"><ArrowUpRight size={13} /> 12.5%</span>
        </div>
        <div className="mt-7 flex h-28 items-end justify-between gap-2">
          {bars.map((h, i) => (
            <div key={i} className="w-full origin-bottom rounded-md" style={{
              height: `${h}%`,
              background: i === 5 ? "linear-gradient(180deg, var(--color-brand), var(--color-brand-strong))" : "linear-gradient(180deg, oklch(0.86 0.08 285), oklch(0.72 0.14 285))",
              animation: "grow-bar 0.6s var(--ease-out-quart) both",
              animationDelay: `${0.5 + i * 0.06}s`,
            }} />
          ))}
        </div>
        <div className="mt-6 space-y-2.5">
          {[{ name: "Salary", amt: "+₦450,000", up: true }, { name: "Groceries", amt: "-₦18,400", up: false }].map((t) => (
            <div key={t.name} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "var(--color-base-2)" }}>
              <div className="flex items-center gap-2.5">
                <span className={`grid size-8 place-items-center rounded-md ${t.up ? "bg-income-soft text-income" : "bg-expense-soft text-expense"}`}>
                  {t.up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                </span>
                <span className="text-sm font-semibold text-ink">{t.name}</span>
              </div>
              <span className={`text-sm font-bold ${t.up ? "text-income" : "text-expense"}`}>{t.amt}</span>
            </div>
          ))}
        </div>
      </div>
      {!compact && (
        <div className="animate-float neu-raised absolute -bottom-6 -left-6 hidden rounded-xl p-4 sm:block" style={{ ["--neu-d" as string]: "6px" }}>
          <p className="text-xs font-medium text-muted">Budget on track</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full" style={{ background: "var(--color-base-2)" }}>
              <div className="h-full w-[68%] rounded-full" style={{ background: "linear-gradient(90deg, var(--color-brand), var(--color-brand-strong))" }} />
            </div>
            <span className="text-xs font-bold text-brand">68%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetVisual() {
  const items = [
    { name: "Food", icon: Wallet, spent: 62, tone: "var(--color-brand)" },
    { name: "Transport", icon: TrendingUp, spent: 88, tone: "var(--color-warning)" },
    { name: "Shopping", icon: LineChart, spent: 104, tone: "var(--color-expense)" },
  ];
  return (
    <div className="neu-raised rounded-2xl p-6" style={{ ["--neu-d" as string]: "8px" }}>
      <div className="mb-5 flex items-center justify-between">
        <p className="font-semibold text-ink">This month's budgets</p>
        <Bell size={18} className="text-brand" />
      </div>
      <div className="space-y-5">
        {items.map((it) => (
          <div key={it.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-ink"><it.icon size={15} className="text-muted" /> {it.name}</span>
              <span className="font-bold" style={{ color: it.tone }}>{it.spent}%</span>
            </div>
            <div className="neu-inset h-3 overflow-hidden rounded-full" style={{ ["--neu-d" as string]: "2px" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(it.spent, 100)}%`, background: it.tone }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

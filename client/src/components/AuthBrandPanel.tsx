import { ShieldCheck, TrendingUp, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const POINTS = [
  { icon: TrendingUp, text: "Track income & expenses in seconds" },
  { icon: Target, text: "Budgets that warn you at 80% and 100%" },
  { icon: ShieldCheck, text: "Bank-grade security, always private" },
];

/** Left-side brand panel shown on auth screens (hidden on small viewports). */
export default function AuthBrandPanel() {
  return (
    <aside
      className="relative hidden w-[46%] max-w-xl flex-col justify-between overflow-hidden p-12 text-white lg:flex"
      style={{ background: "linear-gradient(150deg, var(--color-brand) 0%, var(--color-brand-strong) 100%)" }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full"
        style={{ background: "oklch(1 0 0 / 0.1)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 size-72 rounded-full"
        style={{ background: "oklch(1 0 0 / 0.08)" }}
        aria-hidden="true"
      />

      <Link to="/" className="relative">
        {/* White wordmark override */}
        <span className="flex items-center gap-2.5">
          <Logo size={38} withWordmark={false} />
          <span className="text-xl font-extrabold tracking-tight text-white">PanTrack</span>
        </span>
      </Link>

      <div className="relative">
        <h2 className="text-[2.6rem] font-extrabold leading-[1.05]">
          Track Every Penny.<br />Plan Every Future.
        </h2>
        <p className="mt-4 max-w-sm text-white/75">
          The calm, tactile way to manage your money — trusted by people who like
          to know exactly where they stand.
        </p>
        <ul className="mt-9 space-y-4">
          {POINTS.map((p) => (
            <li key={p.text} className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-white/15">
                <p.icon size={18} />
              </span>
              <span className="text-sm font-medium text-white/90">{p.text}</span>
            </li>
          ))}
        </ul>

        {/* Translucent mini-statement — one deliberate glass element */}
        <div className="mt-10 max-w-xs rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/70">This month</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold text-white">+12.5%</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-white">₦867,550</p>
          <div className="mt-4 flex h-14 items-end gap-1.5">
            {[45, 62, 40, 78, 55, 90, 48].map((h, i) => (
              <div key={i} className="w-full rounded-sm bg-white/25" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      <p className="relative text-sm text-white/60">
        © {new Date().getFullYear()} PanTrack
      </p>
    </aside>
  );
}

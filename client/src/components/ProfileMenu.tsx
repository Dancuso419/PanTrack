import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import type { User } from "../types";

/** Top-bar profile badge that opens a menu (identity + sign out). */
export default function ProfileMenu({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const initials = (user?.fullName || "U")
    .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="neu-btn flex min-w-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-1.5 sm:pr-3"
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ background: "linear-gradient(140deg, var(--color-brand), var(--color-brand-strong))" }}
        >
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate text-sm font-semibold text-ink sm:block">
          {user?.fullName?.split(" ")[0]}
        </span>
        <ChevronDown size={15} className={`hidden shrink-0 text-muted transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="neu-raised pop-in absolute right-0 top-full z-[300] mt-2 w-60 origin-top-right rounded-xl bg-surface p-2"
        >
          <div className="flex items-center gap-3 rounded-lg px-3 py-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
              style={{ background: "linear-gradient(140deg, var(--color-brand), var(--color-brand-strong))" }}
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{user?.fullName}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>
          <hr className="my-1 border-[oklch(0.9_0.01_285)]" />
          <button
            role="menuitem"
            onClick={() => { setOpen(false); navigate("/account"); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:bg-base-2 hover:text-brand"
          >
            <Settings size={17} className="text-brand" /> Account settings
          </button>
          <button
            role="menuitem"
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:bg-base-2 hover:text-expense"
          >
            <LogOut size={17} className="text-expense" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

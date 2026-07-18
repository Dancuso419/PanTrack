import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";
import Logo from "../components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-base">
      <AuthBrandPanel />
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-3xl font-extrabold text-ink">Welcome back</h1>
          <p className="mt-2 text-muted">Sign in to keep tracking every penny.</p>

          {error && (
            <div className="mt-6 rounded-lg bg-expense-soft px-4 py-3 text-sm font-medium text-expense">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            <button
              type="submit"
              disabled={loading}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold disabled:opacity-60"
            >
              {loading ? "Signing in…" : <>Sign in <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            New to PanTrack?{" "}
            <Link to="/register" className="font-bold text-brand hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label, type = "text", value, onChange, placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-2">{label}</span>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className={`field w-full rounded-xl px-4 py-3.5 text-sm ${isPassword ? "pr-12" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-brand"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}

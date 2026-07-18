import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthBrandPanel from "../components/AuthBrandPanel";
import { Field } from "./LoginPage";
import Logo from "../components/Logo";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
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
          <h1 className="text-3xl font-extrabold text-ink">Create your account</h1>
          <p className="mt-2 text-muted">Start tracking in under two minutes.</p>

          {error && (
            <div className="mt-6 rounded-lg bg-expense-soft px-4 py-3 text-sm font-medium text-expense">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Ada Lovelace" />
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" />
            <button
              type="submit"
              disabled={loading}
              className="btn-brand flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold disabled:opacity-60"
            >
              {loading ? "Creating account…" : <>Create account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-brand hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

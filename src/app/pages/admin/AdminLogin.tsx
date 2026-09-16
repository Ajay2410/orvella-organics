import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { LockKeyhole } from "lucide-react";
import { getCurrentAdmin, signInAdmin } from "../../services/firebase/authService";
import { isFirebaseConfigured } from "../../services/firebase/firebaseConfig";

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => getCurrentAdmin((user) => setIsAuthenticated(Boolean(user))), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signInAdmin(email, password);
      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/products" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-cream px-4 py-12 sm:px-6 lg:px-20">
      <div className="mx-auto flex max-w-md flex-col gap-6 rounded-[16px] border border-[#E8E0D5]/70 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole size={22} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-dark">Admin Login</h1>
            <p className="font-body text-sm text-text-muted">Manage Orvella products.</p>
          </div>
        </div>

        {!isFirebaseConfigured() && (
          <div className="rounded-[10px] border border-[#8B3E16]/25 bg-[#8B3E16]/5 p-4 font-body text-sm text-[#8B3E16]">
            Firebase is not configured yet. Add the `VITE_FIREBASE_*` values before using admin login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-email" className="font-body text-sm font-bold text-text-dark">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-[10px] border border-[#E8E0D5] bg-bg-cream px-4 py-3 font-body outline-none focus:border-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-password" className="font-body text-sm font-bold text-text-dark">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[10px] border border-[#E8E0D5] bg-bg-cream px-4 py-3 font-body outline-none focus:border-primary"
              required
            />
          </div>
          {error && <p className="font-body text-sm text-[#8B3E16]">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || !isFirebaseConfigured()}
            className="rounded-[10px] bg-primary px-5 py-3 font-body font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-[#D8CEC2] disabled:text-text-muted"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

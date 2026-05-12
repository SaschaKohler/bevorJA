import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { adminLogin } from "@/lib/api";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await adminLogin(password);
      localStorage.setItem("admin_token", result.token);
      localStorage.setItem("admin_user", JSON.stringify(result.user));
      navigate("/admin/dashboard");
    } catch {
      setError("Falsches Passwort oder Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal flex items-center justify-center p-4">
      <div className="bg-white dark:bg-charcoal-light rounded-2xl shadow-elegant p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl text-charcoal dark:text-white">Admin Login</h1>
          <p className="text-slate mt-2">Vorja Content Management</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate dark:text-slate-light mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben"
              className="w-full px-4 py-3 border border-gold/20 dark:border-gold/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white dark:bg-charcoal text-charcoal dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-elegant flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Anmelden...
              </>
            ) : (
              "Anmelden"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

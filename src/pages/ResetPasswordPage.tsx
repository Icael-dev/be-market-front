import { useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { InputField } from "../components/ui/FormField";
import { api } from "../lib/api";

export function ResetPasswordPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la reinitialisation";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Mot de passe reinitialise</h1>
          <p className="mb-8 text-gray-500">
            Votre mot de passe a ete modifie avec succes. Vous allez etre redirige vers la page de
            connexion.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-medium text-primary-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Aller a la connexion
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-cyan-600 lg:flex lg:w-1/2">
        <div className="absolute inset-0">
          <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md text-center"
          >
            <h1 className="mb-4 text-4xl font-bold">Nouveau mot de passe</h1>
            <p className="text-lg text-primary-100">Choisissez un nouveau mot de passe securise.</p>
          </motion.div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <Link
              to="/login"
              className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour a la connexion
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Reinitialiser</h2>
            <p className="mt-2 text-gray-500">Saisissez votre nouveau mot de passe</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            <InputField
              label="Nouveau mot de passe"
              type="password"
              icon={<Lock className="h-5 w-5" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caracteres"
              required
              autoComplete="new-password"
            />

            <InputField
              label="Confirmer le mot de passe"
              type="password"
              icon={<Lock className="h-5 w-5" />}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Repetez le mot de passe"
              required
              autoComplete="new-password"
            />

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reinitialiser"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

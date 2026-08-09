import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { InputField } from "../components/ui/FormField";
import { api } from "../lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Veuillez saisir votre email");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'envoi du lien";
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Email envoye</h1>
          <p className="mb-8 text-gray-500 dark:text-gray-400">
            Si un compte existe avec cette adresse email, vous recevrez un lien de reinitialisation
            de mot de passe sous peu.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-medium text-primary-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a la connexion
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
            <h1 className="mb-4 text-4xl font-bold">Mot de passe oublie ?</h1>
            <p className="text-lg text-primary-100">
              Saisissez votre email et nous vous enverrons un lien de reinitialisation.
            </p>
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
              className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour a la connexion
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reinitialisation</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Entrez votre email pour recevoir un lien
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300"
              >
                {error}
              </motion.div>
            )}

            <InputField
              label="Email"
              type="email"
              icon={<Mail className="h-5 w-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
            />

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Envoyer le lien"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

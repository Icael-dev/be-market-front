import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { InputField } from "../components/ui/FormField";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    } else {
      navigate("/");
    }
  };

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
            <h1 className="mb-4 text-4xl font-bold">Bienvenue sur BE-Market</h1>
            <p className="text-lg text-primary-100">
              Votre destination pour les meilleurs accessoires electroniques au Togo.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-2 gap-6 text-center"
          >
            <div>
              <div className="text-4xl font-bold">500+</div>
              <div className="text-sm text-primary-200">Produits</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-sm text-primary-200">Clients</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center justify-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-cyan-500">
              <span className="text-xl font-bold text-white">B</span>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Entrez vos identifiants pour acceder a votre compte
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

            <div className="relative">
              <InputField
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                icon={<Lock className="h-5 w-5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[3.4rem] -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="remember"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                Mot de passe oublie ?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Connexion
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 dark:text-gray-300">
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-medium text-primary-600 hover:underline">
              Creer un compte
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

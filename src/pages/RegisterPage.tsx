import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { InputField } from "../components/ui/FormField";

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { label: "Au moins 8 caracteres", met: password.length >= 8 },
    { label: "Une majuscule", met: /[A-Z]/.test(password) },
    { label: "Un chiffre", met: /[0-9]/.test(password) },
    { label: "Une minuscule", met: /[a-z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName);

    if (signUpError) {
      setError(signUpError.message || "Erreur lors de l'inscription");
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Compte cree !</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Redirection vers la page de connexion...
          </p>
          <LoadingSpinner />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-bg flex min-h-screen">
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-cyan-500">
                <span className="text-xl font-bold text-white">B</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Creer un compte</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Rejoignez BE-Market pour les meilleurs accessoires
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
              label="Nom complet"
              icon={<User className="h-5 w-5" />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom"
              required
            />

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
                placeholder="Creer un mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[3.4rem] -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${req.met ? "bg-green-500" : "bg-gray-200 dark:bg-gray-800"}`}
                  >
                    {req.met && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span
                    className={
                      req.met
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="accept-terms"
                name="terms"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
                required
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                J'accepte les{" "}
                <Link to="/legal/terms" className="text-primary-600 hover:underline">
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link to="/legal/privacy" className="text-primary-600 hover:underline">
                  politique de confidentialite
                </Link>
              </span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Creer mon compte
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 dark:text-gray-300">
            Deja un compte ?{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-cyan-600 lg:flex lg:w-1/2">
        <div className="absolute inset-0">
          <div className="absolute right-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 text-4xl font-bold">Rejoignez la communaute BE-Market</h1>
            <p className="mb-8 text-lg text-primary-100">
              Crez votre compte pour acceder aux exclusivites, suivre vos commandes et profiter des
              offres speciales.
            </p>

            <ul className="space-y-4">
              {[
                "Acces aux ventes privees",
                "Suivi de commandes en temps reel",
                "Offres exclusives membres",
                "Livraison prioritaire",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-4 w-4" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

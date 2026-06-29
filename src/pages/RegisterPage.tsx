import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { label: 'Au moins 8 caracteres', met: password.length >= 8 },
    { label: 'Une majuscule', met: /[A-Z]/.test(password) },
    { label: 'Un chiffre', met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName);

    if (signUpError) {
      setError(signUpError.message || 'Erreur lors de l\'inscription');
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Compte cree !</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Redirection vers la page de connexion...
          </p>
          <LoadingSpinner />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Creer un compte</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Rejoignez BE-Market pour les meilleurs accessoires
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
<div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 transition-all"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 transition-all"
                    placeholder="vous@exemple.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-800 transition-all"
                    placeholder="Creer un mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {req.met && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

<div className="flex items-start gap-2">
               <input
                 type="checkbox"
                 className="mt-1 w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                 required
               />
               <span className="text-sm text-gray-600 dark:text-gray-300">
                 J'accepte les{' '}
                 <a href="#" className="text-blue-600 hover:underline">conditions d'utilisation</a>
                 {' '}et la{' '}
                 <a href="#" className="text-blue-600 hover:underline">politique de confidentialite</a>
               </span>
             </div>

             <button
               type="submit"
               disabled={loading}
               className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
             >
               {loading ? (
                 <LoadingSpinner size="sm" />
               ) : (
                 <>
                   Creer mon compte
                   <ArrowRight className="w-4 h-4" />
                 </>
               )}
             </button>
           </form>

           <p className="text-center mt-8 text-gray-600 dark:text-gray-300">
             Deja un compte ?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Rejoignez la communaute BE-Market
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              Crez votre compte pour acceder aux exclusivites, suivre vos commandes et profiter des offres speciales.
            </p>

            <ul className="space-y-4">
              {[
                'Acces aux ventes privees',
                'Suivi de commandes en temps reel',
                'Offres exclusives membres',
                'Livraison prioritaire'
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4" />
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

import { useState } from "react";
import { motion } from "framer-motion";
import { subscribeNewsletter } from "../services/content";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { InputField } from "../components/ui/FormField";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setError("Veuillez saisir une adresse email valide");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await subscribeNewsletter(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-green-600"
      >
        <CheckCircle className="h-5 w-5" />
        <span>Merci !</span>
      </motion.div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <InputField
        name="newsletter_email"
        type="email"
        icon={<Mail className="h-5 w-5" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error || undefined}
        placeholder="Email"
      />
      <button type="submit" disabled={loading} className="btn-primary-sm flex-shrink-0">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "OK"}
      </button>
    </form>
  );
}

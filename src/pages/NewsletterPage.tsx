import { useState } from 'react';
import { motion } from 'framer-motion';
import { subscribeNewsletter } from '../services/content';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribeNewsletter(email);
      setSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span>Merci !</span></motion.div>;

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl" /></div>
      <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'OK'}</button>
    </form>
  );
}
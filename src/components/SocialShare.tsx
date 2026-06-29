import { Facebook, Twitter, Link2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = `https://be-market.tg${url}`;

  const links = [
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'WhatsApp', icon: Share2, url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`, color: 'bg-green-500 hover:bg-green-600' },
    { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`, color: 'bg-sky-500 hover:bg-sky-600' }
  ];

  const copyLink = async () => { await navigator.clipboard.writeText(fullUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-2 border bg-white dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Share2 className="w-5 h-5 dark:text-gray-400" /></button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 p-3 z-50">
              <div className="flex gap-2">
                {links.map(l => (<a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${l.color}`}><l.icon className="w-5 h-5" /></a>))}
                <button onClick={copyLink} className={`w-10 h-10 rounded-lg flex items-center justify-center ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'}`}><Link2 className="w-5 h-5" /></button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 z-40" />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
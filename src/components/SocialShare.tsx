import { Facebook, Twitter, Link2, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SocialShareProps {
  url: string;
  title: string;
}

export function SocialShare({ url, title }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = `${window.location.origin}${url}`;

  const links = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      color: "bg-primary-600 hover:bg-primary-700",
    },
    {
      name: "WhatsApp",
      icon: Share2,
      url: `https://wa.me/?text=${encodeURIComponent(title + " " + fullUrl)}`,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
      color: "bg-sky-500 hover:bg-sky-600",
    },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="icon-btn border-2 border-gray-200 hover:border-primary-200 dark:border-gray-700 dark:hover:border-primary-800"
      >
        <Share2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 z-50 mb-2 rounded-lg border border-gray-100 bg-white p-3 shadow-premium dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex gap-2">
                {links.map((l) => (
                  <a
                    key={l.name}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${l.color}`}
                  >
                    <l.icon className="h-5 w-5" />
                  </a>
                ))}
                <button
                  onClick={copyLink}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${copied ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"}`}
                >
                  <Link2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

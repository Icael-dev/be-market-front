import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEscape } from "../../hooks/useKeyPress";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function AdminDrawer({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl",
}: AdminDrawerProps) {
  useEscape(onClose, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 right-0 top-0 w-full ${maxWidth} z-50 overflow-y-auto bg-white dark:bg-gray-800`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-xl font-bold dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 hover:dark:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

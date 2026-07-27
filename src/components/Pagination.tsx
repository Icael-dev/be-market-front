import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  perPage?: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, perPage, total, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  const start = total !== undefined && perPage !== undefined ? (total === 0 ? 0 : (currentPage - 1) * perPage + 1) : 0;
  const end = total !== undefined && perPage !== undefined ? Math.min(currentPage * perPage, total) : 0;
  const showCounter = total !== undefined && perPage !== undefined && total > 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > delta + 2) pages.push('...');

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) {
        pages.push(i);
      }

      if (currentPage < lastPage - delta - 1) pages.push('...');
      pages.push(lastPage);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-8">
      {showCounter && (
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
          Affichage de <span className="font-semibold text-gray-700 dark:text-gray-300">{start}</span> a <span className="font-semibold text-gray-700 dark:text-gray-300">{end}</span> sur <span className="font-semibold text-gray-700 dark:text-gray-300">{total}</span> resultats
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Precedent</span>
        </button>

        <div className="flex items-center gap-1.5">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <motion.button
                key={index}
                onClick={() => onPageChange(page)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {page}
              </motion.button>
            ) : (
              <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-600 select-none">...</span>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

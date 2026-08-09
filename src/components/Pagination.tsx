import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  perPage?: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  perPage,
  total,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const start =
    total !== undefined && perPage !== undefined
      ? total === 0
        ? 0
        : (currentPage - 1) * perPage + 1
      : 0;
  const end =
    total !== undefined && perPage !== undefined ? Math.min(currentPage * perPage, total) : 0;
  const showCounter = total !== undefined && perPage !== undefined && total > 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > delta + 2) pages.push("...");

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(lastPage - 1, currentPage + delta);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < lastPage - delta - 1) pages.push("...");
      pages.push(lastPage);
    }

    return pages;
  };

  return (
    <div className="mb-8 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
      {showCounter && (
        <p className="whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
          Affichage de{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">{start}</span> a{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">{end}</span> sur{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-300">{total}</span> resultats
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Precedent</span>
        </button>

        <div className="flex items-center gap-1.5">
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <motion.button
                key={index}
                onClick={() => onPageChange(page)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-10 w-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  page === currentPage
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
              >
                {page}
              </motion.button>
            ) : (
              <span
                key={index}
                className="flex h-10 w-10 select-none items-center justify-center text-gray-400 dark:text-gray-600"
              >
                ...
              </span>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

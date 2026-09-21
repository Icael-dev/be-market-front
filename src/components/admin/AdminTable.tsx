import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "../../lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  pageTitle?: string;
  loading?: boolean;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  emptyMessage?: string;
  emptySubMessage?: string;
  onRowClick?: (item: T) => void;
  selectedRowId?: string | null;
  total?: number;
  perPage?: number;
  currentPage?: number;
  lastPage?: number;
  onPageChange?: (page: number) => void;
  renderActions?: (item: T) => React.ReactNode;
  stickyHeader?: boolean;
}

export function AdminTable<T>({
  data,
  columns,
  keyExtractor,
  pageTitle,
  loading = false,
  emptyIcon: EmptyIcon,
  emptyMessage = "Aucune donnee",
  emptySubMessage,
  onRowClick,
  selectedRowId,
  total,
  perPage,
  currentPage,
  lastPage,
  onPageChange,
  renderActions,
  stickyHeader = false,
}: AdminTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const allColumns = renderActions
    ? [...columns, { key: "actions", label: "", render: renderActions }]
    : columns;

  const start =
    total != null && perPage != null && currentPage != null ? (currentPage - 1) * perPage + 1 : 1;
  const end =
    total != null && perPage != null && currentPage != null
      ? Math.min(currentPage * perPage, total)
      : data.length;

  const getPageNumbers = () => {
    const lp = lastPage ?? 1;
    const cp = currentPage ?? 1;
    if (lp <= 5) return Array.from({ length: lp }, (_, i) => i + 1);
    if (cp <= 3) return [1, 2, 3, 4, 5];
    if (cp >= lp - 2) return Array.from({ length: 5 }, (_, i) => lp - 4 + i);
    return Array.from({ length: 5 }, (_, i) => cp - 2 + i);
  };

  return (
    <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {pageTitle && (
        <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-5 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{pageTitle}</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className={stickyHeader ? "sticky top-0 z-10" : ""}>
            <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-800/80">
              {allColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3.5 text-left text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400 ${column.headerClassName || ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {loading ? (
              <tr>
                <td colSpan={allColumns.length} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center">
                    {EmptyIcon && (
                      <EmptyIcon className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                    )}
                    <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                      {emptyMessage}
                    </p>
                    {emptySubMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{emptySubMessage}</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const isSelected = selectedRowId === keyExtractor(item);
                const isHovered = hoveredRow === keyExtractor(item);

                return (
                  <motion.tr
                    key={keyExtractor(item)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
                    onClick={() => onRowClick?.(item)}
                    onMouseEnter={() => setHoveredRow(keyExtractor(item))}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={cn(
                      "group transition-all duration-150",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-primary-50/80 dark:bg-primary-900/15",
                      isHovered && !isSelected && "bg-gray-50/80 dark:bg-gray-700/30",
                      !isSelected && !isHovered && "hover:bg-gray-50/60 dark:hover:bg-gray-700/20"
                    )}
                  >
                    {allColumns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 align-middle text-sm text-gray-700 dark:text-gray-300 ${column.cellClassName || ""}`}
                      >
                        {column.render
                          ? column.render(item)
                          : (item as Record<string, unknown>)[column.key]?.toString() || "-"}
                      </td>
                    ))}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && data.length > 0 && (lastPage ?? 0) > 1 && (
        <div className="border-t border-gray-200 bg-gray-50/30 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/30">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de {start} à {end} sur {total ?? 0} resultats
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange?.((currentPage ?? 1) - 1)}
                disabled={(currentPage ?? 1) === 1}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">Precedent</span>
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === (currentPage ?? 1)
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onPageChange?.((currentPage ?? 1) + 1)}
                disabled={(currentPage ?? 1) === (lastPage ?? 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800"
              >
                <span className="hidden sm:inline">Suivant</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

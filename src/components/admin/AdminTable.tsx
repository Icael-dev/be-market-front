import { motion } from 'framer-motion';
import { useState } from 'react';

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
  emptyMessage = 'Aucune donnee',
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
    ? [...columns, { key: 'actions', label: '', render: renderActions }]
    : columns;

  const start = total != null && perPage != null && currentPage != null
    ? (currentPage - 1) * perPage + 1
    : 1;
  const end = total != null && perPage != null && currentPage != null
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {pageTitle && (
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{pageTitle}</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
              {allColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide ${column.headerClassName || ''}`}
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
                    <div className="animate-spin w-8 h-8 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 rounded-full mb-4"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center">
                    {EmptyIcon && (
                      <EmptyIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    )}
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{emptyMessage}</p>
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
                      !isSelected && !isHovered && "hover:bg-gray-50/60 dark:hover:bg-gray-700/20",
                    )}
                  >
                    {allColumns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-sm text-gray-700 dark:text-gray-300 align-middle ${column.cellClassName || ''}`}
                      >
                        {column.render
                          ? column.render(item)
                          : (item as Record<string, unknown>)[column.key]?.toString() || '-'}
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
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de {start} à {end} sur {total ?? 0} resultats
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange?.((currentPage ?? 1) - 1)}
                disabled={(currentPage ?? 1) === 1}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Precedent</span>
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === (currentPage ?? 1)
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onPageChange?.((currentPage ?? 1) + 1)}
                disabled={(currentPage ?? 1) === (lastPage ?? 1)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span className="hidden sm:inline">Suivant</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

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
  onRowClick?: (item: T) => void;
  selectedRowId?: string | null;
  total?: number;
  perPage?: number;
  currentPage?: number;
  lastPage?: number;
  onPageChange?: (page: number) => void;
  renderActions?: (item: T) => React.ReactNode;
}

export function AdminTable<T>({
  data,
  columns,
  keyExtractor,
  pageTitle,
  loading = false,
  emptyIcon: EmptyIcon,
  emptyMessage = 'Aucune donnee',
  onRowClick,
  selectedRowId,
  total,
  perPage,
  currentPage,
  lastPage,
  onPageChange,
  renderActions,
}: AdminTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  const allColumns = renderActions
    ? [...columns, { key: 'actions', label: '', render: renderActions }]
    : columns;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 overflow-hidden shadow-sm">
      {pageTitle && (
        <div className="px-6 py-5 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <h3 className="text-lg font-bold dark:text-white">{pageTitle}</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
              {allColumns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider ${column.headerClassName || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={allColumns.length} className="px-6 py-12">
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
                      <EmptyIcon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{emptyMessage}</p>
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
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                    onClick={() => onRowClick?.(item)}
                    onMouseEnter={() => setHoveredRow(keyExtractor(item))}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={cn(
                      "group transition-all duration-200",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-primary-50 dark:bg-primary-900/20",
                      isHovered && !isSelected && "bg-gray-50/80 dark:bg-gray-700/40",
                      !isSelected && !isHovered && "hover:bg-gray-50/60 dark:hover:bg-gray-700/30",
                    )}
                  >
                    {allColumns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 align-middle ${column.cellClassName || ''}`}
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
        <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Affichage de {((currentPage ?? 1) - 1) * (perPage ?? 10) + 1} à {Math.min((currentPage ?? 1) * (perPage ?? 10), total ?? 0)} sur {total ?? 0} resultats
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.((currentPage ?? 1) - 1)}
                disabled={(currentPage ?? 1) === 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Precedent</span>
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(lastPage ?? 1, 5) }, (_, i) => {
                  let page = i + 1;
                  const lp = lastPage ?? 1;
                  const cp = currentPage ?? 1;
                  if (lp > 5) {
                    if (cp > 3) {
                      page = Math.min(cp - 2 + i, lp);
                    }
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange?.(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        page === cp
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange?.((currentPage ?? 1) + 1)}
                disabled={(currentPage ?? 1) === (lastPage ?? 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
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

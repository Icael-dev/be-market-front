import { Edit2, Trash2, RotateCcw, Loader2 } from "lucide-react";
import { ToggleActiveButton } from "./ToggleActiveButton";

interface TableActionButtonsProps {
  isActive?: boolean;
  isDeleted?: boolean;
  onToggleActive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  togglingId?: string | null;
  restoringId?: string | null;
  deletingId?: string | null;
  activeLabel?: string;
  inactiveLabel?: string;
  restoreLabel?: string;
  canRestore?: boolean;
}

export function TableActionButtons({
  isActive,
  isDeleted,
  onToggleActive,
  onEdit,
  onDelete,
  onRestore,
  togglingId,
  restoringId,
  deletingId,
  activeLabel = "Désactiver",
  inactiveLabel = "Activer",
  restoreLabel = "Restaurer",
  canRestore = false,
}: TableActionButtonsProps) {
  const isToggling = togglingId != null;
  const isRestoring = restoringId != null;

  return (
    <div className="flex items-center justify-end gap-2">
      {canRestore && isDeleted ? (
        <button
          type="button"
          onClick={onRestore}
          disabled={isRestoring}
          className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-100 px-3 py-2 text-blue-700 transition-colors hover:bg-blue-200 disabled:opacity-50 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
        >
          {isRestoring ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          {restoreLabel}
        </button>
      ) : (
        <>
          {onToggleActive && (
            <ToggleActiveButton
              isActive={!!isActive}
              onToggle={onToggleActive}
              disabled={isToggling}
              activeLabel={activeLabel}
              inactiveLabel={inactiveLabel}
            />
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Edit2 className="h-6 w-6" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deletingId != null}
              className="rounded-lg border border-red-300 bg-red-100 p-3 text-red-700 transition-colors hover:bg-red-200 disabled:opacity-50 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
            >
              {deletingId != null ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Trash2 className="h-6 w-6" />
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

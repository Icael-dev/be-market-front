import { Loader2, Power } from "lucide-react";
import { cn } from "../../lib/utils";

interface ToggleActiveButtonProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function ToggleActiveButton({
  isActive,
  onToggle,
  disabled,
  activeLabel = "Désactiver",
  inactiveLabel = "Activer",
}: ToggleActiveButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={isActive ? activeLabel : inactiveLabel}
      aria-label={isActive ? activeLabel : inactiveLabel}
      className={cn(
        "rounded-lg border p-3 transition-colors disabled:opacity-50",
        isActive
          ? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
          : "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      )}
    >
      {disabled ? <Loader2 className="h-6 w-6 animate-spin" /> : <Power className="h-6 w-6" />}
    </button>
  );
}

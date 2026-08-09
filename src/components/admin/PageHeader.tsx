import { ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="sticky top-0 z-30 -mx-3 mb-4 border-b border-gray-200 bg-gray-50/95 px-3 py-2 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
          {subtitle && <p className="mt-1 dark:text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title={theme === "light" ? "Mode sombre" : "Mode clair"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

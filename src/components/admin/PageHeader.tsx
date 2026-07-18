import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="sticky top-20 lg:top-0 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
          {subtitle && <p className="dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  premium?: boolean;
  inset?: boolean;
  as?: 'div' | 'section' | 'article';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, premium, inset, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-card transition-all duration-300',
        premium && 'rounded-lg border-gray-200/70 dark:border-gray-800 shadow-premium',
        inset && 'bg-gray-50 dark:bg-gray-800/60 border-gray-100 dark:border-gray-800',
        hover && 'hover:shadow-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

interface IconBoxProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'primary' | 'gold' | 'green' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

const toneClasses: Record<NonNullable<IconBoxProps['tone']>, string> = {
  primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  gold: 'bg-gold-50 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400',
  green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  gray: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
};

const sizeClasses: Record<NonNullable<IconBoxProps['size']>, string> = {
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

export const IconBox = forwardRef<HTMLDivElement, IconBoxProps>(
  ({ tone = 'primary', size = 'md', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('inline-flex items-center justify-center rounded-lg', toneClasses[tone], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  )
);

IconBox.displayName = 'IconBox';

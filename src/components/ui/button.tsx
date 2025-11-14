'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variantStyles = {
      primary:
        'bg-stone-900 text-stone-50 hover:bg-stone-800 shadow focus-visible:ring-2 focus-visible:ring-stone-400',
      secondary:
        'bg-white text-stone-900 border border-stone-200 hover:border-stone-300 focus-visible:ring-2 focus-visible:ring-stone-300 shadow-sm',
      ghost:
        'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 focus-visible:ring-2 focus-visible:ring-stone-400',
    };

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5',
      md: 'text-sm px-3.5 py-2.5',
      lg: 'text-base px-4 py-3',
      icon: 'p-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[1.25rem] font-medium transition-all duration-150 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

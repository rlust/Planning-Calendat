'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'accent';
};

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  const tones = {
    neutral: 'bg-stone-200/80 text-stone-700',
    accent: 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

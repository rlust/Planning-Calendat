'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  if (typeof document === 'undefined') return null;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 px-4 py-8 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6 shadow-2xl shadow-stone-950/10 dark:border-stone-800 dark:bg-stone-900/95',
          className,
        )}
      >
        <div className="space-y-1">
          {title ? (
            <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-stone-500">{description}</p>
          ) : null}
        </div>
        <div className="mt-5 space-y-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

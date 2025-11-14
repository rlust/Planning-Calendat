'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/components/providers/app-data-provider';

export default function HomePage() {
  const router = useRouter();
  const { state, ready } = useAppData();

  useEffect(() => {
    if (!ready) return;
    const fallback = '/kanban';
    const target = state.lastView ? `/${state.lastView}` : fallback;
    router.replace(target);
  }, [ready, router, state.lastView]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 text-stone-500">
      <p className="text-sm">Loading your workspace…</p>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CheckSquare,
  Columns3,
  Menu,
  Plus,
  Search,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuickAddDialog } from './quick-add-dialog';
import { SettingsPanel } from './settings-panel';
import { useAppData } from '@/components/providers/app-data-provider';
import type { ViewKey } from '@/lib/types';

type NavItem = { key: ViewKey; href: string; label: string; icon: typeof Columns3 };

const navItems: NavItem[] = [
  { key: 'kanban', href: '/kanban', label: 'Kanban', icon: Columns3 },
  { key: 'todos', href: '/todos', label: 'Todos', icon: CheckSquare },
  { key: 'calendar', href: '/calendar', label: 'Calendar', icon: CalendarDays },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, setLastView } = useAppData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    const view = navItems.find((item) => pathname.startsWith(item.href));
    if (view) {
      setLastView(view.key);
    }
  }, [pathname, setLastView]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  const densityClasses =
    state.settings.density === 'compact'
      ? 'px-4 py-3 text-sm'
      : 'px-6 py-4 text-base';

  return (
    <div className="flex min-h-screen bg-stone-100 text-stone-900">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSettings={() => setSettingsOpen(true)}
      />
      <div className="flex flex-1 flex-col">
        <header
          className={cn(
            'flex items-center justify-between border-b border-stone-200 bg-stone-50/80',
            densityClasses,
          )}
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden text-sm text-stone-500 sm:block">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="relative hidden max-w-sm flex-1 items-center md:flex">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                placeholder="Search across work..."
                className="pl-9"
                aria-label="Global search"
              />
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              className="gap-2"
              onClick={() => setQuickAddOpen(true)}
              aria-label="Open quick add"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick add</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <QuickAddDialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function Sidebar({
  open,
  onClose,
  onSettings,
}: {
  open: boolean;
  onClose: () => void;
  onSettings: () => void;
}) {
  const pathname = usePathname();

  const nav = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        active: pathname.startsWith(item.href),
      })),
    [pathname],
  );

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-stone-200 bg-white/95 px-6 py-8 shadow-lg backdrop-blur lg:static lg:flex lg:w-64 lg:translate-x-0 lg:flex-col lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400">
              Atlas
            </p>
            <p className="text-lg font-semibold text-stone-900">
              Productivity
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </Button>
        </div>
        <nav className="mt-8 space-y-1 text-sm font-medium text-stone-500">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:text-stone-900',
                item.active
                  ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/20'
                  : 'text-stone-600 hover:bg-stone-100',
              )}
              onClick={() => onClose()}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
            <p className="text-sm font-medium text-stone-800">Weekly focus</p>
            <p className="mt-1 text-xs text-stone-500">
              Keep the workflow small and meaningful.
            </p>
            <Button
              variant="ghost"
              className="mt-4 w-full justify-between text-sm text-stone-700"
              onClick={onSettings}
            >
              Settings
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-stone-950/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}

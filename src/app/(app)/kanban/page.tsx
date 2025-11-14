import { Metadata } from 'next';
import { KanbanBoard } from '@/components/kanban/kanban-board';

export const metadata: Metadata = {
  title: 'Kanban · Atlas',
};

export default function KanbanPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          Flow
        </p>
        <h1 className="text-2xl font-semibold text-stone-900">
          Kanban board
        </h1>
        <p className="text-sm text-stone-500">
          Visualize progress across the week. Drag cards to keep teammates in the loop.
        </p>
      </header>
      <KanbanBoard />
    </section>
  );
}

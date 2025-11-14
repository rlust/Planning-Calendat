import { Metadata } from 'next';
import { TodoList } from '@/components/todos/todo-list';

export const metadata: Metadata = {
  title: 'Todos · Atlas',
};

export default function TodosPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          Focus
        </p>
        <h1 className="text-2xl font-semibold text-stone-900">Todo list</h1>
        <p className="text-sm text-stone-500">
          Capture and organize tasks by urgency. Keep the quick-add input close.
        </p>
      </header>
      <TodoList />
    </section>
  );
}

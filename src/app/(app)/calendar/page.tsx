import { Metadata } from 'next';
import { CalendarView } from '@/components/calendar/calendar-view';

export const metadata: Metadata = {
  title: 'Calendar · Atlas',
};

export default function CalendarPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          Rhythm
        </p>
        <h1 className="text-2xl font-semibold text-stone-900">Calendar</h1>
        <p className="text-sm text-stone-500">
          See events next to tasks with dates. Keep planning fluid.
        </p>
      </header>
      <CalendarView />
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAppData } from '@/components/providers/app-data-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type CalendarItem = {
  id: string;
  title: string;
  type: 'event' | 'task';
  start?: string;
  end?: string;
};

type ViewMode = 'month' | 'week';

export function CalendarView() {
  const { state, addEvent } = useAppData();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [form, setForm] = useState({ title: '', start: '', end: '' });
  const [view, setView] = useState<ViewMode>('month');

  const daysMatrix = useMemo(() => buildMatrix(current), [current]);
  const weekDays = useMemo(() => {
    const start = startOfWeek(current, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
  }, [current]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    state.events.forEach((event) => {
      const key = format(new Date(event.date), 'yyyy-MM-dd');
      const list = map.get(key) ?? [];
      list.push({
        id: event.id,
        title: event.title,
        type: 'event',
        start: event.start,
        end: event.end,
      });
      map.set(key, list);
    });
    state.tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = format(new Date(task.dueDate), 'yyyy-MM-dd');
      const list = map.get(key) ?? [];
      list.push({
        id: task.id,
        title: task.title,
        type: 'task',
      });
      map.set(key, list);
    });
    return map;
  }, [state.events, state.tasks]);

  const selectedKey = format(selected, 'yyyy-MM-dd');
  const selectedItems = itemsByDay.get(selectedKey) ?? [];

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addEvent({
      title: form.title,
      date: selected.toISOString(),
      start: form.start,
      end: form.end,
    });
    setForm({ title: '', start: '', end: '' });
  };

  const handleViewChange = (mode: ViewMode) => {
    setView(mode);
    setCurrent(selected);
  };

  const handlePrev = () => {
    setCurrent((prev) =>
      view === 'month' ? addMonths(prev, -1) : addDays(prev, -7),
    );
  };

  const handleNext = () => {
    setCurrent((prev) =>
      view === 'month' ? addMonths(prev, 1) : addDays(prev, 7),
    );
  };

  const title =
    view === 'month'
      ? format(current, 'MMMM yyyy')
      : `${format(weekDays[0], 'MMM d')} – ${format(
          weekDays[6],
          weekDays[0].getMonth() === weekDays[6].getMonth() ? 'd' : 'MMM d',
        )}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-3xl border border-stone-200 bg-white/80 p-4 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Calendar
            </p>
            <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-2xl border border-stone-200 bg-white p-1 text-xs font-medium">
              {(['month', 'week'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(
                    'rounded-xl px-3 py-1 capitalize transition',
                    view === mode
                      ? 'bg-stone-900 text-white shadow'
                      : 'text-stone-500',
                  )}
                  onClick={() => handleViewChange(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={handlePrev}
              aria-label="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleNext}
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </header>
        {view === 'month' ? (
          <>
            <div className="mt-4 grid grid-cols-7 text-xs font-semibold uppercase tracking-wide text-stone-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="px-2 py-1 text-center">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-sm">
              {daysMatrix.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const items = itemsByDay.get(key) ?? [];
                const isCurrentMonth = isSameMonth(day, current);
                const isSelected = isSameDay(day, selected);
                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      'min-h-[90px] rounded-2xl border p-2 text-left transition',
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-lg'
                        : 'border-stone-200 bg-white text-stone-700',
                      !isCurrentMonth && 'opacity-40',
                    )}
                    onClick={() => setSelected(day)}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{day.getDate()}</span>
                      {isSameDay(day, new Date()) ? (
                        <span className="text-[10px] uppercase tracking-wide text-stone-400">
                          Today
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 space-y-1">
                      {items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            'truncate rounded-lg px-2 py-1 text-xs',
                            item.type === 'event'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-200 text-stone-700',
                          )}
                        >
                          {item.title}
                        </div>
                      ))}
                      {items.length > 3 ? (
                        <p className="text-[11px] text-stone-500">
                          +{items.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-7">
            {weekDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const items = itemsByDay.get(key) ?? [];
              const isSelected = isSameDay(day, selected);
              return (
                <div
                  key={key}
                  className={cn(
                    'rounded-2xl border p-3 transition',
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-100 bg-white',
                  )}
                >
                  <button
                    className="w-full text-left"
                    onClick={() => setSelected(day)}
                  >
                    <p className="text-xs uppercase tracking-wide text-stone-500">
                      {format(day, 'EEE')}
                    </p>
                    <p
                      className={cn(
                        'text-lg font-semibold',
                        isSelected ? 'text-white' : 'text-stone-900',
                      )}
                    >
                      {format(day, 'MMM d')}
                    </p>
                  </button>
                  <div className="mt-3 space-y-2">
                    {items.length ? (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            'rounded-xl px-3 py-2 text-xs font-medium',
                            item.type === 'event'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-200 text-stone-700',
                          )}
                        >
                          <p>{item.title}</p>
                          {item.start ? (
                            <p className="text-[11px] opacity-80">
                              {item.start}
                              {item.end ? ` → ${item.end}` : null}
                            </p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <p
                        className={cn(
                          'text-xs',
                          isSelected ? 'text-stone-200' : 'text-stone-400',
                        )}
                      >
                        Free
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <aside className="rounded-3xl border border-stone-200 bg-white/90 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          {format(selected, 'EEE, MMM d')}
        </p>
        <h3 className="text-xl font-semibold text-stone-900">
          {selectedItems.length ? 'Today’s plan' : 'No plans yet'}
        </h3>
        <div className="mt-4 space-y-3">
          {selectedItems.length ? (
            selectedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2"
              >
                <p className="text-sm font-medium text-stone-800">
                  {item.title}
                </p>
                <p className="text-xs text-stone-500">
                  {item.type === 'event' ? 'Event' : 'Task'}
                  {item.start ? (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.start}
                      {item.end ? ` → ${item.end}` : null}
                    </span>
                  ) : null}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500">
              Light day — schedule what matters.
            </p>
          )}
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-xs uppercase tracking-wide text-stone-500">
            Quick event
          </p>
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
          <div className="flex gap-2">
            <Input
              type="time"
              value={form.start}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, start: event.target.value }))
              }
            />
            <Input
              type="time"
              value={form.end}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, end: event.target.value }))
              }
            />
          </div>
          <Button className="w-full" onClick={handleAdd}>
            Add to calendar
          </Button>
        </div>
      </aside>
    </div>
  );
}

function buildMatrix(current: Date) {
  const start = startOfWeek(startOfMonth(current), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(current), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

'use client';

import { useMemo, useState } from 'react';
import { format, isAfter, isBefore, isToday, parseISO, startOfDay } from 'date-fns';
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { useAppData } from '@/components/providers/app-data-provider';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';

type GroupKey = 'today' | 'upcoming' | 'someday';

export function TodoList() {
  const { state, addTask, toggleTask, updateTask, deleteTask } = useAppData();
  const [query, setQuery] = useState('');
  const [composer, setComposer] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDraft, setTaskDraft] = useState({
    title: '',
    notes: '',
    dueDate: '',
    priority: 'medium',
  });
  const [collapsed, setCollapsed] = useState<Record<GroupKey, boolean>>({
    today: false,
    upcoming: false,
    someday: false,
  });

  const grouped = useMemo(() => {
    const tasks = state.tasks
      .filter((task) =>
        task.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      });

    const today: Task[] = [];
    const upcoming: Task[] = [];
    const someday: Task[] = [];
    const todayStart = startOfDay(new Date());

    tasks.forEach((task) => {
      if (!task.dueDate) {
        someday.push(task);
        return;
      }
      const date = parseISO(task.dueDate);
      if (isToday(date) || isBefore(date, todayStart)) {
        today.push(task);
      } else if (isAfter(date, todayStart)) {
        upcoming.push(task);
      } else {
        someday.push(task);
      }
    });

    return { today, upcoming, someday };
  }, [query, state.tasks]);

  const handleAdd = () => {
    if (!composer.trim()) return;
    addTask({ title: composer });
    setComposer('');
  };

  const sections: { key: GroupKey; label: string; tasks: Task[] }[] = [
    { key: 'today', label: 'Today', tasks: grouped.today },
    { key: 'upcoming', label: 'Upcoming', tasks: grouped.upcoming },
    { key: 'someday', label: 'Someday', tasks: grouped.someday },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">
            Quick capture
          </p>
          <p className="text-sm text-stone-600">
            Enter to create and keep your mind clean.
          </p>
        </div>
        <div className="mt-3 flex flex-1 items-center gap-3 sm:mt-0 sm:max-w-md">
          <Input
            placeholder="Add a task"
            value={composer}
            onChange={(event) => setComposer(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-wrap gap-4 text-sm text-stone-500">
          <span>
            {state.tasks.filter((task) => task.completed).length} completed
          </span>
          <span>{state.tasks.length} total</span>
        </div>
        <Input
          placeholder="Filter"
          className="mt-4 sm:max-w-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <section key={section.key}>
              <header
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/90 px-4 py-2"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [section.key]: !prev[section.key],
                  }))
                }
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-500">
                    {section.label}
                  </p>
                  <p className="text-sm text-stone-400">
                    {section.tasks.length} items
                  </p>
                </div>
                {collapsed[section.key] ? (
                  <ChevronDown className="h-4 w-4 text-stone-400" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-stone-400" />
                )}
              </header>
              {!collapsed[section.key] ? (
                <ul className="mt-4 space-y-3">
                  {section.tasks.length === 0 ? (
                    <p className="text-sm text-stone-400">
                      Nothing here yet.
                    </p>
                  ) : (
                    section.tasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTask(task.id)}
                        onEdit={() => {
                          setSelectedTask(task);
                          setTaskDraft({
                            title: task.title,
                            notes: task.notes ?? '',
                            dueDate: task.dueDate
                              ? new Date(task.dueDate).toISOString().split('T')[0]
                              : '',
                            priority: task.priority ?? 'medium',
                          });
                        }}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))
                  )}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
      <TaskModal
        task={selectedTask}
        draft={selectedTask ? taskDraft : null}
        onChangeDraft={(next) => setTaskDraft(next)}
        onClose={() => setSelectedTask(null)}
        onSave={updateTask}
      />
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const overdue =
    task.dueDate && parseISO(task.dueDate) < startOfDay(new Date());
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-white px-4 py-3 shadow-sm">
      <button
        className={cn(
          'h-5 w-5 rounded-full border-2',
          task.completed
            ? 'border-stone-900 bg-stone-900 text-white'
            : 'border-stone-300',
        )}
        onClick={onToggle}
        aria-label="Toggle task"
      >
        {task.completed ? '✓' : ''}
      </button>
      <div className="flex flex-1 flex-col">
        <p
          className={cn(
            'text-sm font-medium',
            task.completed ? 'text-stone-400 line-through' : 'text-stone-800',
          )}
        >
          {task.title}
        </p>
        {task.dueDate ? (
          <p
            className={cn(
              'text-xs',
              overdue ? 'text-red-500' : 'text-stone-500',
            )}
          >
            {format(new Date(task.dueDate), 'MMM d')}
          </p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    </li>
  );
}

function TaskModal({
  task,
  draft,
  onChangeDraft,
  onClose,
  onSave,
}: {
  task: Task | null;
  draft:
    | {
        title: string;
        notes: string;
        dueDate: string;
        priority: string;
      }
    | null;
  onChangeDraft: (draft: {
    title: string;
    notes: string;
    dueDate: string;
    priority: string;
  }) => void;
  onClose: () => void;
  onSave: (id: string, input: Partial<Task>) => void;
}) {
  if (!task || !draft) return null;

  return (
    <Modal open onClose={onClose} title="Edit task">
      <Input
        placeholder="Title"
        value={draft.title}
        onChange={(event) =>
          onChangeDraft({ ...draft, title: event.target.value })
        }
      />
      <Textarea
        placeholder="Notes"
        rows={4}
        value={draft.notes}
        onChange={(event) =>
          onChangeDraft({ ...draft, notes: event.target.value })
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-stone-500">
            Due date
          </label>
          <Input
            type="date"
            value={draft.dueDate}
            onChange={(event) =>
              onChangeDraft({ ...draft, dueDate: event.target.value })
            }
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-stone-500">
            Priority
          </label>
          <select
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"
            value={draft.priority}
            onChange={(event) =>
              onChangeDraft({ ...draft, priority: event.target.value })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onSave(task.id, {
              title: draft.title,
              notes: draft.notes,
              dueDate: draft.dueDate
                ? new Date(draft.dueDate).toISOString()
                : undefined,
              priority: draft.priority as Task['priority'],
            });
            onClose();
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useAppData } from '@/components/providers/app-data-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';

type QuickAddDialogProps = {
  open: boolean;
  onClose: () => void;
};

const TABS = [
  { id: 'todo', label: 'Todo' },
  { id: 'card', label: 'Kanban Card' },
  { id: 'event', label: 'Event' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function QuickAddDialog({ open, onClose }: QuickAddDialogProps) {
  const { addTask, addCard, addEvent, state } = useAppData();
  const [tab, setTab] = useState<TabId>('todo');
  const [form, setForm] = useState({
    title: '',
    detail: '',
    date: '',
    columnId: '',
  });

  const columnOptions = useMemo(
    () => state.board.columns.map((column) => ({ id: column.id, title: column.title })),
    [state.board.columns],
  );

  const resetForm = () => {
    setForm({
      title: '',
      detail: '',
      date: '',
      columnId: columnOptions[0]?.id ?? '',
    });
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (tab === 'todo') {
      addTask({ title: form.title, notes: form.detail, dueDate: form.date });
    } else if (tab === 'card') {
      const targetColumn = form.columnId || columnOptions[0]?.id;
      if (!targetColumn) return;
      addCard(targetColumn, {
        title: form.title,
        description: form.detail,
        dueDate: form.date,
      });
    } else {
      addEvent({
        title: form.title,
        date: form.date || new Date().toISOString(),
        notes: form.detail,
      });
    }
    resetForm();
    onClose();
  };

  const placeholder =
    tab === 'todo'
      ? 'Describe the task...'
      : tab === 'card'
        ? 'What needs to move forward?'
        : 'Notes or context for the event';

  return (
    <Modal open={open} onClose={onClose} title="Quick add" description="Capture work without leaving your flow.">
      <div className="flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
              tab === item.id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-500'
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <Input
          placeholder={`Title for the ${tab}`}
          autoFocus
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        />
        <Textarea
          placeholder={placeholder}
          rows={3}
          value={form.detail}
          onChange={(e) => setForm((prev) => ({ ...prev, detail: e.target.value }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-stone-500">Date</label>
            <Input
              type="date"
              value={form.date ? format(new Date(form.date), 'yyyy-MM-dd') : ''}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
            />
          </div>
          {tab === 'card' ? (
            <div>
              <label className="text-xs uppercase tracking-wide text-stone-500">Column</label>
              <select
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm"
                value={form.columnId || columnOptions[0]?.id}
                onChange={(e) => setForm((prev) => ({ ...prev, columnId: e.target.value }))}
              >
                {columnOptions.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save</Button>
      </div>
    </Modal>
  );
}

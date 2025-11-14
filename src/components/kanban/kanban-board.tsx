'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { PenSquare, Trash2 } from 'lucide-react';
import { useAppData } from '@/components/providers/app-data-provider';
import type { KanbanCard, KanbanColumn } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';

type ColumnProps = {
  column: KanbanColumn;
  cards: KanbanCard[];
  onAddCard: (title: string) => void;
  onDropCard: (cardId: string, targetIndex?: number) => void;
  onEdit: (card: KanbanCard) => void;
};

type CardDraft = {
  title: string;
  description: string;
  dueDate: string;
  tags: string;
};

export function KanbanBoard() {
  const { state, addCard, moveCard, updateCard, deleteCard } = useAppData();
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [cardDraft, setCardDraft] = useState<CardDraft | null>(null);

  const columnCards = useMemo(() => {
    return state.board.columns.map((column) => ({
      column,
      cards: column.cardIds
        .map((id) => state.cards[id])
        .filter(Boolean) as KanbanCard[],
    }));
  }, [state.board.columns, state.cards]);

  const handleAdd = (columnId: string, title: string) => {
    if (!title.trim()) return;
    addCard(columnId, { title, description: '' });
  };

  const handleDrop = (
    cardId: string,
    targetColumnId: string,
    targetIndex?: number,
  ) => {
    moveCard(cardId, targetColumnId, targetIndex);
  };

  const handleSaveCard = (cardId: string, input: Partial<KanbanCard>) => {
    updateCard(cardId, input);
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCard(cardId);
    setEditingCard(null);
  };

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {columnCards.map(({ column, cards }) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          cards={cards}
          onAddCard={(title) => handleAdd(column.id, title)}
          onDropCard={(cardId, index) => handleDrop(cardId, column.id, index)}
          onEdit={(card) => {
            setEditingCard(card);
            setCardDraft({
              title: card.title,
              description: card.description ?? '',
              dueDate: card.dueDate
                ? new Date(card.dueDate).toISOString().split('T')[0]
                : '',
              tags: card.tags?.join(', ') ?? '',
            });
          }}
        />
      ))}
      <CardEditor
        card={editingCard}
        draft={cardDraft}
        onChangeDraft={(next) => setCardDraft(next)}
        onClose={() => {
          setEditingCard(null);
          setCardDraft(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />
    </div>
  );
}

function KanbanColumnComponent({
  column,
  cards,
  onAddCard,
  onDropCard,
  onEdit,
}: ColumnProps) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAddCard(title);
    setTitle('');
    setAdding(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, index?: number) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData('text/card-id');
    if (!cardId) return;
    onDropCard(cardId, index);
  };

  return (
    <div className="flex flex-col rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-md shadow-stone-900/5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {column.title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdding(true)}
          className="text-xs font-medium text-stone-500"
        >
          + Card
        </Button>
      </div>
      <div
        className="mt-5 flex flex-1 flex-col gap-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(event)}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            data-card-id={card.id}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, index)}
          >
            <KanbanCardComponent card={card} onEdit={() => onEdit(card)} />
          </div>
        ))}
      </div>
      {adding ? (
        <div className="mt-5 space-y-3 rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50/80 p-4">
          <Input
            placeholder="Card title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KanbanCardComponent({
  card,
  onEdit,
}: {
  card: KanbanCard;
  onEdit: () => void;
}) {
  return (
        <article
          className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/card-id', card.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-semibold text-stone-900 tracking-tight">
          {card.title}
        </h4>
        <PenSquare className="h-4 w-4 text-stone-300" />
      </div>
      {card.description ? (
        <p className="mt-2 text-sm text-stone-500 leading-snug line-clamp-3">
          {card.description}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {card.tags?.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
        {card.dueDate ? (
          <Badge tone="accent">{format(new Date(card.dueDate), 'MMM d')}</Badge>
        ) : null}
      </div>
    </article>
  );
}

function CardEditor({
  card,
  draft,
  onChangeDraft,
  onClose,
  onSave,
  onDelete,
}: {
  card: KanbanCard | null;
  draft: CardDraft | null;
  onChangeDraft: (draft: CardDraft | null) => void;
  onClose: () => void;
  onSave: (id: string, input: Partial<KanbanCard>) => void;
  onDelete: (id: string) => void;
}) {
  if (!card || !draft) return null;

  const handleSave = () => {
    onSave(card.id, {
      title: draft.title,
      description: draft.description,
      dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString() : undefined,
      tags: draft.tags
        ? draft.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    });
    onClose();
  };

  return (
    <Modal open={Boolean(card)} onClose={onClose} title="Edit card">
      <div className="space-y-4">
        <Input
          placeholder="Title"
          value={draft.title}
          onChange={(event) =>
            onChangeDraft({ ...draft, title: event.target.value })
          }
        />
        <Textarea
          placeholder="Details"
          rows={4}
          value={draft.description}
          onChange={(event) =>
            onChangeDraft({ ...draft, description: event.target.value })
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
              Tags
            </label>
            <Input
              placeholder="Design, QA"
              value={draft.tags}
              onChange={(event) =>
                onChangeDraft({ ...draft, tags: event.target.value })
              }
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-600"
          onClick={() => onDelete(card.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}

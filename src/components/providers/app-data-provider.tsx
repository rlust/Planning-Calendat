'use client';

import { nanoid } from 'nanoid';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { defaultState } from '@/lib/initial-data';
import { usePersistentState } from '@/lib/storage';
import type {
  AppState,
  CalendarEvent,
  KanbanCard,
  Settings,
  Task,
  ViewKey,
} from '@/lib/types';

type CardInput = Pick<KanbanCard, 'title' | 'description' | 'dueDate' | 'tags'>;
type TaskInput = Pick<Task, 'title' | 'notes' | 'dueDate' | 'priority' | 'tags'>;
type EventInput = Pick<
  CalendarEvent,
  'title' | 'date' | 'start' | 'end' | 'notes' | 'color'
>;

type AppActions = {
  addCard: (columnId: string, input: CardInput) => void;
  updateCard: (id: string, input: Partial<KanbanCard>) => void;
  moveCard: (cardId: string, targetColumnId: string, index?: number) => void;
  deleteCard: (cardId: string) => void;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addEvent: (input: EventInput) => void;
  updateEvent: (id: string, input: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setLastView: (view: ViewKey) => void;
  setSettings: (input: Partial<Settings>) => void;
  resetWorkspace: () => void;
};

type AppDataValue = {
  ready: boolean;
  state: AppState;
} & AppActions;

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { state, setState, hydrated, reset } = usePersistentState<AppState>(
    'productivity.app',
    defaultState,
  );

  const addCard = useCallback<AppActions['addCard']>(
    (columnId, input) => {
      const card: KanbanCard = {
        id: nanoid(),
        title: input.title.trim() || 'Untitled',
        description: input.description?.trim(),
        dueDate: input.dueDate,
        tags: input.tags ?? [],
      };

      setState((prev) => {
        const columns = prev.board.columns.map((column) =>
          column.id === columnId
            ? { ...column, cardIds: [...column.cardIds, card.id] }
            : column,
        );
        return {
          ...prev,
          board: { ...prev.board, columns },
          cards: { ...prev.cards, [card.id]: card },
        };
      });
    },
    [setState],
  );

  const updateCard = useCallback<AppActions['updateCard']>(
    (id, input) => {
      setState((prev) => {
        if (!prev.cards[id]) return prev;
        return {
          ...prev,
          cards: {
            ...prev.cards,
            [id]: { ...prev.cards[id], ...input },
          },
        };
      });
    },
    [setState],
  );

  const moveCard = useCallback<AppActions['moveCard']>(
    (cardId, targetColumnId, index) => {
      setState((prev) => {
        const columns = prev.board.columns.map((column) => {
          let cardIds = column.cardIds.filter((id) => id !== cardId);
          if (column.id === targetColumnId) {
            const next = [...cardIds];
            const safeIndex =
              index !== undefined
                ? Math.max(0, Math.min(index, next.length))
                : next.length;
            next.splice(safeIndex, 0, cardId);
            cardIds = next;
          }
          return { ...column, cardIds };
        });
        return {
          ...prev,
          board: { ...prev.board, columns },
        };
      });
    },
    [setState],
  );

  const deleteCard = useCallback<AppActions['deleteCard']>(
    (cardId) => {
      setState((prev) => {
        const nextCards = { ...prev.cards };
        delete nextCards[cardId];
        const columns = prev.board.columns.map((column) => ({
          ...column,
          cardIds: column.cardIds.filter((id) => id !== cardId),
        }));
        return {
          ...prev,
          cards: nextCards,
          board: { ...prev.board, columns },
        };
      });
    },
    [setState],
  );

  const addTask = useCallback<AppActions['addTask']>(
    (input) => {
      const task: Task = {
        id: nanoid(),
        title: input.title.trim() || 'Untitled',
        notes: input.notes?.trim(),
        dueDate: input.dueDate,
        priority: input.priority,
        tags: input.tags ?? [],
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, task],
      }));
    },
    [setState],
  );

  const updateTask = useCallback<AppActions['updateTask']>(
    (id, input) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === id ? { ...task, ...input } : task,
        ),
      }));
    },
    [setState],
  );

  const toggleTask = useCallback<AppActions['toggleTask']>(
    (id) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        ),
      }));
    },
    [setState],
  );

  const deleteTask = useCallback<AppActions['deleteTask']>(
    (id) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== id),
      }));
    },
    [setState],
  );

  const addEvent = useCallback<AppActions['addEvent']>(
    (input) => {
      const event: CalendarEvent = {
        id: nanoid(),
        title: input.title.trim() || 'Untitled',
        date: input.date,
        start: input.start,
        end: input.end,
        notes: input.notes?.trim(),
        color: input.color,
      };
      setState((prev) => ({
        ...prev,
        events: [...prev.events, event],
      }));
    },
    [setState],
  );

  const updateEvent = useCallback<AppActions['updateEvent']>(
    (id, input) => {
      setState((prev) => ({
        ...prev,
        events: prev.events.map((event) =>
          event.id === id ? { ...event, ...input } : event,
        ),
      }));
    },
    [setState],
  );

  const deleteEvent = useCallback<AppActions['deleteEvent']>(
    (id) => {
      setState((prev) => ({
        ...prev,
        events: prev.events.filter((event) => event.id !== id),
      }));
    },
    [setState],
  );

  const setLastView = useCallback<AppActions['setLastView']>(
    (view) => {
      setState((prev) => ({
        ...prev,
        lastView: view,
      }));
    },
    [setState],
  );

  const setSettings = useCallback<AppActions['setSettings']>(
    (input) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...input },
      }));
    },
    [setState],
  );

  const resetWorkspace = useCallback(() => {
    reset();
  }, [reset]);

  const value = useMemo<AppDataValue>(
    () => ({
      ready: hydrated,
      state,
      addCard,
      updateCard,
      moveCard,
      deleteCard,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      addEvent,
      updateEvent,
      deleteEvent,
      setLastView,
      setSettings,
      resetWorkspace,
    }),
    [
      hydrated,
      state,
      addCard,
      updateCard,
      moveCard,
      deleteCard,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      addEvent,
      updateEvent,
      deleteEvent,
      setLastView,
      setSettings,
      resetWorkspace,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}

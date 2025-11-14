export type ViewKey = 'kanban' | 'todos' | 'calendar';

export type Priority = 'low' | 'medium' | 'high';

export type KanbanColumn = {
  id: string;
  title: string;
  cardIds: string[];
};

export type KanbanBoard = {
  id: string;
  name: string;
  columns: KanbanColumn[];
};

export type KanbanCard = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  tags?: string[];
};

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  priority?: Priority;
  completed: boolean;
  tags?: string[];
  createdAt: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // ISO date
  start?: string; // HH:mm
  end?: string;
  notes?: string;
  color?: string;
};

export type Settings = {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
};

export type AppState = {
  version: number;
  board: KanbanBoard;
  cards: Record<string, KanbanCard>;
  tasks: Task[];
  events: CalendarEvent[];
  settings: Settings;
  lastView: ViewKey;
};

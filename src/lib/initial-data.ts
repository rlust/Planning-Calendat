import { nanoid } from "nanoid";
import type { AppState, KanbanBoard, KanbanCard, Task, CalendarEvent } from "./types";

const sampleCards: Record<string, KanbanCard> = {};

const board: KanbanBoard = {
  id: "board-default",
  name: "Productivity",
  columns: [
    { id: "col-backlog", title: "Backlog", cardIds: [] },
    { id: "col-progress", title: "In Progress", cardIds: [] },
    { id: "col-review", title: "Review", cardIds: [] },
    { id: "col-done", title: "Done", cardIds: [] },
  ],
};

const backlogCard = {
  id: nanoid(),
  title: "Explore minimal typography",
  description: "Define spacing scale and check readable font pairings.",
  dueDate: new Date().toISOString(),
  tags: ["design"],
};
const progressCard = {
  id: nanoid(),
  title: "Wire kanban interactions",
  description: "Plan drag targets and editing surface.",
  tags: ["product"],
};
const reviewCard = {
  id: nanoid(),
  title: "QA calendar UX",
  description: "Verify keyboard navigation and date math.",
  tags: ["qa"],
};

sampleCards[backlogCard.id] = backlogCard;
sampleCards[progressCard.id] = progressCard;
sampleCards[reviewCard.id] = reviewCard;

board.columns[0].cardIds.push(backlogCard.id);
board.columns[1].cardIds.push(progressCard.id);
board.columns[2].cardIds.push(reviewCard.id);

const tasks: Task[] = [
  {
    id: nanoid(),
    title: "Outline MVP tasks",
    notes: "List out must-have workflows across tools.",
    dueDate: new Date().toISOString(),
    priority: "high",
    completed: false,
    createdAt: new Date().toISOString(),
    tags: ["planning"],
  },
  {
    id: nanoid(),
    title: "Book usability check",
    notes: "Quick sync with team to validate flows.",
    dueDate: undefined,
    priority: "medium",
    completed: false,
    createdAt: new Date().toISOString(),
    tags: ["research"],
  },
];

const events: CalendarEvent[] = [
  {
    id: nanoid(),
    title: "Sprint kickoff",
    date: new Date().toISOString(),
    start: "09:00",
    end: "10:00",
    notes: "Align on priorities",
  },
];

export const defaultState: AppState = {
  version: 1,
  board,
  cards: sampleCards,
  tasks,
  events,
  settings: {
    theme: "light",
    density: "comfortable",
  },
  lastView: "kanban",
};

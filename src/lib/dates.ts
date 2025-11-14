import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";

export {
  addDays,
  addMonths,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  subMonths,
};

export function getMonthMatrix(current: Date) {
  const start = startOfMonth(current);
  const end = endOfMonth(current);
  const matrix: Date[][] = [];
  let week: Date[] = [];
  let cursor = start;
  // fill leading empty days
  const leading = getDay(start);
  for (let i = 0; i < leading; i += 1) {
    week.push(addDays(start, i - leading));
  }
  while (cursor <= end || week.length % 7 !== 0) {
    week.push(cursor);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
    cursor = addDays(cursor, 1);
    if (cursor > end && week.length > 0 && week.length < 7) {
      while (week.length < 7) {
        week.push(addDays(cursor, week.length));
      }
    }
  }
  return matrix;
}

export function formatFullDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "EEE, MMM d");
}

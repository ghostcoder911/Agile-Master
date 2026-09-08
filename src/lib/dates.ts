import {
  addDays,
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

export function nowIso() {
  return new Date().toISOString();
}

export function todayKey(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function parseDate(value: string) {
  return value.includes("T") ? parseISO(value) : parseISO(`${value}T00:00:00`);
}

export function daysFromToday(offset: number) {
  return addDays(startOfDay(new Date()), offset);
}

export function isoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function isoDateTime(date: Date) {
  return date.toISOString();
}

export function prettyDate(value: string | null | undefined) {
  if (!value) return "—";
  return format(parseDate(value), "MMM d");
}

export function prettyDateLong(value: string | null | undefined) {
  if (!value) return "—";
  return format(parseDate(value), "EEE, MMM d");
}

export function relativeTime(value: string) {
  return formatDistanceToNowStrict(parseDate(value), { addSuffix: true });
}

export function daysUntil(value: string | null | undefined) {
  if (!value) return null;
  return differenceInCalendarDays(parseDate(value), startOfDay(new Date()));
}

export function isOverdue(value: string | null | undefined) {
  if (!value) return false;
  return isBefore(parseDate(value), startOfDay(new Date()));
}

export function isDueToday(value: string | null | undefined) {
  if (!value) return false;
  return isSameDay(parseDate(value), new Date());
}

export function isDueSoon(value: string | null | undefined, withinDays = 2) {
  const days = daysUntil(value);
  return days !== null && days >= 0 && days <= withinDays;
}

export function inRange(date: string, start: string, end: string) {
  const d = parseDate(date);
  return (
    !isBefore(d, parseDate(start)) && !isAfter(d, addDays(parseDate(end), 1))
  );
}

export function weekdayKeys(count: number) {
  const keys: string[] = [];
  let cursor = startOfDay(new Date());
  while (keys.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) keys.unshift(isoDate(cursor));
    cursor = addDays(cursor, -1);
  }
  return keys;
}

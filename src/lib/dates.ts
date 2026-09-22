import { format, isToday, isYesterday } from "date-fns";

export function dayLabel(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

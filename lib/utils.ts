import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInSeconds, isWithinInterval, max, min, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import type { TaskSession } from '@/lib/types';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (mins > 0 || hours === 0) result += `${mins}m`;
    return result.trim() || '0m';
};

export const calculateTimeSpent = (taskId: string, sessions: TaskSession[]) => {
  const now = Date.now();
  return sessions
    .filter(s => s.taskId === taskId)
    .reduce((total, session) => {
      const endTime = session.endTime ?? now;
      return total + differenceInSeconds(endTime, session.startTime);
    }, 0);
};

export const calculateTimeSpentInInterval = (
  taskId: string,
  sessions: TaskSession[],
  interval: Interval
): number => {
  const now = Date.now();
  return sessions
    .filter(s => s.taskId === taskId)
    .reduce((total, session) => {
      const sessionStart = new Date(session.startTime);
      const sessionEnd = session.endTime ? new Date(session.endTime) : new Date(now);

      // Check for overlap
      if (sessionStart > interval.end || sessionEnd < interval.start) {
        return total; // No overlap
      }

      const overlapStart = max([sessionStart, interval.start]);
      const overlapEnd = min([sessionEnd, interval.end]);

      if (overlapStart < overlapEnd) {
        return total + differenceInSeconds(overlapEnd, overlapStart);
      }
      
      return total;
    }, 0);
};

export type TimeRange = 'day' | 'week' | 'month' | 'year';

export const getTimeInterval = (timeRange: TimeRange): Interval => {
    const now = new Date();
    switch (timeRange) {
        case 'day': return { start: startOfDay(now), end: endOfDay(now) };
        case 'week': return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        case 'month': return { start: startOfMonth(now), end: endOfMonth(now) };
        case 'year': return { start: startOfYear(now), end: endOfYear(now) };
        default: return { start: startOfDay(now), end: endOfDay(now) };
    }
}

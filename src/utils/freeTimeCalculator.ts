import { Task, DayFreeTimeSummary, FreeTimeSlot, UserScheduleConfig } from '../types';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, Math.floor(minutes)));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export interface TimeInterval {
  start: number; // minutes from midnight
  end: number;
  taskId?: string;
  title?: string;
  category?: string;
}

/**
 * Union of intervals: merges overlapping or contiguous time intervals
 * to avoid double-counting overlapping events!
 */
export function mergeIntervals(intervals: TimeInterval[]): { start: number; end: number }[] {
  if (intervals.length === 0) return [];

  // Sort by start time ascending
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [
    { start: sorted[0].start, end: sorted[0].end },
  ];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = merged[merged.length - 1];

    if (current.start <= prev.end) {
      // Overlap or touching: merge
      prev.end = Math.max(prev.end, current.end);
    } else {
      // Non-overlapping gap
      merged.push({ start: current.start, end: current.end });
    }
  }

  return merged;
}

/**
 * Detects overlapping conflict events
 */
export function detectConflicts(intervals: TimeInterval[]): { task1: TimeInterval; task2: TimeInterval }[] {
  const conflicts: { task1: TimeInterval; task2: TimeInterval }[] = [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j].start < sorted[i].end) {
        conflicts.push({ task1: sorted[i], task2: sorted[j] });
      } else {
        break; // sorted, no further elements can overlap
      }
    }
  }

  return conflicts;
}

/**
 * Calculates accurate Remaining Free Time for a specific day
 */
export function calculateDayFreeTime(
  dateStr: string, // YYYY-MM-DD
  tasks: Task[],
  config: UserScheduleConfig
): DayFreeTimeSummary {
  const wakeMin = timeToMinutes(config.wakeTime || '07:00');
  const sleepMin = timeToMinutes(config.sleepTime || '23:00');

  // Total available waking minutes
  let awakeMinutes = sleepMin > wakeMin ? sleepMin - wakeMin : 24 * 60 - wakeMin + sleepMin;
  if (awakeMinutes <= 0) awakeMinutes = 16 * 60; // fallback to 16h

  // Filter tasks scheduled for this day with a start time
  const dayTasks = tasks.filter((t) => !t.completed && t.dueDate === dateStr && t.startTime);

  const rawIntervals: TimeInterval[] = dayTasks.map((t) => {
    const start = timeToMinutes(t.startTime!);
    const duration = t.durationMinutes && t.durationMinutes > 0 ? t.durationMinutes : 60;
    const end = Math.min(24 * 60, start + duration);
    return {
      start,
      end,
      taskId: t.id,
      title: t.title,
      category: t.category,
    };
  });

  // Calculate raw category hours (not clamped for user insight)
  const categoryHours: Record<string, number> = {};
  dayTasks.forEach((t) => {
    const durHours = (t.durationMinutes || 60) / 60;
    categoryHours[t.category] = (categoryHours[t.category] || 0) + durHours;
  });

  // Check for conflicts
  const conflicts = detectConflicts(rawIntervals);
  const conflictDetails = conflicts.map(
    (c) => `"${c.task1.title || 'Task'}" overlaps with "${c.task2.title || 'Task'}"`
  );

  // Clip intervals to waking hours
  const clampedIntervals: TimeInterval[] = rawIntervals
    .map((int) => ({
      ...int,
      start: Math.max(wakeMin, Math.min(sleepMin, int.start)),
      end: Math.max(wakeMin, Math.min(sleepMin, int.end)),
    }))
    .filter((int) => int.end > int.start);

  // Accurately merge intervals so overlapping time is counted only once!
  const merged = mergeIntervals(clampedIntervals);

  let scheduledMinutes = 0;
  merged.forEach((m) => {
    scheduledMinutes += m.end - m.start;
  });

  // Remaining free minutes
  const freeMinutes = Math.max(0, awakeMinutes - scheduledMinutes);

  // Extract available free slots
  const freeSlots: FreeTimeSlot[] = [];
  let currentPointer = wakeMin;

  for (const block of merged) {
    if (block.start > currentPointer) {
      const gap = block.start - currentPointer;
      if (gap >= 15) {
        // Only include gaps 15 minutes or longer
        freeSlots.push({
          start: minutesToTime(currentPointer),
          end: minutesToTime(block.start),
          durationMinutes: gap,
        });
      }
    }
    currentPointer = Math.max(currentPointer, block.end);
  }

  // Check trailing free time between last event and sleep
  if (currentPointer < sleepMin) {
    const gap = sleepMin - currentPointer;
    if (gap >= 15) {
      freeSlots.push({
        start: minutesToTime(currentPointer),
        end: minutesToTime(sleepMin),
        durationMinutes: gap,
      });
    }
  }

  return {
    date: dateStr,
    awakeHours: parseFloat((awakeMinutes / 60).toFixed(1)),
    scheduledHours: parseFloat((scheduledMinutes / 60).toFixed(1)),
    freeHours: parseFloat((freeMinutes / 60).toFixed(1)),
    categoryHours,
    freeSlots,
    hasConflict: conflicts.length > 0,
    conflictDetails,
  };
}

/**
 * Suggest best free slot for a task needing X minutes
 */
export function suggestSlotForTask(
  neededMinutes: number,
  freeSlots: FreeTimeSlot[]
): FreeTimeSlot | null {
  // Find the smallest slot that accommodates neededMinutes
  const fitSlots = freeSlots.filter((s) => s.durationMinutes >= neededMinutes);
  if (fitSlots.length === 0) return null;
  return fitSlots[0];
}

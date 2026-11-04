import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Share2,
  Download,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { Task, Category, UserScheduleConfig } from '../../types';
import { detectConflicts, mergeIntervals, TimeInterval } from '../../utils/freeTimeCalculator';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  scheduleConfig: UserScheduleConfig;
  onSelectTask: (task: Task) => void;
  onOpenQuickAddWithDate: (dateStr: string, timeStr?: string) => void;
  onImportCalendar: () => void;
  onExportCalendar: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  categories,
  scheduleConfig,
  onSelectTask,
  onOpenQuickAddWithDate,
  onImportCalendar,
  onExportCalendar,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: get start of week (Monday)
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }, [currentDate]);

  // Days in week array (Monday to Sunday)
  const weekDays = useMemo(() => {
    const days: { date: Date; dateStr: string; dayName: string; dayNum: number }[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        dayName: dayNames[i],
        dayNum: d.getDate(),
      });
    }
    return days;
  }, [weekStart]);

  // Navigate dates
  const navigateDate = (step: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + step * 7);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() + step);
    } else {
      d.setDate(d.getDate() + step);
    }
    setCurrentDate(d);
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Hours array from 07:00 to 23:00
  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = 7; h <= 23; h++) {
      list.push(h);
    }
    return list;
  }, []);

  // Category map for colors
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.name] = c.color;
    });
    return map;
  }, [categories]);

  // Check week conflicts
  const weekTasks = useMemo(() => {
    const weekDates = new Set(weekDays.map((w) => w.dateStr));
    return tasks.filter((t) => !t.completed && t.dueDate && weekDates.has(t.dueDate) && t.startTime);
  }, [tasks, weekDays]);

  const hasAnyConflict = useMemo(() => {
    const intervals: TimeInterval[] = weekTasks.map((t) => {
      const [h, m] = t.startTime!.split(':').map((v) => parseInt(v, 10));
      const start = h * 60 + m;
      return {
        start,
        end: start + (t.durationMinutes || 60),
        title: t.title,
      };
    });
    return detectConflicts(intervals).length > 0;
  }, [weekTasks]);

  return (
    <div className="space-y-4">
      {/* Calendar Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-colors cursor-pointer"
          >
            Today
          </button>

          <span className="text-sm font-bold text-[var(--color-text,#3D3548)] ml-2">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* View Mode & Sync Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
              }`}
            >
              Week (Mon–Sun)
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={onExportCalendar}
            title="Export to iCal / Google Calendar"
            className="p-2 rounded-xl border border-[var(--color-border,#F1E4DF)] text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {hasAnyConflict && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-center gap-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Notice: Overlapping schedule items detected this week. Click any event to adjust start time or duration.</span>
        </div>
      )}

      {/* Week View: Monday to Sunday hour-by-hour grid */}
      {viewMode === 'week' && (
        <div className="rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              {/* Week Header Row */}
              <div className="grid grid-cols-8 border-b border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)]/60 text-center">
                <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)] border-r border-[var(--color-border,#F1E4DF)] flex items-center justify-center">
                  Time
                </div>
                {weekDays.map((day) => {
                  const isToday = day.dateStr === todayStr;
                  return (
                    <div
                      key={day.dateStr}
                      className={`p-2 border-r border-[var(--color-border,#F1E4DF)] last:border-r-0 ${
                        isToday ? 'bg-[var(--color-primary,#F8C8DC)]/20 font-bold' : ''
                      }`}
                    >
                      <div className="text-[10px] text-[var(--color-muted,#7B6F8A)]">
                        {day.dayName}
                      </div>
                      <div
                        className={`text-xs font-semibold inline-block px-1.5 py-0.2 rounded-full ${
                          isToday
                            ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)]'
                            : 'text-[var(--color-text,#3D3548)]'
                        }`}
                      >
                        {day.dayNum}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hour rows */}
              <div className="max-h-[480px] overflow-y-auto">
            {hours.map((hour) => {
              const hourStr = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <div
                  key={hour}
                  className="grid grid-cols-8 border-b border-[var(--color-border,#F1E4DF)]/60 min-h-[56px]"
                >
                  {/* Time label */}
                  <div className="p-2 text-[10px] text-right font-medium text-[var(--color-muted,#7B6F8A)] border-r border-[var(--color-border,#F1E4DF)] tabular-nums select-none">
                    {hourStr}
                  </div>

                  {/* 7 Day columns */}
                  {weekDays.map((day) => {
                    // Find tasks for this day that start in this hour
                    const dayTasks = tasks.filter((t) => {
                      if (!t.dueDate || t.dueDate !== day.dateStr || !t.startTime) return false;
                      const [h] = t.startTime.split(':').map((v) => parseInt(v, 10));
                      return h === hour;
                    });

                    return (
                      <div
                        key={day.dateStr}
                        onClick={() => onOpenQuickAddWithDate(day.dateStr, hourStr)}
                        className="p-1 border-r border-[var(--color-border,#F1E4DF)]/60 last:border-r-0 relative hover:bg-[var(--color-primary,#F8C8DC)]/10 transition-colors cursor-pointer group"
                      >
                        {dayTasks.map((t) => {
                          const bg = categoryColorMap[t.category] || 'var(--color-primary,#F8C8DC)';
                          return (
                            <div
                              key={t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTask(t);
                              }}
                              className="p-1.5 mb-1 rounded-xl text-left shadow-2xs text-[10px] font-semibold text-[var(--color-text,#3D3548)] transition-transform hover:scale-[1.02] cursor-pointer"
                              style={{ backgroundColor: `${bg}88`, borderLeft: `3px solid ${bg}` }}
                            >
                              <div className="truncate">{t.title}</div>
                              <div className="text-[9px] text-[var(--color-muted,#7B6F8A)] truncate">
                                {t.startTime} · {t.durationMinutes}m
                              </div>
                            </div>
                          );
                        })}

                        {/* Hover quick add icon */}
                        <div className="hidden group-hover:flex items-center justify-center absolute inset-0 pointer-events-none opacity-40">
                          <Plus className="w-4 h-4 text-[var(--color-muted,#7B6F8A)]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] p-4 shadow-xs">
          <div className="grid grid-cols-7 text-center font-bold text-xs text-[var(--color-muted,#7B6F8A)] pb-2 border-b border-[var(--color-border,#F1E4DF)]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Generate calendar month grid */}
            {Array.from({ length: 35 }).map((_, idx) => {
              const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const dayOffset = (startMonth.getDay() + 6) % 7; // Monday = 0
              const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), idx - dayOffset + 1);
              const cellDateStr = cellDate.toISOString().split('T')[0];
              const isCurrMonth = cellDate.getMonth() === currentDate.getMonth();
              const isToday = cellDateStr === todayStr;

              const cellTasks = tasks.filter((t) => t.dueDate === cellDateStr);

              return (
                <div
                  key={idx}
                  onClick={() => onOpenQuickAddWithDate(cellDateStr)}
                  className={`min-h-[75px] p-1.5 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between ${
                    isCurrMonth
                      ? 'bg-[var(--color-card,#FFFFFF)] border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)]'
                      : 'bg-[var(--color-bg,#FFF9F2)]/40 border-transparent opacity-40'
                  } ${isToday ? 'ring-2 ring-[var(--color-accent,#E78EA9)]' : ''}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-text,#3D3548)]">
                    <span className={isToday ? 'px-1.5 rounded-full bg-[var(--color-primary,#F8C8DC)]' : ''}>
                      {cellDate.getDate()}
                    </span>
                    {cellTasks.length > 0 && (
                      <span className="text-[10px] text-[var(--color-muted,#7B6F8A)] tabular-nums">
                        {cellTasks.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {cellTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(t);
                        }}
                        className="truncate text-[9px] px-1 py-0.5 rounded bg-[var(--color-primary,#F8C8DC)]/40 text-[var(--color-text,#3D3548)] font-medium"
                      >
                        {t.title}
                      </div>
                    ))}
                    {cellTasks.length > 2 && (
                      <span className="text-[9px] text-[var(--color-muted,#7B6F8A)] pl-1">
                        +{cellTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--color-text,#3D3548)]">
              Daily Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <button
              onClick={() => onOpenQuickAddWithDate(currentDate.toISOString().split('T')[0])}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="space-y-2">
            {tasks
              .filter((t) => t.dueDate === currentDate.toISOString().split('T')[0])
              .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'))
              .map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-3 rounded-2xl border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] bg-[var(--color-bg,#FFF9F2)]/40 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--color-text,#3D3548)] tabular-nums">
                      {t.startTime || 'All Day'}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-[var(--color-text,#3D3548)]">
                        {t.title}
                      </span>
                      <span className="text-[11px] text-[var(--color-muted,#7B6F8A)] block">
                        {t.category} · {t.durationMinutes} minutes
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-primary,#F8C8DC)]/50 text-[var(--color-text,#3D3548)]">
                    {t.priority}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

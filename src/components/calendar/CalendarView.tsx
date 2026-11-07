import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { Task, Category, UserScheduleConfig } from '../../types';
import { detectConflicts, TimeInterval } from '../../utils/freeTimeCalculator';

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
  onSelectTask,
  onOpenQuickAddWithDate,
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const todayStr = new Date().toISOString().split('T')[0];
  const HOUR_HEIGHT = 64; // pixels per hour block

  // Helper: get start of week (Monday)
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

  // Hours array from 07:00 to 23:00 (17 hours)
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

  // Helper to compute end time string from start time and duration
  const getEndTimeString = (startTime: string, durationMinutes: number): string => {
    const [h, m] = startTime.split(':').map((v) => parseInt(v, 10));
    const totalMinutes = h * 60 + m + (durationMinutes || 60);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
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

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
            }`}
          >
            Week
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
      </div>

      {/* Conflict Banner */}
      {hasAnyConflict && (
        <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Notice: Overlapping schedule items detected this week. Click any event to adjust start time or duration.</span>
        </div>
      )}

      {/* Week View: Monday to Sunday hour-by-hour grid with VISUAL AUTO-EXPANSION */}
      {viewMode === 'week' && (
        <div className="rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              {/* Week Header Row */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)]/70 text-center sticky top-0 z-20">
                <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)] border-r border-[var(--color-border,#F1E4DF)] flex items-center justify-center">
                  Time
                </div>
                {weekDays.map((day) => {
                  const isToday = day.dateStr === todayStr;
                  return (
                    <div
                      key={day.dateStr}
                      className={`p-2 border-r border-[var(--color-border,#F1E4DF)] last:border-r-0 ${
                        isToday ? 'bg-[var(--color-primary,#F8C8DC)]/25 font-bold' : ''
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

              {/* Grid Body: Continuous Hour Columns with Physically Expanded Task Time-Blocks */}
              <div className="relative max-h-[520px] overflow-y-auto">
                <div
                  className="grid grid-cols-[60px_repeat(7,1fr)] relative"
                  style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
                >
                  {/* Left Column: Hour Labels */}
                  <div className="border-r border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)]/30 select-none">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        className="p-1.5 text-[10px] text-right font-semibold text-[var(--color-muted,#7B6F8A)] border-b border-[var(--color-border,#F1E4DF)]/60 tabular-nums"
                      >
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </div>
                    ))}
                  </div>

                  {/* 7 Day Columns */}
                  {weekDays.map((day) => {
                    // All tasks scheduled on this day with a start time
                    const dayTasks = tasks.filter((t) => {
                      if (!t.dueDate || t.dueDate !== day.dateStr || !t.startTime) return false;
                      const [h] = t.startTime.split(':').map((v) => parseInt(v, 10));
                      return h >= 7 && h <= 23;
                    });

                    return (
                      <div
                        key={day.dateStr}
                        className="relative border-r border-[var(--color-border,#F1E4DF)]/60 last:border-r-0 h-full"
                      >
                        {/* Background Hour Slot Guides */}
                        {hours.map((hour) => {
                          const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                          return (
                            <div
                              key={hour}
                              onClick={() => onOpenQuickAddWithDate(day.dateStr, hourStr)}
                              style={{ height: `${HOUR_HEIGHT}px` }}
                              className="border-b border-[var(--color-border,#F1E4DF)]/50 hover:bg-[var(--color-primary,#F8C8DC)]/10 transition-colors cursor-pointer group"
                            >
                              <div className="hidden group-hover:flex items-center justify-center h-full opacity-30 pointer-events-none">
                                <Plus className="w-3.5 h-3.5 text-[var(--color-muted,#7B6F8A)]" />
                              </div>
                            </div>
                          );
                        })}

                        {/* Physically Expanded Task Time-Blocks */}
                        {dayTasks.map((t) => {
                          const [startH, startM] = t.startTime!.split(':').map((v) => parseInt(v, 10));
                          const startMinutesFrom7 = (startH - 7) * 60 + startM;
                          const durationM = t.durationMinutes || 60;
                          const topPx = (startMinutesFrom7 / 60) * HOUR_HEIGHT;
                          const heightPx = Math.max(34, (durationM / 60) * HOUR_HEIGHT - 3);
                          const endTimeStr = getEndTimeString(t.startTime!, durationM);
                          const bg = categoryColorMap[t.category] || 'var(--color-primary,#F8C8DC)';

                          return (
                            <div
                              key={t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTask(t);
                              }}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                backgroundColor: `${bg}40`,
                                borderColor: bg,
                              }}
                              className={`absolute left-1 right-1 rounded-xl p-1.5 border-l-4 shadow-sm z-10 overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between ${
                                t.completed ? 'opacity-60 line-through' : ''
                              }`}
                            >
                              <div>
                                {/* Prominent, Bold Start and End Time Boundaries */}
                                <div className="text-[10px] sm:text-[11px] font-bold text-[var(--color-text,#3D3548)] tabular-nums flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 inline shrink-0 text-[var(--color-muted,#7B6F8A)]" />
                                  <span>{t.startTime} – {endTimeStr}</span>
                                </div>
                                <div className="text-[11px] font-semibold text-[var(--color-text,#3D3548)] leading-tight line-clamp-2">
                                  {t.title}
                                </div>
                              </div>
                              <div className="text-[9px] font-medium text-[var(--color-muted,#7B6F8A)] truncate flex items-center justify-between">
                                <span>{t.category}</span>
                                <span className="font-bold">{t.durationMinutes}m</span>
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
            {Array.from({ length: 35 }).map((_, idx) => {
              const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              const dayOffset = (startMonth.getDay() + 6) % 7;
              const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), idx - dayOffset + 1);
              const cellDateStr = cellDate.toISOString().split('T')[0];
              const isCurrMonth = cellDate.getMonth() === currentDate.getMonth();
              const isToday = cellDateStr === todayStr;

              const cellTasks = tasks.filter((t) => t.dueDate === cellDateStr);

              return (
                <div
                  key={idx}
                  onClick={() => onOpenQuickAddWithDate(cellDateStr)}
                  className={`min-h-[78px] p-1.5 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between ${
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
                    {cellTasks.slice(0, 2).map((t) => {
                      const endTimeStr = t.startTime ? getEndTimeString(t.startTime, t.durationMinutes || 60) : '';
                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(t);
                          }}
                          className="truncate text-[9px] px-1 py-0.5 rounded bg-[var(--color-primary,#F8C8DC)]/40 text-[var(--color-text,#3D3548)] font-medium"
                        >
                          {t.startTime ? `${t.startTime} ` : ''}{t.title}
                        </div>
                      );
                    })}
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
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--color-text,#3D3548)]">
              Daily Schedule: {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <button
              onClick={() => onOpenQuickAddWithDate(currentDate.toISOString().split('T')[0])}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:brightness-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-2">
            {tasks
              .filter((t) => t.dueDate === currentDate.toISOString().split('T')[0])
              .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'))
              .map((t) => {
                const endTimeStr = t.startTime ? getEndTimeString(t.startTime, t.durationMinutes || 60) : '';
                const bg = categoryColorMap[t.category] || 'var(--color-primary,#F8C8DC)';
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    style={{ borderLeftColor: bg }}
                    className="p-3 rounded-2xl border border-[var(--color-border,#F1E4DF)] border-l-4 hover:border-[var(--color-primary,#F8C8DC)] bg-[var(--color-bg,#FFF9F2)]/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold text-[var(--color-text,#3D3548)] tabular-nums bg-[var(--color-card,#FFFFFF)] px-2.5 py-1 rounded-lg border border-[var(--color-border,#F1E4DF)]">
                        {t.startTime ? `${t.startTime} – ${endTimeStr}` : 'All Day'}
                      </div>
                      <div>
                        <span className={`text-xs font-semibold text-[var(--color-text,#3D3548)] ${t.completed ? 'line-through opacity-60' : ''}`}>
                          {t.title}
                        </span>
                        <span className="text-[11px] text-[var(--color-muted,#7B6F8A)] block">
                          {t.category} · {t.durationMinutes}m duration
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-primary,#F8C8DC)]/50 text-[var(--color-text,#3D3548)]">
                      {t.priority}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  Plus,
  ArrowRight,
  Play,
  Hourglass,
  Coffee,
} from 'lucide-react';
import { Task, Habit, Countdown, FocusSession, UserScheduleConfig } from '../../types';
import { calculateDayFreeTime } from '../../utils/freeTimeCalculator';
import { MainTab } from '../Sidebar';

interface DashboardViewProps {
  tasks: Task[];
  habits: Habit[];
  countdowns: Countdown[];
  focusSessions: FocusSession[];
  scheduleConfig: UserScheduleConfig;
  onNavigate: (tab: MainTab) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onToggleHabitToday: (habitId: string) => void;
  onSelectTask: (task: Task) => void;
  onOpenQuickAdd: () => void;
  onStartFocus: (task: Task | null) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  habits,
  countdowns,
  focusSessions,
  scheduleConfig,
  onNavigate,
  onToggleTaskComplete,
  onToggleHabitToday,
  onSelectTask,
  onOpenQuickAdd,
  onStartFocus,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const pendingTodayTasks = todayTasks.filter((t) => !t.completed);
  const completedTodayTasks = todayTasks.filter((t) => t.completed);

  const freeTime = calculateDayFreeTime(todayStr, tasks, scheduleConfig);
  const nearestCountdown = countdowns[0];

  return (
    <div className="space-y-3 w-full overflow-x-hidden">
      {/* Compressed Hero Welcome Banner - fits neatly in one frame */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--color-primary,#F8C8DC)]/25 border border-[var(--color-border,#F1E4DF)] shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1 z-10 min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-card,#FFFFFF)]/85 text-[10px] font-bold text-[var(--color-text,#3D3548)] shadow-2xs">
            <span>🌸</span>
            <span>화이팅! Your little steps, your big dreams</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-[var(--color-text,#3D3548)] tracking-tight truncate">
            안녕하세요! Ready to conquer today? 🌷
          </h1>
          <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] leading-tight truncate">
            You have <strong className="text-[var(--color-text,#3D3548)] tabular-nums">{freeTime.freeHours} hours</strong> free time today out of {freeTime.awakeHours} waking hours.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          <button
            onClick={() => onNavigate('freetime')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-card,#FFFFFF)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
            <span>Free Time ({freeTime.freeHours}h)</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Widgets - Compressed gaps and padding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Widget 1: Today's Tasks */}
        <div className="md:col-span-2 p-3.5 sm:p-4 rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📝</span>
              <h3 className="text-xs font-bold text-[var(--color-text,#3D3548)]">
                Today's Priority Agenda
              </h3>
              <span className="text-[11px] text-[var(--color-muted,#7B6F8A)] tabular-nums">
                ({pendingTodayTasks.length} pending, {completedTodayTasks.length} done)
              </span>
            </div>

            <button
              onClick={() => onNavigate('tasks')}
              className="text-[11px] font-semibold text-[var(--color-accent,#E78EA9)] hover:underline flex items-center gap-0.5"
            >
              <span>All Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="py-5 text-center text-xs text-[var(--color-muted,#7B6F8A)] italic">
              No tasks scheduled for today. Take a rest or plan something inspiring! 🌸
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    task.completed
                      ? 'border-[var(--color-border,#F1E4DF)]/60 bg-[var(--color-bg,#FFF9F2)]/40 opacity-60'
                      : 'border-[var(--color-border,#F1E4DF)] bg-[var(--color-card,#FFFFFF)] hover:border-[var(--color-primary,#F8C8DC)] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskComplete(task.id);
                      }}
                      className="text-[var(--color-muted,#7B6F8A)] hover:text-emerald-500 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border,#F1E4DF)] hover:border-emerald-400" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-xs font-semibold truncate block ${
                          task.completed ? 'line-through text-[var(--color-muted,#7B6F8A)]' : 'text-[var(--color-text,#3D3548)]'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[10px] text-[var(--color-muted,#7B6F8A)] truncate block">
                        {task.category} {task.startTime ? `· ${task.startTime}` : ''} {task.durationMinutes ? `(${task.durationMinutes}m)` : ''}
                      </span>
                    </div>
                  </div>

                  {!task.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartFocus(task);
                      }}
                      title="Focus"
                      className="p-1 rounded-lg text-[var(--color-muted,#7B6F8A)] hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Widget 2: Free Time Snapshot Gauge - Compact */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--color-text,#3D3548)] flex items-center gap-1">
              <span>🌷</span> Free Time
            </h3>
            <button
              onClick={() => onNavigate('freetime')}
              className="text-[11px] font-semibold text-[var(--color-accent,#E78EA9)] hover:underline"
            >
              Analyze
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-1 text-center">
            <span className="text-2xl sm:text-3xl font-black text-[var(--color-text,#3D3548)] tabular-nums">
              {freeTime.freeHours} <span className="text-xs font-normal text-[var(--color-muted,#7B6F8A)]">hrs</span>
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              Unscheduled & Open
            </span>
            <div className="mt-2 w-full bg-[var(--color-bg,#FFF9F2)] p-2 rounded-xl border border-[var(--color-border,#F1E4DF)] text-[10px] text-[var(--color-muted,#7B6F8A)] space-y-0.5">
              <div className="flex justify-between">
                <span>Awake Window:</span>
                <span className="font-semibold text-[var(--color-text,#3D3548)]">{freeTime.awakeHours}h</span>
              </div>
              <div className="flex justify-between">
                <span>Committed:</span>
                <span className="font-semibold text-[var(--color-text,#3D3548)]">{freeTime.scheduledHours}h</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('freetime')}
            className="w-full py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)]/40 hover:bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] text-xs font-semibold transition-colors cursor-pointer"
          >
            Find Next Open Slot
          </button>
        </div>
      </div>

      {/* Row 2: Habits Quick Strip & Milestone Countdown - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Habit Check-in Strip */}
        <div className="md:col-span-2 p-3.5 sm:p-4 rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--color-text,#3D3548)] flex items-center gap-1">
              <span>🌱</span> Today's Habit Check-in
            </h3>
            <button
              onClick={() => onNavigate('habits')}
              className="text-[11px] font-semibold text-[var(--color-accent,#E78EA9)] hover:underline flex items-center gap-0.5"
            >
              <span>Streaks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {habits.slice(0, 4).map((h) => {
              const isDone = !!h.completions[todayStr];
              return (
                <div
                  key={h.id}
                  onClick={() => onToggleHabitToday(h.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isDone
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)]/50 hover:border-[var(--color-primary,#F8C8DC)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base shrink-0">{h.emoji}</span>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-[var(--color-text,#3D3548)] block truncate">
                        {h.name}
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-current" />
                        {h.streak} day streak
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'border border-[var(--color-border,#F1E4DF)] text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Countdown */}
        {nearestCountdown && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)]">
                Key Milestone
              </span>
              <button
                onClick={() => onNavigate('countdowns')}
                className="text-[11px] font-semibold text-[var(--color-accent,#E78EA9)] hover:underline"
              >
                All
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{nearestCountdown.emoji}</span>
                <h4 className="text-xs font-bold text-[var(--color-text,#3D3548)] truncate">
                  {nearestCountdown.title}
                </h4>
              </div>
              <p className="text-[10px] text-[var(--color-muted,#7B6F8A)] line-clamp-1">
                {nearestCountdown.notes || 'Stay determined, keep practicing daily.'}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-center">
              <span className="text-[11px] font-semibold text-[var(--color-text,#3D3548)]">
                Target: {nearestCountdown.targetDate}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

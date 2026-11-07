import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  AlertTriangle,
  Calendar as CalendarIcon,
  Plus,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
} from 'lucide-react';
import { Task, UserScheduleConfig, FreeTimeSlot } from '../../types';
import { calculateDayFreeTime } from '../../utils/freeTimeCalculator';

interface FreeTimeDashboardProps {
  tasks: Task[];
  scheduleConfig: UserScheduleConfig;
  onUpdateConfig: (config: UserScheduleConfig) => void;
  onScheduleInSlot: (slot: FreeTimeSlot, dateStr: string) => void;
}

export const FreeTimeDashboard: React.FC<FreeTimeDashboardProps> = ({
  tasks,
  scheduleConfig,
  onUpdateConfig,
  onScheduleInSlot,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempWake, setTempWake] = useState(scheduleConfig.wakeTime);
  const [tempSleep, setTempSleep] = useState(scheduleConfig.sleepTime);

  const summary = calculateDayFreeTime(selectedDate, tasks, scheduleConfig);

  const percentFree = Math.min(
    100,
    Math.max(0, Math.round((summary.freeHours / Math.max(1, summary.awakeHours)) * 100))
  );

  const shiftDay = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...scheduleConfig,
      wakeTime: tempWake,
      sleepTime: tempSleep,
    });
    setShowConfigModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌷</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text,#3D3548)]">
              Remaining Free Time Calculator
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted,#7B6F8A)] mt-1">
            Real-time interval union: overlaps are never double-counted. Discover your open time to rest or learn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDay(-1)}
            className="p-2 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs font-semibold text-[var(--color-text,#3D3548)]">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            />
            {isToday && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)]">
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => shiftDay(1)}
            className="p-2 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            title="Adjust Waking / Sleep Hours"
            className="p-2 rounded-xl border border-[var(--color-border,#F1E4DF)] hover:bg-[var(--color-primary,#F8C8DC)]/30 text-[var(--color-text,#3D3548)] transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[var(--color-muted,#7B6F8A)]" />
          </button>
        </div>
      </div>

      {/* Conflict Warning Notice if overlapping tasks exist */}
      {summary.hasConflict && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <span className="font-semibold">Schedule Overlap Detected: </span>
            <span>
              {summary.conflictDetails?.join(', ')}. 화이팅 merges these time intervals automatically so your scheduled hours ({summary.scheduledHours}h) reflect actual commitment without double counting!
            </span>
          </div>
        </div>
      )}

      {/* Core Grid: Visual Gauge + Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Free Time Big Visual Card */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs flex flex-col justify-between text-center relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--color-muted,#7B6F8A)]">
              🌸 Day Balance
            </span>
            <div className="text-4xl font-extrabold text-[var(--color-text,#3D3548)] tabular-nums">
              {summary.freeHours} <span className="text-lg font-medium text-[var(--color-muted,#7B6F8A)]">hours free</span>
            </div>
            <p className="text-xs text-[var(--color-muted,#7B6F8A)]">
              {percentFree}% of your awake hours are open
            </p>
          </div>

          {/* Clean Circular Visual Ring */}
          <div className="my-6 flex justify-center items-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[var(--color-border,#F1E4DF)]"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Scheduled Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="var(--color-primary,#F8C8DC)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - (summary.scheduledHours / Math.max(1, summary.awakeHours)))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Coffee className="w-6 h-6 text-[var(--color-accent,#E78EA9)] mb-1" />
                <span className="text-lg font-bold text-[var(--color-text,#3D3548)] tabular-nums">
                  {summary.scheduledHours}h busy
                </span>
                <span className="text-[11px] text-[var(--color-muted,#7B6F8A)]">
                  of {summary.awakeHours}h total
                </span>
              </div>
            </div>
          </div>

          {/* Routine Indicators */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--color-border,#F1E4DF)] text-xs text-[var(--color-muted,#7B6F8A)]">
            <div className="flex items-center justify-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Wake: <strong>{scheduleConfig.wakeTime}</strong></span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sleep: <strong>{scheduleConfig.sleepTime}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: Breakdown by Category */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
                Category Time Distribution
              </h3>
              <span className="text-xs text-[var(--color-muted,#7B6F8A)] tabular-nums">
                {summary.scheduledHours} scheduled hours
              </span>
            </div>

            {Object.keys(summary.categoryHours).length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--color-muted,#7B6F8A)]">
                No time-blocked activities scheduled on this day yet. All {summary.awakeHours} hours are free! 🌸
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(summary.categoryHours).map(([cat, hours]) => {
                  const pct = Math.min(
                    100,
                    Math.round((hours / Math.max(1, summary.awakeHours)) * 100)
                  );
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--color-text,#3D3548)]">{cat}</span>
                        <div className="text-[var(--color-muted,#7B6F8A)] tabular-nums">
                          <span className="font-semibold text-[var(--color-text,#3D3548)]">{hours}h</span>
                          <span className="text-[11px] ml-1">({pct}% of day)</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--color-border,#F1E4DF)]/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--color-primary,#F8C8DC)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-border,#F1E4DF)] text-[11px] text-[var(--color-muted,#7B6F8A)] flex items-center justify-between">
            <span>Sleep Duration: <strong>8h (Recommended)</strong></span>
            <span>Available Waking Window: <strong>{summary.awakeHours}h</strong></span>
          </div>
        </div>
      </div>

      {/* Available Free Time Slots - Actionable! */}
      <div className="p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-accent,#E78EA9)]" />
              <span>Available Unscheduled Free Time Slots</span>
            </h3>
            <p className="text-xs text-[var(--color-muted,#7B6F8A)] mt-0.5">
              Gaps between your commitments where you can schedule deep work, revision, or self-care.
            </p>
          </div>
        </div>

        {summary.freeSlots.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--color-muted,#7B6F8A)]">
            Every minute of your awake hours is scheduled! Be careful not to burn out. Consider trimming non-essential tasks. 🌷
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {summary.freeSlots.map((slot, index) => {
              const hours = Math.floor(slot.durationMinutes / 60);
              const mins = slot.durationMinutes % 60;
              const formattedDuration =
                hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;

              return (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)]/60 hover:bg-[var(--color-bg,#FFF9F2)] transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text,#3D3548)]">
                      <span>{slot.start} – {slot.end}</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                        {formattedDuration} free
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] mt-1">
                      Ideal for a {slot.durationMinutes >= 60 ? 'deep focus' : 'quick review'} session
                    </p>
                  </div>

                  <button
                    onClick={() => onScheduleInSlot(slot, selectedDate)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[var(--color-primary,#F8C8DC)] hover:brightness-95 text-[var(--color-text,#3D3548)] text-xs font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Plan Task in this Slot</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Routine Hours Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text,#3D3548)]">
              Configure Daily Schedule Hours
            </h3>
            <p className="text-xs text-[var(--color-muted,#7B6F8A)]">
              Specify your usual wake and sleep times so 화이팅 can calculate your true awake free time accurately.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)] flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Wake Time
                  </label>
                  <input
                    type="time"
                    value={tempWake}
                    onChange={(e) => setTempWake(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs font-semibold text-[var(--color-text,#3D3548)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)] flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    Sleep Time
                  </label>
                  <input
                    type="time"
                    value={tempSleep}
                    onChange={(e) => setTempSleep(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs font-semibold text-[var(--color-text,#3D3548)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] hover:brightness-95 transition-all"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Task } from '../../types';
import { playCelebration } from '../../utils/audio';

interface DuplicateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  currentDate: string; // YYYY-MM-DD
  onDuplicateTasks: (newTasks: Task[]) => void;
}

const DAYS_OF_WEEK = [
  { dayIndex: 1, name: 'Monday', short: 'Mon' },
  { dayIndex: 2, name: 'Tuesday', short: 'Tue' },
  { dayIndex: 3, name: 'Wednesday', short: 'Wed' },
  { dayIndex: 4, name: 'Thursday', short: 'Thu' },
  { dayIndex: 5, name: 'Friday', short: 'Fri' },
  { dayIndex: 6, name: 'Saturday', short: 'Sat' },
  { dayIndex: 0, name: 'Sunday', short: 'Sun' },
];

export const DuplicateScheduleModal: React.FC<DuplicateScheduleModalProps> = ({
  isOpen,
  onClose,
  tasks,
  currentDate,
  onDuplicateTasks,
}) => {
  const [sourceDate, setSourceDate] = useState(currentDate);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // default Mon-Fri
  const [repeatWeeks, setRepeatWeeks] = useState<number>(1); // 1 or 2 weeks
  const [includeTodos, setIncludeTodos] = useState(false);

  if (!isOpen) return null;

  // Find tasks scheduled on the source date
  const dayTasks = tasks.filter(t => {
    if (t.dueDate !== sourceDate) return false;
    if (!includeTodos && (t.isTodo || !t.startTime)) return false;
    return true;
  });

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev =>
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const selectWeekdays = () => setSelectedDays([1, 2, 3, 4, 5]);
  const selectAllDays = () => setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  const clearSelection = () => setSelectedDays([]);

  const handleDuplicate = () => {
    if (dayTasks.length === 0 || selectedDays.length === 0) return;

    const source = new Date(sourceDate + 'T00:00:00');
    const newTasks: Task[] = [];

    // Calculate dates for selected days over repeatWeeks
    for (let w = 0; w < repeatWeeks; w++) {
      for (const targetDayIndex of selectedDays) {
        // Calculate offset from source day of week
        const sourceDayIndex = source.getDay();
        let dayDiff = targetDayIndex - sourceDayIndex + w * 7;
        
        // Skip copying to the exact same day in week 0
        if (dayDiff === 0 && w === 0) continue;

        const targetDate = new Date(source);
        targetDate.setDate(targetDate.getDate() + dayDiff);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        dayTasks.forEach((baseTask, idx) => {
          newTasks.push({
            ...baseTask,
            id: `task-dup-${Date.now()}-${w}-${targetDayIndex}-${idx}`,
            dueDate: targetDateStr,
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
            order: Date.now() + idx,
            recurring: selectedDays.length >= 5 ? 'weekdays' : 'weekly',
          });
        });
      }
    }

    if (newTasks.length > 0) {
      onDuplicateTasks(newTasks);
      playCelebration();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-pastel-yellow/30 dark:bg-yellow-950/20">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Duplicate / Repeat Daily Schedule
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Copy an entire day's timetable across recurring days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Source Date Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
              Source Schedule Date
            </label>
            <input
              type="date"
              value={sourceDate}
              onChange={e => setSourceDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-800 dark:text-stone-200 focus:outline-none focus:border-stone-400"
            />
            <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
              <span>
                Found <strong>{dayTasks.length}</strong> {includeTodos ? 'tasks & to-dos' : 'scheduled timetable blocks'}
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-400">
                <input
                  type="checkbox"
                  checked={includeTodos}
                  onChange={e => setIncludeTodos(e.target.checked)}
                  className="rounded border-stone-300 text-pastel-pink focus:ring-pastel-pink"
                />
                <span>Include standalone To-Dos</span>
              </label>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Repeat Across Days
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectWeekdays}
                  className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline cursor-pointer"
                >
                  Mon–Fri
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline cursor-pointer"
                >
                  All 7 Days
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map(d => {
                const isSelected = selectedDays.includes(d.dayIndex);
                return (
                  <button
                    key={d.dayIndex}
                    type="button"
                    onClick={() => toggleDay(d.dayIndex)}
                    className={`py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition border ${
                      isSelected
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-transparent shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{d.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weeks Count */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 uppercase tracking-wider">
              Repeat Horizon
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRepeatWeeks(1)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  repeatWeeks === 1
                    ? 'bg-pastel-pink/40 border-pink-400 text-stone-900 dark:text-stone-100'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                Current Week (Next occurrence)
              </button>
              <button
                type="button"
                onClick={() => setRepeatWeeks(2)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  repeatWeeks === 2
                    ? 'bg-pastel-pink/40 border-pink-400 text-stone-900 dark:text-stone-100'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                2 Weeks (College Timetable)
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={dayTasks.length === 0 || selectedDays.length === 0}
              className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs flex items-center gap-1.5"
            >
              <span>📋 Duplicate Schedule</span>
              <span>({dayTasks.length * selectedDays.length * repeatWeeks} copies)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

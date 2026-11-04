import React, { useState } from 'react';
import {
  Plus,
  Flame,
  CheckCircle2,
  Circle,
  Trophy,
  Calendar,
  Sparkles,
  TrendingUp,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Habit, Category } from '../../types';
import confetti from 'canvas-confetti';
import { playCelebration, playChime } from '../../utils/audio';

interface HabitTrackerViewProps {
  habits: Habit[];
  categories: Category[];
  onToggleHabitToday: (habitId: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt'>) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitTrackerView: React.FC<HabitTrackerViewProps> = ({
  habits,
  categories,
  onToggleHabitToday,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🌸');
  const [newCategory, setNewCategory] = useState(categories[0]?.name || 'Health');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekdays'>('daily');
  const [newTargetDays, setNewTargetDays] = useState(7);
  const [newNotes, setNewNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      isToday: idx === 6,
    };
  });

  const handleCheckIn = (habitId: string, isAlreadyCompleted: boolean) => {
    onToggleHabitToday(habitId);
    if (!isAlreadyCompleted) {
      playCelebration();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F8C8DC', '#CFF5E7', '#FFE0C2', '#DCCBFF'],
        });
      } catch (e) {}
    } else {
      playChime();
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddHabit({
      name: newTitle.trim(),
      emoji: newEmoji,
      category: newCategory,
      frequency: newFrequency,
      targetDaysPerWeek: newTargetDays,
      notes: newNotes,
    });
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text,#3D3548)]">
              Habit Tracker & Streaks
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted,#7B6F8A)] mt-1">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit." 🌷
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] text-xs font-semibold hover:brightness-95 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map((habit) => {
          const isDoneToday = !!habit.completions[todayStr];

          return (
            <div
              key={habit.id}
              className="p-5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] shadow-xs transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] flex items-center justify-center text-xl shadow-2xs">
                    {habit.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--color-muted,#7B6F8A)] mt-0.5">
                      <span>{habit.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold tabular-nums">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {habit.streak} day streak
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCheckIn(habit.id, isDoneToday)}
                    className={`p-2 rounded-2xl transition-all cursor-pointer active:scale-90 ${
                      isDoneToday
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-[var(--color-muted,#7B6F8A)] hover:text-emerald-500 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    title="Delete habit"
                    className="p-2 rounded-2xl text-[var(--color-muted,#7B6F8A)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {habit.notes && (
                <p className="text-xs text-[var(--color-muted,#7B6F8A)] italic bg-[var(--color-bg,#FFF9F2)]/70 p-2.5 rounded-xl border border-[var(--color-border,#F1E4DF)]/60">
                  "{habit.notes}"
                </p>
              )}

              {/* 7-Day Mini Tracker Grid */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)]">
                  Past 7 Days
                </span>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {last7Days.map((d) => {
                    const completed = !!habit.completions[d.dateStr];
                    return (
                      <div key={d.dateStr} className="space-y-1">
                        <div
                          className={`h-7 rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
                            completed
                              ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] shadow-2xs'
                              : 'bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-[var(--color-muted,#7B6F8A)] opacity-40'
                          } ${d.isToday ? 'ring-2 ring-[var(--color-accent,#E78EA9)]' : ''}`}
                        >
                          {completed ? '✓' : '·'}
                        </div>
                        <span className="text-[9px] text-[var(--color-muted,#7B6F8A)] block">
                          {d.dayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Best streak indicator */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border,#F1E4DF)]/60 text-[11px] text-[var(--color-muted,#7B6F8A)]">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Best record: <strong>{habit.bestStreak} days</strong>
                </span>
                <span>Target: <strong>{habit.targetDaysPerWeek}x / week</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text,#3D3548)]">
              Create a New Habit 🌱
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                  Habit Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-12 text-center py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-base"
                    placeholder="🌸"
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Read 20 pages or Drink 2L water"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                    Frequency
                  </label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
                  >
                    <option value="daily">Every Day (7/7)</option>
                    <option value="weekdays">Weekdays (5/7)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                  Personal Motivation / Notes
                </label>
                <input
                  type="text"
                  placeholder="Why is this habit meaningful to you?"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] hover:brightness-95"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

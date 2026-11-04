import React, { useState, useEffect } from 'react';
import { Plus, Hourglass, Calendar, Clock, Trash2, Sparkles, GraduationCap } from 'lucide-react';
import { Countdown } from '../../types';

interface CountdownViewProps {
  countdowns: Countdown[];
  onAddCountdown: (cd: Omit<Countdown, 'id'>) => void;
  onDeleteCountdown: (id: string) => void;
}

export const CountdownView: React.FC<CountdownViewProps> = ({
  countdowns,
  onAddCountdown,
  onDeleteCountdown,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Countdown['category']>('Exams');
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('09:00');
  const [emoji, setEmoji] = useState('🎓');
  const [themeColor, setThemeColor] = useState('#FFE0C2');
  const [notes, setNotes] = useState('');

  // Ticking state for live seconds countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (targetDateStr: string, targetTimeStr: string) => {
    const target = new Date(`${targetDateStr}T${targetTimeStr || '00:00'}:00`).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isPast: false };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;
    onAddCountdown({
      title: title.trim(),
      category,
      targetDate,
      targetTime,
      emoji,
      themeColor,
      notes: notes.trim(),
    });
    setTitle('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text,#3D3548)]">
              Countdown Timers & Milestones
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted,#7B6F8A)] mt-1">
            Keep your eye on the prize: GATE Exams, college deadlines, birthdays, and sweet vacations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] text-xs font-semibold hover:brightness-95 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Countdown</span>
        </button>
      </div>

      {/* Countdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {countdowns.map((cd) => {
          const { days, hours, minutes, seconds, isPast } = calculateTimeRemaining(
            cd.targetDate,
            cd.targetTime
          );

          return (
            <div
              key={cd.id}
              className="p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] shadow-xs transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-2xs shrink-0"
                    style={{ backgroundColor: `${cd.themeColor}60` }}
                  >
                    {cd.emoji}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)]">
                      {cd.category}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)] leading-snug">
                      {cd.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteCountdown(cd.id)}
                  className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Ticking Numbers Grid */}
              <div className="grid grid-cols-4 gap-2 text-center py-2 bg-[var(--color-bg,#FFF9F2)]/60 rounded-2xl border border-[var(--color-border,#F1E4DF)]/60">
                <div className="space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[var(--color-text,#3D3548)] tabular-nums block">
                    {days}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--color-muted,#7B6F8A)] uppercase">
                    Days
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[var(--color-text,#3D3548)] tabular-nums block">
                    {hours}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--color-muted,#7B6F8A)] uppercase">
                    Hours
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[var(--color-text,#3D3548)] tabular-nums block">
                    {minutes}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--color-muted,#7B6F8A)] uppercase">
                    Mins
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[var(--color-accent,#E78EA9)] tabular-nums block">
                    {seconds}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--color-muted,#7B6F8A)] uppercase">
                    Secs
                  </span>
                </div>
              </div>

              {cd.notes && (
                <p className="text-xs text-[var(--color-muted,#7B6F8A)] italic leading-relaxed">
                  "{cd.notes}"
                </p>
              )}

              {/* Bottom metadata */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border,#F1E4DF)] text-[11px] text-[var(--color-muted,#7B6F8A)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {cd.targetDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {cd.targetTime || '00:00'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text,#3D3548)]">
              Create a Milestone Countdown ⏳
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                  Event Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-12 text-center py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-base"
                    placeholder="🎓"
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GATE Exam 2027 or College Major Project"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
                  >
                    <option value="Exams">🎓 Exams</option>
                    <option value="Assignments">📝 Assignments</option>
                    <option value="Birthdays">🎂 Birthdays</option>
                    <option value="Events">🎉 Events</option>
                    <option value="Vacations">✈️ Vacations</option>
                    <option value="Personal">🌸 Personal</option>
                    <option value="Deadlines">⏰ Deadlines</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                    Target Time
                  </label>
                  <input
                    type="time"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                  Target Date
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                  Inspirational Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on daily mock tests and conceptual clarity!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Save Countdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

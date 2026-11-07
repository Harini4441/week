import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Task, Category, Priority } from '../../types';

interface QuickAddTaskModalProps {
  categories: Category[];
  initialDate?: string;
  initialTime?: string;
  initialCategory?: string;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'comments' | 'attachments' | 'order'>) => void;
}

export const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({
  categories,
  initialDate,
  initialTime,
  initialCategory,
  onClose,
  onCreateTask,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(initialCategory || categories[0]?.name || 'Study');
  const [priority, setPriority] = useState<Priority>('P2');
  const [dueDate, setDueDate] = useState(initialDate || todayStr);
  const [startTime, setStartTime] = useState(initialTime || '');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [description, setDescription] = useState('');

  const durationPresets = [15, 25, 30, 45, 60, 90, 120];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || null,
      startTime: startTime || null,
      durationMinutes: Math.max(1, durationMinutes || 30),
      subtasks: [],
      tags: [],
      recurring: 'none',
      completed: false,
      reminders: startTime ? ['15m'] : [],
      quadrant: priority === 'P1' ? 'urgent-important' : 'not-urgent-important',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
              Create New Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
              Task Title
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., DBMS Normalization practice or read 20 pages"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs font-semibold text-[var(--color-text,#3D3548)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
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
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-2xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs font-semibold text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
              >
                <option value="P1">P1 Urgent</option>
                <option value="P2">P2 High</option>
                <option value="P3">P3 Medium</option>
                <option value="P4">P4 Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
              />
            </div>
          </div>

          {/* Duration Section: Quick Presets + Direct Custom Input Field */}
          <div className="space-y-2 p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--color-text,#3D3548)]">
                Duration
              </label>
              <span className="text-xs font-bold text-[var(--color-accent,#E78EA9)] tabular-nums">
                {durationMinutes >= 60
                  ? `${durationMinutes}m (${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m)`
                  : `${durationMinutes}m`}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {durationPresets.map((preset) => {
                const isSelected = durationMinutes === preset;
                const label = preset < 60 ? `${preset}m` : preset === 60 ? '1h' : preset === 90 ? '1.5h' : `${preset / 60}h`;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDurationMinutes(preset)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] shadow-2xs'
                        : 'bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] text-[var(--color-muted,#7B6F8A)] hover:border-[var(--color-primary,#F8C8DC)]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Direct Numeric Custom Duration Input */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[11px] font-medium text-[var(--color-muted,#7B6F8A)] shrink-0">
                Custom Duration:
              </span>
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={durationMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDurationMinutes(isNaN(val) ? 0 : val);
                  }}
                  className="w-24 px-2.5 py-1 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-card,#FFFFFF)] text-xs font-bold text-[var(--color-text,#3D3548)] text-center focus:outline-none"
                />
                <span className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">minutes</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
              Notes & Description
            </label>
            <textarea
              rows={2}
              placeholder="Add notes, sub-goals, or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border,#F1E4DF)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-[var(--color-border,#F1E4DF)] text-xs font-semibold text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-bg,#FFF9F2)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-xs font-bold text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-sm cursor-pointer active:scale-95 transition-transform"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

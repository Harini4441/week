import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Tag,
  Trash2,
  Play,
} from 'lucide-react';
import { Task, Category, Priority, Subtask } from '../../types';
import { playCelebration, playChime } from '../../utils/audio';

interface TaskDetailModalProps {
  task: Task;
  categories: Category[];
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  categories,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onStartFocus,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [category, setCategory] = useState(task.category);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [startTime, setStartTime] = useState(task.startTime || '');
  const [durationMinutes, setDurationMinutes] = useState(task.durationMinutes || 60);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [tagsText, setTagsText] = useState(task.tags.join(', '));

  const durationPresets = [15, 25, 30, 45, 60, 90, 120];

  const handleToggleSubtask = (stId: string) => {
    setSubtasks((prev) =>
      prev.map((st) => {
        if (st.id === stId) {
          const next = !st.completed;
          if (next) playCelebration();
          else playChime();
          return { ...st, completed: next };
        }
        return st;
      })
    );
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newSt: Subtask = {
      id: `st-${Date.now()}`,
      text: newSubtaskText.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (stId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== stId));
  };

  const handleSave = () => {
    const parsedTags = tagsText
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onUpdateTask({
      ...task,
      title: title.trim() || 'Untitled Task',
      description,
      category,
      priority,
      dueDate: dueDate || null,
      startTime: startTime || null,
      durationMinutes: Math.max(1, durationMinutes || 30),
      subtasks,
      tags: parsedTags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)]">
              Task Details
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onStartFocus(task);
                onClose();
              }}
              title="Start Pomodoro Focus"
              className="p-2 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              title="Delete Task"
              className="p-2 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Priority */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-base font-bold text-[var(--color-text,#3D3548)] bg-transparent border-b border-[var(--color-border,#F1E4DF)] pb-1 focus:outline-none focus:border-[var(--color-primary,#F8C8DC)]"
              placeholder="Task Title"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
            >
              <option value="P1">P1 Urgent</option>
              <option value="P2">P2 High</option>
              <option value="P3">P3 Medium</option>
              <option value="P4">P4 Low</option>
            </select>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detailed notes, links, or formulas..."
            className="w-full text-xs p-3 rounded-2xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)]/60 text-[var(--color-text,#3D3548)] focus:outline-none focus:bg-[var(--color-bg,#FFF9F2)]"
          />
        </div>

        {/* Timing & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[var(--color-muted,#7B6F8A)]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[var(--color-muted,#7B6F8A)]">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-[var(--color-muted,#7B6F8A)]">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
            />
          </div>
        </div>

        {/* Duration Section: Quick Preset Pills + Direct Numeric Custom Duration Input */}
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

          {/* Preset Pills */}
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

          {/* Direct Custom Duration Numeric Input Field */}
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

        {/* Tags input */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-[var(--color-muted,#7B6F8A)] flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="e.g., GATE, CS, assignment, algorithm"
            className="w-full px-3 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
          />
        </div>

        {/* Subtasks Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text,#3D3548)]">
              Subtasks ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--color-bg,#FFF9F2)]/60 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleSubtask(st.id)}
                    className="text-[var(--color-muted,#7B6F8A)] hover:text-emerald-500 cursor-pointer"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={`truncate ${
                      st.completed ? 'line-through text-[var(--color-muted,#7B6F8A)]' : 'text-[var(--color-text,#3D3548)]'
                    }`}
                  >
                    {st.text}
                  </span>
                </div>

                <button
                  onClick={() => handleRemoveSubtask(st.id)}
                  className="text-[var(--color-muted,#7B6F8A)] hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <input
              type="text"
              placeholder="Add subtask step..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:brightness-95 cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border,#F1E4DF)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

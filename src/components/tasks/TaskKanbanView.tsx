import React from 'react';
import { Plus, MoreHorizontal, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Task, Category } from '../../types';

interface TaskKanbanViewProps {
  tasks: Task[];
  categories: Category[];
  onSelectTask: (task: Task) => void;
  onMoveStatus: (taskId: string, newStatus: 'todo' | 'inprogress' | 'done') => void;
  onOpenQuickAdd: () => void;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  categories,
  onSelectTask,
  onMoveStatus,
  onOpenQuickAdd,
}) => {
  // Categorize tasks into Kanban buckets
  const todoTasks = tasks.filter((t) => !t.completed && (t.quadrant !== 'urgent-important' || !t.startTime));
  const inProgressTasks = tasks.filter((t) => !t.completed && t.quadrant === 'urgent-important' && t.startTime);
  const doneTasks = tasks.filter((t) => t.completed);

  const columns = [
    { id: 'todo' as const, title: 'To Do', emoji: '📝', tasks: todoTasks, bg: 'bg-[var(--color-bg,#FFF9F2)]' },
    { id: 'inprogress' as const, title: 'In Progress / Deep Work', emoji: '⏳', tasks: inProgressTasks, bg: 'bg-[var(--color-primary,#F8C8DC)]/15' },
    { id: 'done' as const, title: 'Completed', emoji: '✨', tasks: doneTasks, bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((col) => (
        <div
          key={col.id}
          className={`p-4 rounded-3xl border border-[var(--color-border,#F1E4DF)] ${col.bg} flex flex-col min-h-[500px] shadow-xs`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border,#F1E4DF)] mb-3">
            <div className="flex items-center gap-2">
              <span>{col.emoji}</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text,#3D3548)]">
                {col.title}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] text-[var(--color-muted,#7B6F8A)] tabular-nums">
                {col.tasks.length}
              </span>
            </div>

            {col.id === 'todo' && (
              <button
                onClick={onOpenQuickAdd}
                className="p-1 rounded-lg text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] hover:bg-[var(--color-card,#FFFFFF)] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cards Container */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {col.tasks.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs text-[var(--color-muted,#7B6F8A)] italic">
                Empty column
              </div>
            ) : (
              col.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="p-3.5 rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] shadow-xs transition-all cursor-pointer space-y-2 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--color-text,#3D3548)] line-clamp-2">
                      {task.title}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--color-primary,#F8C8DC)]/40 text-[var(--color-text,#3D3548)] shrink-0">
                      {task.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] line-clamp-2">
                    {task.description || 'No notes added'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border,#F1E4DF)]/60 text-[10px] text-[var(--color-muted,#7B6F8A)]">
                    <span className="font-medium">{task.category}</span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </span>
                    )}
                  </div>

                  {/* Move quick action buttons */}
                  <div className="flex items-center justify-end gap-1 pt-1">
                    {col.id !== 'todo' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveStatus(task.id, 'todo');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md hover:bg-[var(--color-primary,#F8C8DC)]/30 text-[var(--color-muted,#7B6F8A)] cursor-pointer"
                      >
                        ← To Do
                      </button>
                    )}
                    {col.id !== 'inprogress' && !task.completed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveStatus(task.id, 'inprogress');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md hover:bg-[var(--color-primary,#F8C8DC)]/30 text-[var(--color-text,#3D3548)] font-medium cursor-pointer"
                      >
                        Start ⏳
                      </button>
                    )}
                    {col.id !== 'done' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveStatus(task.id, 'done');
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium cursor-pointer"
                      >
                        Complete ✓
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

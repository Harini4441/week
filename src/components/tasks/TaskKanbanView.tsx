import React from 'react';
import { Plus, Calendar, CheckCircle2, ListTodo } from 'lucide-react';
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
  // Keep Kanban board exclusively for To-Dos (scheduled college/timetable tasks excluded)
  const todoOnlyTasks = tasks.filter((t) => t.isTodo || !t.startTime);

  const todoTasks = todoOnlyTasks.filter((t) => !t.completed && t.quadrant !== 'urgent-important');
  const inProgressTasks = todoOnlyTasks.filter((t) => !t.completed && t.quadrant === 'urgent-important');
  const doneTasks = todoOnlyTasks.filter((t) => t.completed);

  const columns = [
    { id: 'todo' as const, title: 'To-Do Items', emoji: '📝', tasks: todoTasks, bg: 'bg-[var(--color-bg,#FFF9F2)]' },
    { id: 'inprogress' as const, title: 'In Progress / Focused', emoji: '⏳', tasks: inProgressTasks, bg: 'bg-[var(--color-primary,#F8C8DC)]/15' },
    { id: 'done' as const, title: 'Completed', emoji: '✨', tasks: doneTasks, bg: 'bg-emerald-50/50 dark:bg-emerald-950/20' },
  ];

  return (
    <div className="space-y-4">
      {/* Notice header explaining Kanban separation */}
      <div className="px-4 py-2.5 rounded-2xl bg-pastel-pink/20 dark:bg-pink-950/20 border border-pastel-pink/40 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
          <span>
            <strong>To-Dos Only Kanban:</strong> Fixed timetable blocks stay in your Calendar to avoid cluttering your flow.
          </span>
        </div>
        <button
          onClick={onOpenQuickAdd}
          className="px-3 py-1 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold text-[11px] hover:opacity-90 transition cursor-pointer shrink-0"
        >
          + New To-Do
        </button>
      </div>

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
                  aria-label="Add To-Do"
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
                  No to-dos here
                </div>
              ) : (
                col.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-4 rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] shadow-xs transition-all cursor-pointer space-y-2.5 min-h-fit"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--color-text,#3D3548)] break-words whitespace-normal leading-snug">
                        {task.title}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-primary,#F8C8DC)]/40 text-[var(--color-text,#3D3548)] shrink-0">
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] break-words whitespace-normal leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border,#F1E4DF)]/60 text-[10px] text-[var(--color-muted,#7B6F8A)] flex-wrap gap-1">
                      <span className="font-medium">{task.category}</span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 tabular-nums">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                      )}
                    </div>

                    {/* Move quick action buttons */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[var(--color-border,#F1E4DF)]/30">
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
                          Focus ⏳
                        </button>
                      )}
                      {col.id !== 'done' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveStatus(task.id, 'done');
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Done</span>
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
    </div>
  );
};

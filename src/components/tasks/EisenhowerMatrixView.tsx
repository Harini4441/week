import React from 'react';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../../types';

interface EisenhowerMatrixViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onUpdateQuadrant: (taskId: string, quadrant: Task['quadrant']) => void;
  onAddTaskInQuadrant: (quadrant: Task['quadrant']) => void;
}

export const EisenhowerMatrixView: React.FC<EisenhowerMatrixViewProps> = ({
  tasks,
  onSelectTask,
  onToggleComplete,
  onUpdateQuadrant,
  onAddTaskInQuadrant,
}) => {
  const activeTasks = tasks.filter((t) => !t.completed);

  // Group into 4 quadrants
  const q1 = activeTasks.filter(
    (t) => t.quadrant === 'urgent-important' || (!t.quadrant && t.priority === 'P1')
  );
  const q2 = activeTasks.filter(
    (t) => t.quadrant === 'not-urgent-important' || (!t.quadrant && t.priority === 'P2')
  );
  const q3 = activeTasks.filter(
    (t) => t.quadrant === 'urgent-not-important' || (!t.quadrant && t.priority === 'P3')
  );
  const q4 = activeTasks.filter(
    (t) => t.quadrant === 'not-urgent-not-important' || (!t.quadrant && t.priority === 'P4')
  );

  const quadrants = [
    {
      id: 'urgent-important' as const,
      number: 'Q1',
      title: 'Do First',
      subtitle: 'Urgent & Important (Crises, Deadlines, Exams)',
      tasks: q1,
      bg: 'bg-rose-50/40 dark:bg-rose-950/20',
      badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    },
    {
      id: 'not-urgent-important' as const,
      number: 'Q2',
      title: 'Schedule & Deep Work',
      subtitle: 'Important & Not Urgent (GATE Prep, Health, Long-term Goals)',
      tasks: q2,
      bg: 'bg-purple-50/40 dark:bg-purple-950/20',
      badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'urgent-not-important' as const,
      number: 'Q3',
      title: 'Delegate / Minimize',
      subtitle: 'Urgent & Not Important (Interruptions, Minor errands)',
      tasks: q3,
      bg: 'bg-amber-50/40 dark:bg-amber-950/20',
      badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'not-urgent-not-important' as const,
      number: 'Q4',
      title: 'Eliminate',
      subtitle: 'Not Urgent & Not Important (Time wasters, Excessive browsing)',
      tasks: q4,
      bg: 'bg-slate-50/40 dark:bg-slate-900/30',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text,#3D3548)] flex items-center gap-2">
            <span>🎯</span> Eisenhower Priority Matrix
          </h2>
          <p className="text-xs text-[var(--color-muted,#7B6F8A)]">
            Focus your energy on Q2 (Strategic Long-term Goals & Study) while swiftly executing Q1.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quad) => (
          <div
            key={quad.id}
            className={`p-5 rounded-3xl border border-[var(--color-border,#F1E4DF)] ${quad.bg} flex flex-col min-h-[340px] shadow-xs`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border,#F1E4DF)]/80 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${quad.badge}`}>
                    {quad.number}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
                    {quad.title}
                  </h3>
                  <span className="text-xs text-[var(--color-muted,#7B6F8A)] tabular-nums">
                    ({quad.tasks.length})
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] mt-0.5">
                  {quad.subtitle}
                </p>
              </div>

              <button
                onClick={() => onAddTaskInQuadrant(quad.id)}
                className="p-1.5 rounded-xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks in Quadrant */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {quad.tasks.length === 0 ? (
                <div className="h-28 flex items-center justify-center text-xs text-[var(--color-muted,#7B6F8A)] italic">
                  No active tasks in this quadrant
                </div>
              ) : (
                quad.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3 rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className="text-[var(--color-muted,#7B6F8A)] hover:text-emerald-500 transition-colors"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-[var(--color-text,#3D3548)] truncate block">
                          {task.title}
                        </span>
                        <span className="text-[10px] text-[var(--color-muted,#7B6F8A)]">
                          {task.category} {task.durationMinutes ? `· ${task.durationMinutes}m` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Move selector */}
                    <select
                      value={task.quadrant || quad.id}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateQuadrant(task.id, e.target.value as any)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
                    >
                      <option value="urgent-important">Move Q1</option>
                      <option value="not-urgent-important">Move Q2</option>
                      <option value="urgent-not-important">Move Q3</option>
                      <option value="not-urgent-not-important">Move Q4</option>
                    </select>
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

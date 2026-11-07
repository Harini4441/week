import React from 'react';
import { Bell, Volume2, Play, Clock, X } from 'lucide-react';
import { Task } from '../../types';

interface AlarmToastProps {
  task: Task;
  onDismiss: () => void;
  onSnooze: (taskId: string) => void;
  onStartFocus: (task: Task) => void;
}

export const AlarmToast: React.FC<AlarmToastProps> = ({
  task,
  onDismiss,
  onSnooze,
  onStartFocus,
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg animate-in fade-in slide-in-from-top-6 duration-300">
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border-2 border-[var(--color-primary,#F8C8DC)] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary,#F8C8DC)] flex items-center justify-center text-xl shrink-0 shadow-xs animate-bounce">
            🔔
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                Task Starting Now!
              </span>
              <span className="text-xs font-bold text-[var(--color-accent,#E78EA9)] tabular-nums">
                {task.startTime} ({task.durationMinutes}m)
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text,#3D3548)] truncate mt-0.5">
              {task.title}
            </h4>
            <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] truncate">
              {task.category} · Ready to get started? 화이팅 🌷
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border,#F1E4DF)]">
          <button
            onClick={() => onStartFocus(task)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)] text-xs font-bold text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start Focus</span>
          </button>

          <button
            onClick={() => onSnooze(task.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs font-semibold text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] transition-all cursor-pointer"
          >
            <Clock className="w-3 h-3" />
            <span>Snooze 5m</span>
          </button>

          <button
            onClick={onDismiss}
            title="Dismiss"
            className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

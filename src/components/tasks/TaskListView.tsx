import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  Tag,
  ArrowUpDown,
  MoreVertical,
  Play,
  Trash2,
  CheckSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Task, Category, Priority } from '../../types';
import confetti from 'canvas-confetti';
import { playChime, playCelebration } from '../../utils/audio';

interface TaskListViewProps {
  tasks: Task[];
  categories: Category[];
  selectedCategory: string | null;
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onBulkComplete: (taskIds: string[]) => void;
  onBulkDelete: (taskIds: string[]) => void;
  onStartFocusOnTask: (task: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  categories,
  selectedCategory,
  onToggleComplete,
  onSelectTask,
  onDeleteTask,
  onBulkComplete,
  onBulkDelete,
  onStartFocusOnTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('pending');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'scheduled' | 'todo'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'duration' | 'title'>('dueDate');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Category filter
        if (selectedCategory && t.category !== selectedCategory) {
          return false;
        }

        // Type filter: Scheduled Tasks vs To-Dos
        const isStandaloneTodo = Boolean(t.isTodo || !t.startTime);
        if (itemTypeFilter === 'scheduled' && isStandaloneTodo) return false;
        if (itemTypeFilter === 'todo' && !isStandaloneTodo) return false;

        // Status filter
        if (statusFilter === 'pending' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;
        if (statusFilter === 'overdue') {
          if (t.completed) return false;
          if (!t.dueDate || t.dueDate >= todayStr) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesDesc = t.description?.toLowerCase().includes(q);
          const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const pOrder: Record<Priority, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
          return pOrder[a.priority] - pOrder[b.priority];
        }
        if (sortBy === 'duration') {
          return (b.durationMinutes || 0) - (a.durationMinutes || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        // Default: due date
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, selectedCategory, statusFilter, priorityFilter, searchQuery, sortBy, todayStr]);

  const toggleSelectTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleComplete = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeComplete = !task.completed;
    onToggleComplete(task.id);

    if (willBeComplete) {
      playCelebration();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F8C8DC', '#DCCBFF', '#CDEBFF', '#FFE0C2'],
        });
      } catch (err) {}
    } else {
      playChime();
    }
  };

  const priorityStyles: Record<Priority, { label: string; text: string; bg: string }> = {
    P1: { label: 'Urgent', text: 'text-rose-600 dark:text-rose-300', bg: 'bg-rose-100/60 dark:bg-rose-950/40' },
    P2: { label: 'High', text: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-100/60 dark:bg-amber-950/40' },
    P3: { label: 'Medium', text: 'text-purple-600 dark:text-purple-300', bg: 'bg-purple-100/60 dark:bg-purple-950/40' },
    P4: { label: 'Low', text: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100/60 dark:bg-slate-800/40' },
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted,#7B6F8A)]" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)] placeholder:text-[var(--color-muted,#7B6F8A)] focus:outline-none"
          />
        </div>

        {/* Filter Controls (Segmented clean buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter: Scheduled vs To-Do */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs">
            <button
              onClick={() => setItemTypeFilter('all')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                itemTypeFilter === 'all'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setItemTypeFilter('scheduled')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                itemTypeFilter === 'scheduled'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
              }`}
            >
              ⏰ Scheduled
            </button>
            <button
              onClick={() => setItemTypeFilter('todo')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                itemTypeFilter === 'todo'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
              }`}
            >
              📝 To-Dos
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                statusFilter === 'overdue'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-rose-500 font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:text-rose-400'
              }`}
            >
              Overdue
            </button>
          </div>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="P1">P1 Urgent</option>
            <option value="P2">P2 High</option>
            <option value="P3">P3 Medium</option>
            <option value="P4">P4 Low</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer"
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="duration">Sort: Duration</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar if items are selected */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[var(--color-primary,#F8C8DC)]/30 border border-[var(--color-border,#F1E4DF)] text-xs text-[var(--color-text,#3D3548)]">
          <span className="font-semibold">
            {selectedTaskIds.length} tasks selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onBulkComplete(selectedTaskIds);
                setSelectedTaskIds([]);
              }}
              className="px-3 py-1 rounded-xl bg-[var(--color-card,#FFFFFF)] hover:brightness-95 font-medium transition-colors cursor-pointer"
            >
              Mark Completed
            </button>
            <button
              onClick={() => {
                onBulkDelete(selectedTaskIds);
                setSelectedTaskIds([]);
              }}
              className="px-3 py-1 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 font-medium transition-colors cursor-pointer"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-[var(--color-muted,#7B6F8A)] hover:underline ml-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Tasks List Content */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center p-8 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] space-y-2">
          <div className="text-3xl">🌸</div>
          <h4 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
            No tasks found
          </h4>
          <p className="text-xs text-[var(--color-muted,#7B6F8A)] max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search or filters.'
              : 'You have cleared all tasks in this view! Enjoy your free time or add a new small step 🌷'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const isSelected = selectedTaskIds.includes(task.id);
            const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
            const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`group flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer bg-[var(--color-card,#FFFFFF)] ${
                  isSelected
                    ? 'border-[var(--color-accent,#E78EA9)] bg-[var(--color-primary,#F8C8DC)]/10 shadow-xs'
                    : 'border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] hover:shadow-xs'
                } ${task.completed ? 'opacity-65' : ''}`}
              >
                {/* Left: Checkbox & Task Info */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  {/* Select Checkbox for bulk edit */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => toggleSelectTask(task.id, e as any)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 sm:mt-0 rounded text-[var(--color-accent,#E78EA9)] focus:ring-0 cursor-pointer"
                  />

                  {/* Complete Circle Button */}
                  <button
                    onClick={(e) => handleToggleComplete(task, e)}
                    className="mt-0.5 sm:mt-0 text-[var(--color-muted,#7B6F8A)] hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
                    )}
                  </button>

                  {/* Title & Metadata (Clean zero-pill unboxed text with separators) */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-start sm:items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs sm:text-sm font-semibold break-words whitespace-normal leading-snug ${
                          task.completed
                            ? 'line-through text-[var(--color-muted,#7B6F8A)]'
                            : 'text-[var(--color-text,#3D3548)]'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Type Badge: Scheduled Timetable vs Standalone To-Do */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {task.isTodo || !task.startTime ? '📝 To-Do' : '⏰ Timetable'}
                      </span>

                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          priorityStyles[task.priority].bg
                        } ${priorityStyles[task.priority].text}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] break-words whitespace-normal line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Unboxed Metadata row with typographic separators */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-muted,#7B6F8A)]">
                      <span className="font-medium text-[var(--color-text,#3D3548)]/80">
                        {task.category}
                      </span>

                      {task.dueDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`flex items-center gap-1 tabular-nums ${
                              isOverdue ? 'text-rose-500 font-semibold' : ''
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {task.dueDate} {task.startTime ? `@ ${task.startTime}` : ''}
                          </span>
                        </>
                      )}

                      {task.durationMinutes > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3" />
                            {task.durationMinutes}m
                          </span>
                        </>
                      )}

                      {task.subtasks.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {completedSubtasks}/{task.subtasks.length} subtasks
                          </span>
                        </>
                      )}

                      {task.tags.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>#{task.tags.join(' #')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!task.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartFocusOnTask(task);
                      }}
                      title="Start Pomodoro Focus"
                      className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    title="Delete Task"
                    className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

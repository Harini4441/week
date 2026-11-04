import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  Brain,
  Download,
  Calendar,
} from 'lucide-react';
import { Task, Category, Habit, FocusSession } from '../../types';

interface AnalyticsDashboardProps {
  tasks: Task[];
  categories: Category[];
  habits: Habit[];
  focusSessions: FocusSession[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  tasks,
  categories,
  habits,
  focusSessions,
}) => {
  // Last 7 days task completion trend
  const last7DaysTrend = useMemo(() => {
    const data: { day: string; completed: number; pending: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
      const comp = dayTasks.filter((t) => t.completed).length;
      const pend = dayTasks.filter((t) => !t.completed).length;

      data.push({
        day: dayNames[d.getDay()],
        completed: comp,
        pending: pend,
      });
    }
    return data;
  }, [tasks]);

  // Category time distribution data for Pie Chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      const hours = (t.durationMinutes || 60) / 60;
      counts[t.category] = (counts[t.category] || 0) + hours;
    });

    const pastelPalette = [
      '#F8C8DC',
      '#DCCBFF',
      '#CDEBFF',
      '#CFF5E7',
      '#FFE0C2',
      '#FAD2E1',
      '#BBF7D0',
      '#DDD6FE',
      '#FED7AA',
      '#BAE6FD',
      '#FDE68A',
      '#FECDD3',
    ];

    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value: parseFloat(value.toFixed(1)),
      color: pastelPalette[idx % pastelPalette.length],
    }));
  }, [tasks]);

  // General KPIs
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalPending = tasks.filter((t) => !t.completed).length;
  const completionRate =
    tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  const highestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text,#3D3548)]">
              Productivity & Focus Analytics
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted,#7B6F8A)] mt-1">
            "티끌 모아 태산 (Little drops of water make a mighty ocean) 🌸"
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)]/40 border border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)]">
          Weekly Report Ready
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted,#7B6F8A)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Completion Rate</span>
          </div>
          <div className="text-2xl font-black text-[var(--color-text,#3D3548)] tabular-nums">
            {completionRate}%
          </div>
          <span className="text-[11px] text-[var(--color-muted,#7B6F8A)] block">
            {totalCompleted} of {tasks.length} total tasks
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted,#7B6F8A)]">
            <Clock className="w-4 h-4 text-[var(--color-accent,#E78EA9)]" />
            <span>Focus Logged</span>
          </div>
          <div className="text-2xl font-black text-[var(--color-text,#3D3548)] tabular-nums">
            {totalFocusHours}h
          </div>
          <span className="text-[11px] text-[var(--color-muted,#7B6F8A)] block">
            {focusSessions.length} focus sessions
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted,#7B6F8A)]">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Top Habit Streak</span>
          </div>
          <div className="text-2xl font-black text-[var(--color-text,#3D3548)] tabular-nums">
            {highestStreak} days
          </div>
          <span className="text-[11px] text-[var(--color-muted,#7B6F8A)] block">
            Across {habits.length} habits
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted,#7B6F8A)]">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Balance Score</span>
          </div>
          <div className="text-2xl font-black text-[var(--color-text,#3D3548)] tabular-nums">
            A+
          </div>
          <span className="text-[11px] text-[var(--color-muted,#7B6F8A)] block">
            Healthy free time margins
          </span>
        </div>
      </div>

      {/* Visual Charts: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Completion Bar Chart */}
        <div className="p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
              Daily Task Execution (Past 7 Days)
            </h3>
            <p className="text-xs text-[var(--color-muted,#7B6F8A)]">
              Completed vs remaining tasks by day
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="var(--color-muted,#7B6F8A)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-muted,#7B6F8A)" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card,#FFFFFF)',
                    borderColor: 'var(--color-border,#F1E4DF)',
                    borderRadius: '16px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completed" name="Completed" fill="var(--color-primary,#F8C8DC)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="var(--color-border,#F1E4DF)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Time Allocation Donut Chart */}
        <div className="p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
              Category Time Allocation (Hours)
            </h3>
            <p className="text-xs text-[var(--color-muted,#7B6F8A)]">
              Total estimated duration scheduled per domain
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-xs text-[var(--color-muted,#7B6F8A)]">No tasks scheduled yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card,#FFFFFF)',
                      borderColor: 'var(--color-border,#F1E4DF)',
                      borderRadius: '16px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: 'var(--color-muted,#7B6F8A)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Report & Korean Productivity Wisdom */}
      <div className="p-6 rounded-3xl bg-[var(--color-primary,#F8C8DC)]/20 border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--color-accent,#E78EA9)]" />
          <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
            화이팅 Weekly Reflection & Recommendations
          </h3>
        </div>
        <div className="text-xs text-[var(--color-text,#3D3548)] leading-relaxed space-y-2">
          <p>
            🌸 <strong>Study & Academic Balance:</strong> You have dedicated significant focus to GATE Preparation and College modules. Your consistency is paying off.
          </p>
          <p>
            🌷 <strong>Free Time Health:</strong> You have preserved regular daily unscheduled time. Continue ensuring you take a true rest buffer before sleep so memory consolidation occurs naturally.
          </p>
          <p className="italic text-[var(--color-muted,#7B6F8A)]">
            "시작이 반이다 - Starting is already half the battle. 화이팅!"
          </p>
        </div>
      </div>
    </div>
  );
};

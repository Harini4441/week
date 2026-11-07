import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  HeartHandshake,
  Timer,
  Grid2X2,
  Hourglass,
  BarChart3,
  Settings,
  FolderOpen,
  Plus,
  Cloud,
} from 'lucide-react';
import { Category } from '../types';

export type MainTab =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'freetime'
  | 'habits'
  | 'pomodoro'
  | 'matrix'
  | 'countdowns'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (catName: string | null) => void;
  onOpenNewCategoryModal: () => void;
  onOpenSync: () => void;
  pendingTaskCount: number;
  habitsDueToday: number;
  syncStatus: 'connecting' | 'synced' | 'offline' | 'error';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenNewCategoryModal,
  onOpenSync,
  pendingTaskCount,
  habitsDueToday,
  syncStatus,
}) => {
  const navItems = [
    { id: 'dashboard' as MainTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as MainTab, label: 'Tasks', icon: CheckSquare, badge: pendingTaskCount },
    { id: 'calendar' as MainTab, label: 'Calendar', icon: Calendar },
    { id: 'freetime' as MainTab, label: 'Free Time', icon: Clock, highlight: true },
    { id: 'habits' as MainTab, label: 'Habits', icon: HeartHandshake, badge: habitsDueToday > 0 ? habitsDueToday : undefined },
    { id: 'pomodoro' as MainTab, label: 'Pomodoro Focus', icon: Timer },
    { id: 'matrix' as MainTab, label: 'Eisenhower Matrix', icon: Grid2X2 },
    { id: 'countdowns' as MainTab, label: 'D-Day Countdowns', icon: Hourglass },
    { id: 'analytics' as MainTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as MainTab, label: 'Settings & Sync', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col justify-between border-r border-[var(--color-border,#F1E4DF)] bg-[var(--color-card,#FFFFFF)] p-3 select-none h-full overflow-y-auto">
      <div className="space-y-4">
        {/* Navigation Section */}
        <div className="space-y-0.5">
          <div className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[var(--color-muted,#7B6F8A)]">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] font-semibold shadow-2xs'
                    : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/20'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive
                        ? 'text-[var(--color-text,#3D3548)]'
                        : item.highlight
                        ? 'text-[var(--color-accent,#E78EA9)]'
                        : 'text-[var(--color-muted,#7B6F8A)]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)]'
                        : 'bg-[var(--color-primary,#F8C8DC)]/50 text-[var(--color-text,#3D3548)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Categories / Lists Section */}
        <div className="space-y-0.5 pt-2 border-t border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center justify-between px-2.5 py-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-muted,#7B6F8A)]">
              Categories
            </span>
            <button
              onClick={onOpenNewCategoryModal}
              title="Add Custom Category"
              className="p-0.5 rounded text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => {
              onSelectCategory(null);
              onSelectTab('tasks');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs transition-colors cursor-pointer ${
              selectedCategory === null && activeTab === 'tasks'
                ? 'bg-[var(--color-primary,#F8C8DC)]/40 text-[var(--color-text,#3D3548)] font-semibold'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/20'
            }`}
          >
            <FolderOpen className="w-3 h-3 text-[var(--color-muted,#7B6F8A)] shrink-0" />
            <span className="truncate">All Categories</span>
          </button>

          <div className="max-h-40 overflow-y-auto space-y-0.5 pr-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name && activeTab === 'tasks';
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.name);
                    onSelectTab('tasks');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-primary,#F8C8DC)]/40 text-[var(--color-text,#3D3548)] font-semibold'
                      : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs shrink-0">{cat.emoji}</span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cloud Sync Status & Encouragement at bottom */}
      <div className="pt-2 border-t border-[var(--color-border,#F1E4DF)] space-y-2">
        <button
          onClick={onOpenSync}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[var(--color-primary,#F8C8DC)]/30 hover:bg-[var(--color-primary,#F8C8DC)]/50 text-[var(--color-text,#3D3548)] text-xs font-semibold transition-all cursor-pointer"
        >
          <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'synced' ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span>Cloud Sync</span>
        </button>

        <div className="p-2 rounded-xl bg-[var(--color-bg,#FFF9F2)] text-center">
          <p className="text-[10px] text-[var(--color-muted,#7B6F8A)] leading-tight">
            "오늘의 작은 걸음, 내일의 큰 꿈 🌷"
          </p>
        </div>
      </div>
    </aside>
  );
};

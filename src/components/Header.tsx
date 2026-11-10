import React from 'react';
import { Plus, Palette, Moon, Sun, CheckCircle2, Clock, Cloud, Bell, Sparkles } from 'lucide-react';
import { ThemePreset } from '../types';

interface HeaderProps {
  currentTheme: ThemePreset;
  onOpenQuickAdd: () => void;
  onOpenThemes: () => void;
  onOpenSync: () => void;
  onToggleDarkMode: () => void;
  onOpenAiAssistant?: () => void;
  freeHoursToday: number;
  completedTasksToday: number;
  totalTasksToday: number;
  syncStatus: 'connecting' | 'synced' | 'offline' | 'error';
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onOpenQuickAdd,
  onOpenThemes,
  onOpenSync,
  onToggleDarkMode,
  onOpenAiAssistant,
  freeHoursToday,
  completedTasksToday,
  totalTasksToday,
  syncStatus,
  isLoggedIn,
}) => {
  return (
    <header className="shrink-0 z-30 flex items-center justify-between gap-3 px-3 sm:px-5 py-2.5 border-b border-[var(--color-border,#F1E4DF)] bg-[var(--color-card,#FFFFFF)]/95 backdrop-blur-md transition-colors w-full overflow-hidden">
      {/* Zone 1: Pure Korean Brand Wordmark (No English subtitle) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-xs bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] select-none shrink-0">
          🌸
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text,#3D3548)] whitespace-nowrap">
            화이팅
          </span>
        </div>
      </div>

      {/* Zone 2: Quiet Status & Free Time Indicator (Zero-pill uncluttered text) */}
      <div className="hidden md:flex items-center gap-3.5 text-xs text-[var(--color-muted,#7B6F8A)] truncate">
        <div className="flex items-center gap-1.5 font-medium shrink-0">
          <Clock className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
          <span>Free Time:</span>
          <span className="font-bold text-[var(--color-text,#3D3548)] tabular-nums">
            {freeHoursToday}h
          </span>
        </div>
        <span aria-hidden="true" className="opacity-40">·</span>
        <div className="flex items-center gap-1.5 font-medium shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Done:</span>
          <span className="font-bold text-[var(--color-text,#3D3548)] tabular-nums">
            {completedTasksToday}/{totalTasksToday}
          </span>
        </div>
        <span aria-hidden="true" className="opacity-40 hidden lg:inline">·</span>
        <span className="italic text-[var(--color-muted,#7B6F8A)]/80 text-[11px] truncate hidden lg:inline">
          "오늘의 작은 걸음, 내일의 큰 꿈 🌷"
        </span>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Real-Time Cloud Sync Button */}
        <button
          onClick={onOpenSync}
          title={isLoggedIn ? 'Cloud Sync Active (Logged In)' : 'Cloud Sync (Multi-Device)'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
            syncStatus === 'synced'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
              : 'bg-[var(--color-bg,#FFF9F2)] border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/20'
          }`}
        >
          <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'synced' ? 'text-emerald-500' : 'text-amber-500'}`} />
          <span className="hidden sm:inline">
            {syncStatus === 'synced' ? (isLoggedIn ? 'Cloud Synced' : 'Live Sync') : 'Connecting...'}
          </span>
        </button>

        {/* Task Notification / Alarm quick trigger */}
        <button
          onClick={onOpenSync}
          title="Notification & Audio Chime Settings"
          className="p-1.5 sm:p-2 rounded-xl text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-all cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
        </button>

        {/* Theme Palette Switcher */}
        <button
          onClick={onOpenThemes}
          title="Themes (42 Pastel Presets)"
          className="p-1.5 sm:p-2 rounded-xl text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-all cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-[var(--color-muted,#7B6F8A)]" />
        </button>

        {/* Dark/Light Quick Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={currentTheme.isDark ? 'Switch to Light Theme' : 'Switch to Dark Mode'}
          className="p-1.5 sm:p-2 rounded-xl text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-all cursor-pointer"
        >
          {currentTheme.isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[var(--color-muted,#7B6F8A)]" />
          )}
        </button>

        {/* Conversational AI Schedule Assistant */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            title="AI Schedule Assistant: Type routine in natural language and generate timetable"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-100/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 hover:bg-purple-200/80 transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">AI Planner</span>
            <span className="sm:hidden">AI</span>
          </button>
        )}

        {/* Primary CTA: New Task */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};

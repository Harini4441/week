import React from 'react';
import { Plus, Mic, Palette, Moon, Sun, CheckCircle2, Clock, Smartphone, Sparkles } from 'lucide-react';
import { ThemePreset } from '../types';

interface HeaderProps {
  currentTheme: ThemePreset;
  onOpenQuickAdd: () => void;
  onOpenVoiceAdd: () => void;
  onOpenThemes: () => void;
  onOpenAi: () => void;
  onOpenInstallPhone: () => void;
  onToggleDarkMode: () => void;
  freeHoursToday: number;
  completedTasksToday: number;
  totalTasksToday: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onOpenQuickAdd,
  onOpenVoiceAdd,
  onOpenThemes,
  onOpenAi,
  onOpenInstallPhone,
  onToggleDarkMode,
  freeHoursToday,
  completedTasksToday,
  totalTasksToday,
}) => {
  return (
    <header className="shrink-0 z-30 flex items-center justify-between gap-3 px-3 sm:px-5 py-2 border-b border-[var(--color-border,#F1E4DF)] bg-[var(--color-card,#FFFFFF)]/95 backdrop-blur-md transition-colors w-full overflow-hidden">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-xs bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] select-none shrink-0">
          🌸
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-text,#3D3548)] whitespace-nowrap">
            화이팅
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[var(--color-primary,#F8C8DC)]/40 text-[var(--color-text,#3D3548)] hidden sm:inline-block">
            Hwaiting!
          </span>
        </div>
      </div>

      {/* Zone 2: Quiet Status & Free Time Indicator (Single-line zero-pill unboxed text) */}
      <div className="hidden md:flex items-center gap-3.5 text-xs text-[var(--color-muted,#7B6F8A)] truncate">
        <div className="flex items-center gap-1.5 font-medium shrink-0">
          <Clock className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
          <span>Free Time:</span>
          <span className="font-bold text-[var(--color-text,#3D3548)] tabular-nums">
            {freeHoursToday} hrs
          </span>
        </div>
        <span aria-hidden="true" className="opacity-40">·</span>
        <div className="flex items-center gap-1.5 font-medium shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Completed:</span>
          <span className="font-bold text-[var(--color-text,#3D3548)] tabular-nums">
            {completedTasksToday}/{totalTasksToday}
          </span>
        </div>
        <span aria-hidden="true" className="opacity-40 hidden lg:inline">·</span>
        <span className="italic text-[var(--color-muted,#7B6F8A)]/80 text-[11px] truncate hidden lg:inline">
          "Your little steps, your big dreams 🌷"
        </span>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Install on Phone Button */}
        <button
          onClick={onOpenInstallPhone}
          title="Install on Android or iPhone"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] hover:bg-[var(--color-primary,#F8C8DC)]/30 text-[var(--color-text,#3D3548)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
          <span className="hidden sm:inline">Install on Phone</span>
        </button>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={onOpenAi}
          title="AI Assistant: Schedule & Planner"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[var(--color-primary,#F8C8DC)]/30 hover:bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)] animate-pulse" />
          <span className="hidden sm:inline">AI Helper</span>
        </button>

        {/* Voice Task Entry */}
        <button
          onClick={onOpenVoiceAdd}
          title="Voice Task Entry"
          className="p-1.5 sm:p-2 rounded-xl text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-all cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
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
          title={currentTheme.isDark ? 'Switch to Light Pastel' : 'Switch to Dark Velvet'}
          className="p-1.5 sm:p-2 rounded-xl text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 transition-all cursor-pointer"
        >
          {currentTheme.isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[var(--color-muted,#7B6F8A)]" />
          )}
        </button>

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

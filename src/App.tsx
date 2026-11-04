/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Category, Habit, Countdown, FocusSession, UserScheduleConfig, ThemePreset, FreeTimeSlot } from './types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SCHEDULE_CONFIG,
  getInitialTasks,
  getInitialHabits,
  getInitialCountdowns,
  getInitialFocusSessions,
  loadSavedData,
  saveStorageData,
  STORAGE_KEYS,
} from './utils/storage';
import { THEME_PRESETS, applyTheme } from './utils/themePresets';
import { calculateDayFreeTime } from './utils/freeTimeCalculator';
import { Header } from './components/Header';
import { Sidebar, MainTab } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';

// Main Views
import { DashboardView } from './components/dashboard/DashboardView';
import { TaskListView } from './components/tasks/TaskListView';
import { TaskKanbanView } from './components/tasks/TaskKanbanView';
import { EisenhowerMatrixView } from './components/tasks/EisenhowerMatrixView';
import { CalendarView } from './components/calendar/CalendarView';
import { FreeTimeDashboard } from './components/freetime/FreeTimeDashboard';
import { HabitTrackerView } from './components/habits/HabitTrackerView';
import { PomodoroTimerView } from './components/pomodoro/PomodoroTimerView';
import { CountdownView } from './components/countdowns/CountdownView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { QuickAddTaskModal } from './components/modals/QuickAddTaskModal';
import { VoiceTaskModal } from './components/modals/VoiceTaskModal';
import { ThemeSelectorModal } from './components/modals/ThemeSelectorModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { NewCategoryModal } from './components/modals/NewCategoryModal';
import { InstallPhoneModal } from './components/modals/InstallPhoneModal';

export default function App() {
  // App Core State
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadSavedData(STORAGE_KEYS.TASKS, getInitialTasks)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadSavedData(STORAGE_KEYS.CATEGORIES, () => DEFAULT_CATEGORIES)
  );
  const [habits, setHabits] = useState<Habit[]>(() =>
    loadSavedData(STORAGE_KEYS.HABITS, getInitialHabits)
  );
  const [countdowns, setCountdowns] = useState<Countdown[]>(() =>
    loadSavedData(STORAGE_KEYS.COUNTDOWNS, getInitialCountdowns)
  );
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() =>
    loadSavedData(STORAGE_KEYS.FOCUS_SESSIONS, getInitialFocusSessions)
  );
  const [scheduleConfig, setScheduleConfig] = useState<UserScheduleConfig>(() =>
    loadSavedData(STORAGE_KEYS.CONFIG, () => DEFAULT_SCHEDULE_CONFIG)
  );

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>(() => {
    const savedThemeId = localStorage.getItem(STORAGE_KEYS.THEME_ID);
    return THEME_PRESETS.find((t) => t.id === savedThemeId) || THEME_PRESETS[0];
  });

  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Focus active task
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);

  // Modals
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddInitialDate, setQuickAddInitialDate] = useState<string | undefined>();
  const [quickAddInitialTime, setQuickAddInitialTime] = useState<string | undefined>();
  const [showVoiceAdd, setShowVoiceAdd] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [showInstallPhoneModal, setShowInstallPhoneModal] = useState(false);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize and apply theme
  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem(STORAGE_KEYS.THEME_ID, currentTheme.id);
  }, [currentTheme]);

  // Persist data changes
  useEffect(() => {
    saveStorageData(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveStorageData(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveStorageData(STORAGE_KEYS.HABITS, habits);
  }, [habits]);

  useEffect(() => {
    saveStorageData(STORAGE_KEYS.COUNTDOWNS, countdowns);
  }, [countdowns]);

  useEffect(() => {
    saveStorageData(STORAGE_KEYS.FOCUS_SESSIONS, focusSessions);
  }, [focusSessions]);

  useEffect(() => {
    saveStorageData(STORAGE_KEYS.CONFIG, scheduleConfig);
  }, [scheduleConfig]);

  // Register Service Worker & capture PWA install
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration:', err);
      });
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Header Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySummary = calculateDayFreeTime(todayStr, tasks, scheduleConfig);
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedTodayCount = todayTasks.filter((t) => t.completed).length;

  // Habit check count due today
  const habitsDueToday = habits.filter((h) => !h.completions[todayStr]).length;

  // Toggle Task Completion
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null,
          };
        }
        return t;
      })
    );
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskDetail?.id === taskId) {
      setSelectedTaskDetail(null);
    }
    if (activeFocusTask?.id === taskId) {
      setActiveFocusTask(null);
    }
  };

  // Bulk complete & delete
  const handleBulkComplete = (taskIds: string[]) => {
    setTasks((prev) =>
      prev.map((t) =>
        taskIds.includes(t.id)
          ? { ...t, completed: true, completedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleBulkDelete = (taskIds: string[]) => {
    setTasks((prev) => prev.filter((t) => !taskIds.includes(t.id)));
  };

  // Update existing Task
  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTaskDetail(null);
  };

  // Create new task
  const handleCreateTask = (
    newTaskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'comments' | 'attachments' | 'order'>
  ) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: null,
      comments: [],
      attachments: [],
      order: tasks.length + 1,
    };
    setTasks([newTask, ...tasks]);
  };

  // Toggle Habit completion today
  const handleToggleHabitToday = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const currentlyDone = !!h.completions[todayStr];
          const newCompletions = { ...h.completions };

          if (currentlyDone) {
            delete newCompletions[todayStr];
            return {
              ...h,
              streak: Math.max(0, h.streak - 1),
              completions: newCompletions,
            };
          } else {
            newCompletions[todayStr] = true;
            const newStreak = h.streak + 1;
            return {
              ...h,
              streak: newStreak,
              bestStreak: Math.max(h.bestStreak, newStreak),
              completions: newCompletions,
            };
          }
        }
        return h;
      })
    );
  };

  // Add Habit
  const handleAddHabit = (
    habitData: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completions' | 'createdAt'>
  ) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      streak: 0,
      bestStreak: 0,
      completions: {},
      createdAt: new Date().toISOString(),
    };
    setHabits([...habits, newHabit]);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  // Add Countdown
  const handleAddCountdown = (cd: Omit<Countdown, 'id'>) => {
    const newCd: Countdown = {
      ...cd,
      id: `cd-${Date.now()}`,
    };
    setCountdowns([...countdowns, newCd]);
  };

  const handleDeleteCountdown = (id: string) => {
    setCountdowns(countdowns.filter((c) => c.id !== id));
  };

  // Record completed Pomodoro focus session
  const handleRecordFocusSession = (sessionData: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: `fs-${Date.now()}`,
    };
    setFocusSessions([newSession, ...focusSessions]);
  };

  // Schedule task in specific free slot
  const handleScheduleInSlot = (slot: FreeTimeSlot, dateStr: string) => {
    setQuickAddInitialDate(dateStr);
    setQuickAddInitialTime(slot.start);
    setShowQuickAdd(true);
  };

  // Export all application state to JSON file download
  const handleExportAllData = () => {
    const exportObject = {
      version: '2.0',
      appName: '화이팅 🌸 Hwaiting Productivity',
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
      habits,
      countdowns,
      focusSessions,
      scheduleConfig,
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hwaiting_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories);
      if (parsed.habits && Array.isArray(parsed.habits)) setHabits(parsed.habits);
      if (parsed.countdowns && Array.isArray(parsed.countdowns)) setCountdowns(parsed.countdowns);
      if (parsed.focusSessions && Array.isArray(parsed.focusSessions)) setFocusSessions(parsed.focusSessions);
      if (parsed.scheduleConfig) setScheduleConfig(parsed.scheduleConfig);
    } catch (e) {
      console.error('Import error:', e);
    }
  };

  // Reset to initial demo data
  const handleResetSampleData = () => {
    if (confirm('Are you sure you want to restore the initial starter data? Current tasks will be replaced.')) {
      setTasks(getInitialTasks());
      setHabits(getInitialHabits());
      setCountdowns(getInitialCountdowns());
      setCategories(DEFAULT_CATEGORIES);
      setFocusSessions(getInitialFocusSessions());
      setScheduleConfig(DEFAULT_SCHEDULE_CONFIG);
    }
  };

  // Dark/Light quick toggle
  const handleToggleDarkMode = () => {
    const targetIsDark = !currentTheme.isDark;
    const match = THEME_PRESETS.find((t) => t.isDark === targetIsDark) || THEME_PRESETS[0];
    setCurrentTheme(match);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--color-bg,#FFF9F2)] text-[var(--color-text,#3D3548)] transition-colors">
      {/* Top Header */}
      <Header
        currentTheme={currentTheme}
        onOpenQuickAdd={() => {
          setQuickAddInitialDate(todayStr);
          setQuickAddInitialTime(undefined);
          setShowQuickAdd(true);
        }}
        onOpenVoiceAdd={() => setShowVoiceAdd(true)}
        onOpenThemes={() => setShowThemeModal(true)}
        onOpenAi={() => setShowAiModal(true)}
        onOpenInstallPhone={() => setShowInstallPhoneModal(true)}
        onToggleDarkMode={handleToggleDarkMode}
        freeHoursToday={todaySummary.freeHours}
        completedTasksToday={completedTodayCount}
        totalTasksToday={todayTasks.length}
      />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catName) => setSelectedCategory(catName)}
          onOpenNewCategoryModal={() => setShowNewCategoryModal(true)}
          onOpenInstallPhone={() => setShowInstallPhoneModal(true)}
          pendingTaskCount={tasks.filter((t) => !t.completed).length}
          habitsDueToday={habitsDueToday}
        />

        {/* Central Viewport - compressed padding, single-frame overflow control */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-3.5 lg:p-4 max-w-7xl mx-auto w-full pb-16 lg:pb-4">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              habits={habits}
              countdowns={countdowns}
              focusSessions={focusSessions}
              scheduleConfig={scheduleConfig}
              onNavigate={(tab) => setActiveTab(tab)}
              onToggleTaskComplete={handleToggleTaskComplete}
              onToggleHabitToday={handleToggleHabitToday}
              onSelectTask={(t) => setSelectedTaskDetail(t)}
              onOpenQuickAdd={() => setShowQuickAdd(true)}
              onStartFocus={(t) => {
                setActiveFocusTask(t);
                setActiveTab('pomodoro');
              }}
            />
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Task View Submode Switcher (List vs Kanban) */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] text-xs">
                  <button
                    onClick={() => setTaskViewMode('list')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                      taskViewMode === 'list'
                        ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                        : 'text-[var(--color-muted,#7B6F8A)]'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setTaskViewMode('kanban')}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                      taskViewMode === 'kanban'
                        ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                        : 'text-[var(--color-muted,#7B6F8A)]'
                    }`}
                  >
                    Kanban Board
                  </button>
                </div>

                {selectedCategory && (
                  <div className="text-xs font-semibold text-[var(--color-text,#3D3548)] flex items-center gap-1.5">
                    <span>Filtering: <strong>{selectedCategory}</strong></span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-[var(--color-muted,#7B6F8A)] hover:underline text-[11px]"
                    >
                      (Clear)
                    </button>
                  </div>
                )}
              </div>

              {taskViewMode === 'list' ? (
                <TaskListView
                  tasks={tasks}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onToggleComplete={handleToggleTaskComplete}
                  onSelectTask={(t) => setSelectedTaskDetail(t)}
                  onDeleteTask={handleDeleteTask}
                  onBulkComplete={handleBulkComplete}
                  onBulkDelete={handleBulkDelete}
                  onStartFocusOnTask={(t) => {
                    setActiveFocusTask(t);
                    setActiveTab('pomodoro');
                  }}
                />
              ) : (
                <TaskKanbanView
                  tasks={tasks}
                  categories={categories}
                  onSelectTask={(t) => setSelectedTaskDetail(t)}
                  onMoveStatus={(taskId, newStatus) => {
                    setTasks((prev) =>
                      prev.map((t) => {
                        if (t.id === taskId) {
                          if (newStatus === 'done') {
                            return { ...t, completed: true, completedAt: new Date().toISOString() };
                          }
                          if (newStatus === 'inprogress') {
                            return { ...t, completed: false, quadrant: 'urgent-important', startTime: t.startTime || '14:00' };
                          }
                          return { ...t, completed: false };
                        }
                        return t;
                      })
                    );
                  }}
                  onOpenQuickAdd={() => setShowQuickAdd(true)}
                />
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              categories={categories}
              scheduleConfig={scheduleConfig}
              onSelectTask={(t) => setSelectedTaskDetail(t)}
              onOpenQuickAddWithDate={(dateStr, timeStr) => {
                setQuickAddInitialDate(dateStr);
                setQuickAddInitialTime(timeStr);
                setShowQuickAdd(true);
              }}
              onImportCalendar={handleExportAllData}
              onExportCalendar={handleExportAllData}
            />
          )}

          {activeTab === 'freetime' && (
            <FreeTimeDashboard
              tasks={tasks}
              scheduleConfig={scheduleConfig}
              onUpdateConfig={(c) => setScheduleConfig(c)}
              onScheduleInSlot={handleScheduleInSlot}
              onAskAiForFreeTime={(summary) => {
                setShowAiModal(true);
              }}
            />
          )}

          {activeTab === 'habits' && (
            <HabitTrackerView
              habits={habits}
              categories={categories}
              onToggleHabitToday={handleToggleHabitToday}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {activeTab === 'pomodoro' && (
            <PomodoroTimerView
              tasks={tasks}
              activeTask={activeFocusTask}
              onSelectActiveTask={(t) => setActiveFocusTask(t)}
              onRecordSession={handleRecordFocusSession}
              focusSessions={focusSessions}
            />
          )}

          {activeTab === 'matrix' && (
            <EisenhowerMatrixView
              tasks={tasks}
              onSelectTask={(t) => setSelectedTaskDetail(t)}
              onToggleComplete={handleToggleTaskComplete}
              onUpdateQuadrant={(taskId, quad) => {
                setTasks((prev) =>
                  prev.map((t) => (t.id === taskId ? { ...t, quadrant: quad } : t))
                );
              }}
              onAddTaskInQuadrant={(quad) => {
                setShowQuickAdd(true);
              }}
            />
          )}

          {activeTab === 'countdowns' && (
            <CountdownView
              countdowns={countdowns}
              onAddCountdown={handleAddCountdown}
              onDeleteCountdown={handleDeleteCountdown}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              tasks={tasks}
              categories={categories}
              habits={habits}
              focusSessions={focusSessions}
            />
          )}

          {activeTab === 'ai' && (
            <div className="max-w-3xl mx-auto py-4">
              <button
                onClick={() => setShowAiModal(true)}
                className="w-full p-8 rounded-3xl bg-[var(--color-primary,#F8C8DC)]/30 border border-[var(--color-border,#F1E4DF)] text-center space-y-3 hover:bg-[var(--color-primary,#F8C8DC)]/40 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary,#F8C8DC)] flex items-center justify-center text-2xl mx-auto shadow-2xs">
                  🌸
                </div>
                <h3 className="text-base font-bold text-[var(--color-text,#3D3548)]">
                  Launch 화이팅 AI Assistant
                </h3>
                <p className="text-xs text-[var(--color-muted,#7B6F8A)] max-w-md mx-auto">
                  Click here to start a chat with your AI mentor. Generate study schedules, break down large tasks, and find free time!
                </p>
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView
              scheduleConfig={scheduleConfig}
              onUpdateConfig={(c) => setScheduleConfig(c)}
              onExportAllData={handleExportAllData}
              onImportData={handleImportData}
              onResetSampleData={handleResetSampleData}
              deferredPrompt={deferredPrompt}
              onInstallPwa={handleInstallPwa}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenMoreMenu={() => setShowMobileMore(!showMobileMore)}
      />

      {/* Mobile More Drawer */}
      {showMobileMore && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end">
          <div className="w-full bg-[var(--color-card,#FFFFFF)] rounded-t-3xl border-t border-[var(--color-border,#F1E4DF)] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border,#F1E4DF)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)]">
                More Workspace Views
              </span>
              <button
                onClick={() => setShowMobileMore(false)}
                className="text-xs font-semibold text-[var(--color-muted,#7B6F8A)]"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => {
                  setActiveTab('matrix');
                  setShowMobileMore(false);
                }}
                className="p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-left hover:bg-[var(--color-primary,#F8C8DC)]/30"
              >
                🎯 Eisenhower Matrix
              </button>
              <button
                onClick={() => {
                  setActiveTab('countdowns');
                  setShowMobileMore(false);
                }}
                className="p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-left hover:bg-[var(--color-primary,#F8C8DC)]/30"
              >
                ⏳ Countdowns
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setShowMobileMore(false);
                }}
                className="p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-left hover:bg-[var(--color-primary,#F8C8DC)]/30"
              >
                📊 Analytics Report
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowMobileMore(false);
                }}
                className="p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-left hover:bg-[var(--color-primary,#F8C8DC)]/30"
              >
                ⚙️ Settings & Cloud
              </button>
              <button
                onClick={() => {
                  setShowInstallPhoneModal(true);
                  setShowMobileMore(false);
                }}
                className="col-span-2 p-3 rounded-2xl bg-[var(--color-primary,#F8C8DC)]/40 font-bold text-center hover:bg-[var(--color-primary,#F8C8DC)]/60 text-[var(--color-text,#3D3548)] transition-colors"
              >
                📱 How to Install on Phone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlaid Modals */}
      {selectedTaskDetail && (
        <TaskDetailModal
          task={selectedTaskDetail}
          categories={categories}
          onClose={() => setSelectedTaskDetail(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onStartFocus={(t) => {
            setActiveFocusTask(t);
            setActiveTab('pomodoro');
          }}
          onBreakdownWithAi={(taskTitle) => {
            setShowAiModal(true);
          }}
        />
      )}

      {showQuickAdd && (
        <QuickAddTaskModal
          categories={categories}
          initialDate={quickAddInitialDate}
          initialTime={quickAddInitialTime}
          initialCategory={selectedCategory || undefined}
          onClose={() => {
            setShowQuickAdd(false);
            setQuickAddInitialDate(undefined);
            setQuickAddInitialTime(undefined);
          }}
          onCreateTask={handleCreateTask}
        />
      )}

      {showVoiceAdd && (
        <VoiceTaskModal
          categories={categories}
          onClose={() => setShowVoiceAdd(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {showThemeModal && (
        <ThemeSelectorModal
          currentTheme={currentTheme}
          onSelectTheme={(theme) => setCurrentTheme(theme)}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {showAiModal && (
        <AIAssistantModal
          tasks={tasks}
          scheduleConfig={scheduleConfig}
          onClose={() => setShowAiModal(false)}
          onAddGeneratedTask={(title, cat, dur) => {
            handleCreateTask({
              title,
              category: cat,
              priority: 'P2',
              dueDate: todayStr,
              startTime: '16:00',
              durationMinutes: dur,
              description: 'Generated by 화이팅 AI Assistant',
              subtasks: [],
              tags: ['AI-Plan'],
              recurring: 'none',
              completed: false,
              reminders: ['15m'],
            });
          }}
        />
      )}

      {showNewCategoryModal && (
        <NewCategoryModal
          onClose={() => setShowNewCategoryModal(false)}
          onAddCategory={(newCat) => setCategories([...categories, newCat])}
        />
      )}

      {showInstallPhoneModal && (
        <InstallPhoneModal
          onClose={() => setShowInstallPhoneModal(false)}
          deferredPrompt={deferredPrompt}
          onInstallDirect={handleInstallPwa}
        />
      )}
    </div>
  );
}

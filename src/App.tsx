/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { ThemeSelectorModal } from './components/modals/ThemeSelectorModal';
import { NewCategoryModal } from './components/modals/NewCategoryModal';
import { SyncModal } from './components/modals/SyncModal';
import { AlarmToast } from './components/modals/AlarmToast';

// Firebase & Cloud Sync
import { User, testConnection } from './firebase/firebase';
import {
  initAuthAndSync,
  syncTaskToCloud,
  deleteTaskFromCloud,
  syncCategoryToCloud,
  syncHabitToCloud,
  deleteHabitFromCloud,
  syncCountdownToCloud,
  deleteCountdownFromCloud,
  syncConfigToCloud,
} from './firebase/syncService';
import {
  checkAndTriggerTaskReminders,
  startBackgroundAlarmWorker,
  subscribeToTaskAlarm,
  snoozeTaskAlarm,
} from './utils/notifications';

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

  // Cloud Auth & Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'synced' | 'offline' | 'error'>('connecting');
  const [showSyncModal, setShowSyncModal] = useState(false);

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

  // Modals & Floating Alarms
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddInitialDate, setQuickAddInitialDate] = useState<string | undefined>();
  const [quickAddInitialTime, setQuickAddInitialTime] = useState<string | undefined>();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Ref to hold current tasks for notification timer
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // Initialize and apply theme
  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem(STORAGE_KEYS.THEME_ID, currentTheme.id);
  }, [currentTheme]);

  // Persist data locally as offline fallback
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

  // Setup Real-time Firebase Firestore Sync
  useEffect(() => {
    testConnection();

    const unsubscribe = initAuthAndSync(
      {
        onUserChanged: (u) => setCurrentUser(u),
        onTasksChanged: (remoteTasks) => {
          if (remoteTasks && remoteTasks.length > 0) {
            setTasks(remoteTasks);
          }
        },
        onCategoriesChanged: (remoteCats) => {
          if (remoteCats && remoteCats.length > 0) {
            setCategories(remoteCats);
          }
        },
        onHabitsChanged: (remoteHabits) => {
          if (remoteHabits && remoteHabits.length > 0) {
            setHabits(remoteHabits);
          }
        },
        onCountdownsChanged: (remoteCds) => {
          if (remoteCds && remoteCds.length > 0) {
            setCountdowns(remoteCds);
          }
        },
        onConfigChanged: (remoteConfig) => {
          setScheduleConfig(remoteConfig);
        },
        onThemeChanged: (themeId) => {
          const match = THEME_PRESETS.find((t) => t.id === themeId);
          if (match) setCurrentTheme(match);
        },
        onSyncStatusChanged: (status) => setSyncStatus(status),
      },
      () => ({
        tasks: loadSavedData(STORAGE_KEYS.TASKS, getInitialTasks),
        categories: loadSavedData(STORAGE_KEYS.CATEGORIES, () => DEFAULT_CATEGORIES),
        habits: loadSavedData(STORAGE_KEYS.HABITS, getInitialHabits),
        countdowns: loadSavedData(STORAGE_KEYS.COUNTDOWNS, getInitialCountdowns),
        config: loadSavedData(STORAGE_KEYS.CONFIG, () => DEFAULT_SCHEDULE_CONFIG),
        themeId: currentTheme.id,
      })
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Background Reminder Ticker & Web Audio Alarm Subscriber
  useEffect(() => {
    // 1. Subscribe to in-app floating alarm toast notifications
    const unsubscribeAlarm = subscribeToTaskAlarm((task) => {
      setActiveAlarmTask(task);
    });

    // 2. Start background alarm ticker via inline Web Worker (unthrottled across tabs)
    const stopWorker = startBackgroundAlarmWorker(() => {
      checkAndTriggerTaskReminders(tasksRef.current);
    });

    // Run immediate check upon mount
    checkAndTriggerTaskReminders(tasksRef.current);

    return () => {
      unsubscribeAlarm();
      stopWorker();
    };
  }, []);

  // Register Service Worker
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
          const updated: Task = {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : null,
          };
          syncTaskToCloud(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteTaskFromCloud(taskId);
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
      prev.map((t) => {
        if (taskIds.includes(t.id)) {
          const updated: Task = { ...t, completed: true, completedAt: new Date().toISOString() };
          syncTaskToCloud(updated);
          return updated;
        }
        return t;
      })
    );
  };

  const handleBulkDelete = (taskIds: string[]) => {
    setTasks((prev) => prev.filter((t) => !taskIds.includes(t.id)));
    taskIds.forEach((id) => deleteTaskFromCloud(id));
  };

  // Update existing Task
  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    syncTaskToCloud(updated);
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
    syncTaskToCloud(newTask);
  };

  // Toggle Habit completion today
  const handleToggleHabitToday = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const currentlyDone = !!h.completions[todayStr];
          const newCompletions = { ...h.completions };
          let updated: Habit;

          if (currentlyDone) {
            delete newCompletions[todayStr];
            updated = {
              ...h,
              streak: Math.max(0, h.streak - 1),
              completions: newCompletions,
            };
          } else {
            newCompletions[todayStr] = true;
            const newStreak = h.streak + 1;
            updated = {
              ...h,
              streak: newStreak,
              bestStreak: Math.max(h.bestStreak, newStreak),
              completions: newCompletions,
            };
          }
          syncHabitToCloud(updated);
          return updated;
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
    syncHabitToCloud(newHabit);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
    deleteHabitFromCloud(id);
  };

  // Add Countdown
  const handleAddCountdown = (cd: Omit<Countdown, 'id'>) => {
    const newCd: Countdown = {
      ...cd,
      id: `cd-${Date.now()}`,
    };
    setCountdowns([...countdowns, newCd]);
    syncCountdownToCloud(newCd);
  };

  const handleDeleteCountdown = (id: string) => {
    setCountdowns(countdowns.filter((c) => c.id !== id));
    deleteCountdownFromCloud(id);
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

  // Export all application state to JSON file download (Pure Korean title)
  const handleExportAllData = () => {
    const exportObject = {
      version: '2.0',
      appName: '화이팅 🌸',
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
    a.download = `화이팅_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        setTasks(parsed.tasks);
        parsed.tasks.forEach((t: Task) => syncTaskToCloud(t));
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
        parsed.categories.forEach((c: Category) => syncCategoryToCloud(c));
      }
      if (parsed.habits && Array.isArray(parsed.habits)) {
        setHabits(parsed.habits);
        parsed.habits.forEach((h: Habit) => syncHabitToCloud(h));
      }
      if (parsed.countdowns && Array.isArray(parsed.countdowns)) {
        setCountdowns(parsed.countdowns);
        parsed.countdowns.forEach((cd: Countdown) => syncCountdownToCloud(cd));
      }
      if (parsed.focusSessions && Array.isArray(parsed.focusSessions)) setFocusSessions(parsed.focusSessions);
      if (parsed.scheduleConfig) {
        setScheduleConfig(parsed.scheduleConfig);
        syncConfigToCloud(parsed.scheduleConfig, currentTheme.id);
      }
    } catch (e) {
      console.error('Import error:', e);
    }
  };

  // Reset to initial demo data
  const handleResetSampleData = () => {
    if (confirm('Reset to sample starter data? Current changes will be replaced.')) {
      const initTasks = getInitialTasks();
      const initCats = DEFAULT_CATEGORIES;
      const initHabits = getInitialHabits();
      const initCds = getInitialCountdowns();

      setTasks(initTasks);
      setCategories(initCats);
      setHabits(initHabits);
      setCountdowns(initCds);
      setFocusSessions(getInitialFocusSessions());
      setScheduleConfig(DEFAULT_SCHEDULE_CONFIG);

      initTasks.forEach((t) => syncTaskToCloud(t));
      initCats.forEach((c) => syncCategoryToCloud(c));
      initHabits.forEach((h) => syncHabitToCloud(h));
      initCds.forEach((cd) => syncCountdownToCloud(cd));
      syncConfigToCloud(DEFAULT_SCHEDULE_CONFIG, currentTheme.id);
    }
  };

  // Dark/Light quick toggle
  const handleToggleDarkMode = () => {
    const targetIsDark = !currentTheme.isDark;
    const match = THEME_PRESETS.find((t) => t.isDark === targetIsDark) || THEME_PRESETS[0];
    setCurrentTheme(match);
    syncConfigToCloud(scheduleConfig, match.id);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[var(--color-bg,#FFF9F2)] text-[var(--color-text,#3D3548)] transition-colors">
      {/* Top Header - Pure Korean, Cloud Sync, No phone install, No mic/AI */}
      <Header
        currentTheme={currentTheme}
        onOpenQuickAdd={() => {
          setQuickAddInitialDate(todayStr);
          setQuickAddInitialTime(undefined);
          setShowQuickAdd(true);
        }}
        onOpenThemes={() => setShowThemeModal(true)}
        onOpenSync={() => setShowSyncModal(true)}
        onToggleDarkMode={handleToggleDarkMode}
        freeHoursToday={todaySummary.freeHours}
        completedTasksToday={completedTodayCount}
        totalTasksToday={todayTasks.length}
        syncStatus={syncStatus}
        isLoggedIn={!!currentUser && !currentUser.isAnonymous}
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
          onOpenSync={() => setShowSyncModal(true)}
          pendingTaskCount={tasks.filter((t) => !t.completed).length}
          habitsDueToday={habitsDueToday}
          syncStatus={syncStatus}
        />

        {/* Central Viewport - Mobile friendly padding & single-frame overflow control */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-3.5 lg:p-4 max-w-7xl mx-auto w-full pb-20 lg:pb-4">
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
                    <span>Filter: <strong>{selectedCategory}</strong></span>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-[var(--color-muted,#7B6F8A)] hover:underline text-[11px] cursor-pointer"
                    >
                      (View All)
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
                          let updated: Task;
                          if (newStatus === 'done') {
                            updated = { ...t, completed: true, completedAt: new Date().toISOString() };
                          } else if (newStatus === 'inprogress') {
                            updated = { ...t, completed: false, quadrant: 'urgent-important', startTime: t.startTime || '14:00' };
                          } else {
                            updated = { ...t, completed: false };
                          }
                          syncTaskToCloud(updated);
                          return updated;
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
              onUpdateScheduleConfig={(c) => {
                setScheduleConfig(c);
                syncConfigToCloud(c, currentTheme.id);
              }}
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
              onUpdateConfig={(c) => {
                setScheduleConfig(c);
                syncConfigToCloud(c, currentTheme.id);
              }}
              onScheduleInSlot={handleScheduleInSlot}
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
                  prev.map((t) => {
                    if (t.id === taskId) {
                      const updated = { ...t, quadrant: quad };
                      syncTaskToCloud(updated);
                      return updated;
                    }
                    return t;
                  })
                );
              }}
              onAddTaskInQuadrant={() => {
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

          {activeTab === 'settings' && (
            <SettingsView
              scheduleConfig={scheduleConfig}
              onUpdateConfig={(c) => {
                setScheduleConfig(c);
                syncConfigToCloud(c, currentTheme.id);
              }}
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
          <div className="w-full bg-[var(--color-card,#FFFFFF)] rounded-t-3xl border-t border-[var(--color-border,#F1E4DF)] p-6 space-y-4 shadow-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border,#F1E4DF)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted,#7B6F8A)]">
                More Views
              </span>
              <button
                onClick={() => setShowMobileMore(false)}
                className="text-xs font-semibold text-[var(--color-muted,#7B6F8A)] cursor-pointer"
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
                className="p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-left hover:bg-[var(--color-primary,#F8C8DC)]/30 cursor-pointer"
              >
                🎯 Eisenhower Matrix
              </button>
              <button
                onClick={() => {
                  setActiveTab('countdowns');
                  setShowMobileMore(false);
                }}
                className="p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-left hover:bg-[var(--color-primary,#F8C8DC)]/30 cursor-pointer"
              >
                ⏳ D-Day Countdowns
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setShowMobileMore(false);
                }}
                className="p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-left hover:bg-[var(--color-primary,#F8C8DC)]/30 cursor-pointer"
              >
                📊 Productivity Analytics
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowMobileMore(false);
                }}
                className="p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] text-left hover:bg-[var(--color-primary,#F8C8DC)]/30 cursor-pointer"
              >
                ⚙️ Settings & Backup
              </button>
              <button
                onClick={() => {
                  setShowSyncModal(true);
                  setShowMobileMore(false);
                }}
                className="col-span-2 p-3 rounded-2xl bg-[var(--color-primary,#F8C8DC)]/40 font-bold text-center hover:bg-[var(--color-primary,#F8C8DC)]/60 text-[var(--color-text,#3D3548)] transition-colors cursor-pointer"
              >
                ☁️ Cloud Sync (Multi-Device)
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

      {showThemeModal && (
        <ThemeSelectorModal
          currentTheme={currentTheme}
          onSelectTheme={(theme) => {
            setCurrentTheme(theme);
            syncConfigToCloud(scheduleConfig, theme.id);
          }}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {showNewCategoryModal && (
        <NewCategoryModal
          onClose={() => setShowNewCategoryModal(false)}
          onAddCategory={(newCat) => {
            setCategories([...categories, newCat]);
            syncCategoryToCloud(newCat);
          }}
        />
      )}

      {showSyncModal && (
        <SyncModal
          user={currentUser}
          syncStatus={syncStatus}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      {/* In-App Floating Alarm Banner for Scheduled Start Times */}
      {activeAlarmTask && (
        <AlarmToast
          task={activeAlarmTask}
          onDismiss={() => setActiveAlarmTask(null)}
          onSnooze={(taskId) => {
            snoozeTaskAlarm(taskId, 5);
            setActiveAlarmTask(null);
          }}
          onStartFocus={(task) => {
            setActiveFocusTask(task);
            setActiveTab('pomodoro');
            setActiveAlarmTask(null);
          }}
        />
      )}
    </div>
  );
}

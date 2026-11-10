import { Task, Category, Habit, Countdown, FocusSession, UserScheduleConfig } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-study', name: 'Study', emoji: '📚', color: '#DCCBFF' },
  { id: 'cat-college', name: 'College', emoji: '🏫', color: '#CDEBFF' },
  { id: 'cat-coding', name: 'Coding', emoji: '💻', color: '#CFF5E7' },
  { id: 'cat-gate', name: 'GATE Preparation', emoji: '🧠', color: '#FFE0C2' },
  { id: 'cat-assignments', name: 'Assignments', emoji: '📝', color: '#F8C8DC' },
  { id: 'cat-personal', name: 'Personal', emoji: '🎀', color: '#FAD2E1' },
  { id: 'cat-health', name: 'Health', emoji: '🏃', color: '#BBF7D0' },
  { id: 'cat-entertainment', name: 'Entertainment', emoji: '🎮', color: '#DDD6FE' },
  { id: 'cat-selfcare', name: 'Self-care', emoji: '🌸', color: '#FECDD3' },
  { id: 'cat-reading', name: 'Reading', emoji: '📖', color: '#FED7AA' },
  { id: 'cat-career', name: 'Career', emoji: '💼', color: '#BAE6FD' },
  { id: 'cat-goals', name: 'Goals', emoji: '✨', color: '#FDE68A' },
];

export const DEFAULT_SCHEDULE_CONFIG: UserScheduleConfig = {
  wakeTime: '07:00',
  sleepTime: '23:00',
  dailyGoalFocusMinutes: 120,
  dailyGoalTasks: 6,
};

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getInitialTasks(): Task[] {
  const today = getTodayString();

  return [
    {
      id: 'task-welcome',
      title: 'Welcome to 화이팅! 🌸 (Sample Task)',
      description: 'Click to edit or delete this sample task. You can add scheduled classes, timetable blocks, or To-Dos!',
      category: 'Study',
      priority: 'P2',
      dueDate: today,
      startTime: '09:00',
      durationMinutes: 60,
      subtasks: [
        { id: 'st-1', text: 'Customize your daily schedule in Settings', completed: false },
        { id: 'st-2', text: 'Try adding your first task or timetable block', completed: false },
      ],
      tags: ['GettingStarted', '화이팅'],
      recurring: 'none',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminders: ['15m'],
      comments: [],
      attachments: [],
      order: 1,
      quadrant: 'urgent-important',
      isTodo: false,
    },
  ];
}

export function getInitialHabits(): Habit[] {
  const today = getTodayString();

  return [
    {
      id: 'habit-welcome',
      name: 'Drink 2L Water Daily 💧 (Sample Habit)',
      emoji: '💧',
      category: 'Health',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      streak: 1,
      bestStreak: 1,
      completions: {
        [today]: true,
      },
      reminderTime: '09:00',
      notes: 'Stay hydrated throughout the day! Easily edit or delete this habit.',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getInitialCountdowns(): Countdown[] {
  return [
    {
      id: 'cd-1',
      title: '🎓 Semester Exams / Target Goal',
      category: 'Exams',
      targetDate: '2026-12-15',
      targetTime: '09:00',
      emoji: '🎓',
      themeColor: '#FFE0C2',
      notes: 'Stay focused every day! Easily edit or delete this countdown.',
    },
  ];
}

export function getInitialFocusSessions(): FocusSession[] {
  return [];
}

const STORAGE_KEYS = {
  TASKS: 'hwaiting_tasks_v3',
  CATEGORIES: 'hwaiting_categories_v3',
  HABITS: 'hwaiting_habits_v3',
  COUNTDOWNS: 'hwaiting_countdowns_v3',
  FOCUS_SESSIONS: 'hwaiting_focus_sessions_v3',
  CONFIG: 'hwaiting_schedule_config_v3',
  THEME_ID: 'hwaiting_theme_id_v3',
  USER_PROFILE: 'hwaiting_user_profile_v3',
};

export function loadSavedData<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback();
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse localStorage key ${key}, using fallback:`, e);
    return fallback();
  }
}

export function saveStorageData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage key ${key}:`, e);
  }
}

export { STORAGE_KEYS };

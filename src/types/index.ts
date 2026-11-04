export type Priority = 'P1' | 'P2' | 'P3' | 'P4'; // P1: Urgent/Critical, P2: High, P3: Medium, P4: Low

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  dueDate: string | null; // YYYY-MM-DD
  startTime: string | null; // HH:MM
  durationMinutes: number; // e.g. 30, 60, 120
  subtasks: Subtask[];
  tags: string[];
  recurring: 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  reminders: string[]; // e.g. ['0m', '15m', '1h', '1d']
  comments: TaskComment[];
  attachments: TaskAttachment[];
  color?: string;
  quadrant?: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  order: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isCustom?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  frequency: 'daily' | 'weekdays' | 'custom';
  targetDaysPerWeek: number;
  streak: number;
  bestStreak: number;
  completions: Record<string, boolean>; // key: 'YYYY-MM-DD'
  reminderTime?: string;
  notes?: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  type: 'pomodoro' | 'shortBreak' | 'longBreak';
  completedAt: string;
}

export interface Countdown {
  id: string;
  title: string;
  category: 'Exams' | 'Assignments' | 'Birthdays' | 'Events' | 'Vacations' | 'Personal' | 'Deadlines';
  targetDate: string; // YYYY-MM-DD
  targetTime: string; // HH:MM
  emoji: string;
  themeColor: string;
  notes?: string;
}

export interface UserScheduleConfig {
  wakeTime: string; // '07:00'
  sleepTime: string; // '23:00'
  dailyGoalFocusMinutes: number; // e.g. 120
  dailyGoalTasks: number; // e.g. 5
}

export interface ThemePreset {
  id: string;
  name: string;
  emoji: string;
  koreanName?: string;
  primary: string; // Accent / Button color
  secondary: string;
  accent: string;
  bg: string;
  cardBg: string;
  text: string;
  mutedText: string;
  border: string;
  isDark?: boolean;
}

export interface FreeTimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
  durationMinutes: number;
}

export interface DayFreeTimeSummary {
  date: string;
  awakeHours: number;
  scheduledHours: number;
  freeHours: number;
  categoryHours: Record<string, number>;
  freeSlots: FreeTimeSlot[];
  hasConflict: boolean;
  conflictDetails?: string[];
}

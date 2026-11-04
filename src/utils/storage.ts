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
  const tomorrow = getDateOffset(1);
  const dayAfter = getDateOffset(2);

  return [
    {
      id: 'task-1',
      title: 'DBMS Normalization & BCNF Practice Problems',
      description: 'Solve 15 previous year GATE questions on 3NF vs BCNF dependency preservation.',
      category: 'GATE Preparation',
      priority: 'P1',
      dueDate: today,
      startTime: '09:00',
      durationMinutes: 120, // 2h
      subtasks: [
        { id: 'st-1', text: 'Review closure set of functional dependencies', completed: true },
        { id: 'st-2', text: 'Solve 10 textbook problems on loss-less join decomposition', completed: true },
        { id: 'st-3', text: 'Note down tricky edge cases for foreign key constraints', completed: false },
      ],
      tags: ['GATE', 'CS', 'DBMS'],
      recurring: 'none',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminders: ['15m'],
      comments: [
        { id: 'c-1', text: 'Double check question 12 regarding candidate keys.', createdAt: new Date().toISOString() },
      ],
      attachments: [],
      order: 1,
      quadrant: 'urgent-important',
    },
    {
      id: 'task-2',
      title: 'Operating Systems Virtual Memory Lecture',
      description: 'Attend College CSE module on Page Replacement Algorithms (LRU, FIFO, Optimal).',
      category: 'College',
      priority: 'P2',
      dueDate: today,
      startTime: '13:00',
      durationMinutes: 90, // 1.5h
      subtasks: [
        { id: 'st-4', text: 'Download lecture slides and prepare questions', completed: true },
        { id: 'st-5', text: 'Implement sample Belady anomaly simulation', completed: false },
      ],
      tags: ['College', 'OS', 'Lecture'],
      recurring: 'weekdays',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminders: ['10m'],
      comments: [],
      attachments: [],
      order: 2,
      quadrant: 'urgent-important',
    },
    {
      id: 'task-3',
      title: 'Build Full-Stack Express & Vite API Endpoint',
      description: 'Wire up clean TypeScript routes and connect client hooks with proper loading states.',
      category: 'Coding',
      priority: 'P2',
      dueDate: today,
      startTime: '15:30',
      durationMinutes: 90,
      subtasks: [
        { id: 'st-6', text: 'Setup route handler & schema validation', completed: false },
        { id: 'st-7', text: 'Verify offline fallback persistence', completed: false },
      ],
      tags: ['FullStack', 'React', 'TypeScript'],
      recurring: 'none',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminders: [],
      comments: [],
      attachments: [],
      order: 3,
      quadrant: 'not-urgent-important',
    },
    {
      id: 'task-4',
      title: 'Mindful Evening Herbal Tea & Reading 📖',
      description: 'Read 25 pages of "Atomic Habits" with soothing chamomile tea.',
      category: 'Self-care',
      priority: 'P3',
      dueDate: today,
      startTime: '20:30',
      durationMinutes: 45,
      subtasks: [
        { id: 'st-8', text: 'Brew tea and turn on soft lo-fi ambience', completed: false },
        { id: 'st-9', text: 'Highlight favorite passages', completed: false },
      ],
      tags: ['Self-care', 'Reading', 'Peace'],
      recurring: 'daily',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminders: ['5m'],
      comments: [],
      attachments: [],
      order: 4,
      quadrant: 'not-urgent-important',
    },
    {
      id: 'task-5',
      title: 'Morning 3km Jog & Stretching 🏃',
      description: 'Crisp morning jog in the park to wake up body and mind.',
      category: 'Health',
      priority: 'P3',
      dueDate: today,
      startTime: '07:15',
      durationMinutes: 45,
      subtasks: [],
      tags: ['Health', 'Morning'],
      recurring: 'daily',
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      reminders: [],
      comments: [],
      attachments: [],
      order: 5,
      quadrant: 'urgent-not-important',
    },
    {
      id: 'task-6',
      title: 'Data Structures Graph Algorithms Revision',
      description: 'BFS, DFS, Dijkstra, and Topological Sort GATE test series.',
      category: 'GATE Preparation',
      priority: 'P1',
      dueDate: tomorrow,
      startTime: '10:00',
      durationMinutes: 120,
      subtasks: [
        { id: 'st-10', text: 'Write clean recursive DFS with cycle detection', completed: false },
        { id: 'st-11', text: 'Practice 5 previous year GATE problems', completed: false },
      ],
      tags: ['GATE', 'DSA'],
      recurring: 'none',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminders: ['1h'],
      comments: [],
      attachments: [],
      order: 6,
      quadrant: 'urgent-important',
    },
    {
      id: 'task-7',
      title: 'Submit Distributed Systems Lab Report',
      description: 'Compile benchmarks and submit PDF to college portal.',
      category: 'Assignments',
      priority: 'P1',
      dueDate: dayAfter,
      startTime: '14:00',
      durationMinutes: 60,
      subtasks: [],
      tags: ['College', 'Submission'],
      recurring: 'none',
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      reminders: ['1d'],
      comments: [],
      attachments: [],
      order: 7,
      quadrant: 'urgent-important',
    },
  ];
}

export function getInitialHabits(): Habit[] {
  const today = getTodayString();
  const yest = getDateOffset(-1);
  const twoDaysAgo = getDateOffset(-2);
  const threeDaysAgo = getDateOffset(-3);

  return [
    {
      id: 'habit-1',
      name: 'Drink 2.5L Water Daily 💧',
      emoji: '💧',
      category: 'Health',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      streak: 12,
      bestStreak: 24,
      completions: {
        [threeDaysAgo]: true,
        [twoDaysAgo]: true,
        [yest]: true,
        [today]: true,
      },
      reminderTime: '09:00',
      notes: 'Hydration keeps brain focus high for GATE revision.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-2',
      name: 'Read 20 Pages 📖',
      emoji: '📖',
      category: 'Reading',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      streak: 8,
      bestStreak: 15,
      completions: {
        [threeDaysAgo]: true,
        [twoDaysAgo]: true,
        [yest]: true,
      },
      reminderTime: '21:00',
      notes: 'Currently reading Atomic Habits & Clean Architecture.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-3',
      name: 'Solve 10 GATE Problems 🧠',
      emoji: '🧠',
      category: 'GATE Preparation',
      frequency: 'daily',
      targetDaysPerWeek: 6,
      streak: 19,
      bestStreak: 28,
      completions: {
        [threeDaysAgo]: true,
        [twoDaysAgo]: true,
        [yest]: true,
        [today]: true,
      },
      reminderTime: '10:00',
      notes: 'Consistency is the secret to a top 100 rank!',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-4',
      name: 'Practice Coding 1h 💻',
      emoji: '💻',
      category: 'Coding',
      frequency: 'weekdays',
      targetDaysPerWeek: 5,
      streak: 14,
      bestStreak: 30,
      completions: {
        [threeDaysAgo]: true,
        [twoDaysAgo]: true,
        [yest]: true,
      },
      reminderTime: '16:00',
      notes: 'LeetCode / project architecture building.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'habit-5',
      name: 'Evening Gratitude & Stretch 🌸',
      emoji: '🌸',
      category: 'Self-care',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      streak: 6,
      bestStreak: 18,
      completions: {
        [twoDaysAgo]: true,
        [yest]: true,
      },
      reminderTime: '22:00',
      notes: 'Quiet mind before sleep.',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getInitialCountdowns(): Countdown[] {
  return [
    {
      id: 'cd-1',
      title: '🎓 GATE CS & IT Examination',
      category: 'Exams',
      targetDate: '2027-02-06',
      targetTime: '09:00',
      emoji: '🎓',
      themeColor: '#FFE0C2',
      notes: 'Dream college M.Tech & PSU qualification. Stay focused every day!',
    },
    {
      id: 'cd-2',
      title: '🏫 College Major Project Submission',
      category: 'Assignments',
      targetDate: '2026-12-15',
      targetTime: '17:00',
      emoji: '💻',
      themeColor: '#CDEBFF',
      notes: 'Complete documentation, performance graphs, and viva demo.',
    },
    {
      id: 'cd-3',
      title: '✈️ Seoul Autumn Trip Vacation',
      category: 'Vacations',
      targetDate: '2027-04-10',
      targetTime: '08:00',
      emoji: '🌸',
      themeColor: '#F8C8DC',
      notes: 'Cherry blossoms at Yeouido Park and cafe hopping!',
    },
  ];
}

export function getInitialFocusSessions(): FocusSession[] {
  const today = getTodayString();
  return [
    {
      id: 'fs-1',
      taskTitle: 'DBMS Normalization & BCNF',
      durationMinutes: 25,
      type: 'pomodoro',
      completedAt: `${today}T10:30:00Z`,
    },
    {
      id: 'fs-2',
      taskTitle: 'DBMS Normalization & BCNF',
      durationMinutes: 25,
      type: 'pomodoro',
      completedAt: `${today}T11:00:00Z`,
    },
    {
      id: 'fs-3',
      taskTitle: 'Morning Break',
      durationMinutes: 5,
      type: 'shortBreak',
      completedAt: `${today}T11:30:00Z`,
    },
  ];
}

const STORAGE_KEYS = {
  TASKS: 'hwaiting_tasks_v2',
  CATEGORIES: 'hwaiting_categories_v2',
  HABITS: 'hwaiting_habits_v2',
  COUNTDOWNS: 'hwaiting_countdowns_v2',
  FOCUS_SESSIONS: 'hwaiting_focus_sessions_v2',
  CONFIG: 'hwaiting_schedule_config_v2',
  THEME_ID: 'hwaiting_theme_id_v2',
  USER_PROFILE: 'hwaiting_user_profile_v2',
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

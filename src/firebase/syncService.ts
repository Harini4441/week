import { Task, Category, Habit, Countdown, UserScheduleConfig } from '../types';
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  handleFirestoreError,
  OperationType,
  User,
} from './firebase';

export interface SyncCallbacks {
  onUserChanged: (user: User | null) => void;
  onTasksChanged: (tasks: Task[]) => void;
  onCategoriesChanged: (categories: Category[]) => void;
  onHabitsChanged: (habits: Habit[]) => void;
  onCountdownsChanged: (countdowns: Countdown[]) => void;
  onConfigChanged: (config: UserScheduleConfig) => void;
  onThemeChanged: (themeId: string) => void;
  onSyncStatusChanged: (status: 'connecting' | 'synced' | 'offline' | 'error') => void;
}

let unsubTasks: (() => void) | null = null;
let unsubCategories: (() => void) | null = null;
let unsubHabits: (() => void) | null = null;
let unsubCountdowns: (() => void) | null = null;
let unsubProfile: (() => void) | null = null;

export function stopAllListeners() {
  unsubTasks?.();
  unsubCategories?.();
  unsubHabits?.();
  unsubCountdowns?.();
  unsubProfile?.();
  unsubTasks = null;
  unsubCategories = null;
  unsubHabits = null;
  unsubCountdowns = null;
  unsubProfile = null;
}

export function initAuthAndSync(callbacks: SyncCallbacks, getFallbackData: () => {
  tasks: Task[];
  categories: Category[];
  habits: Habit[];
  countdowns: Countdown[];
  config: UserScheduleConfig;
  themeId: string;
}) {
  callbacks.onSyncStatusChanged('connecting');

  return onAuthStateChanged(auth, async (user) => {
    callbacks.onUserChanged(user);

    if (!user) {
      callbacks.onSyncStatusChanged('offline');
      return;
    }

    callbacks.onSyncStatusChanged('synced');
    stopAllListeners();

    const userId = user.uid;
    const initialData = getFallbackData();

    // 1. Tasks Listener
    const tasksCol = collection(db, 'users', userId, 'tasks');
    unsubTasks = onSnapshot(
      tasksCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed cloud database from starter data on first login
          const starterTasks = initialData.tasks;
          for (const t of starterTasks) {
            try {
              await setDoc(doc(db, 'users', userId, 'tasks', t.id), {
                ...t,
                userId,
              });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, `users/${userId}/tasks/${t.id}`);
            }
          }
        } else {
          const loaded: Task[] = snapshot.docs.map((d) => d.data() as Task);
          // Sort by order or createdAt
          loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
          callbacks.onTasksChanged(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/tasks`);
        callbacks.onSyncStatusChanged('error');
      }
    );

    // 2. Categories Listener
    const catCol = collection(db, 'users', userId, 'categories');
    unsubCategories = onSnapshot(
      catCol,
      async (snapshot) => {
        if (snapshot.empty) {
          for (const c of initialData.categories) {
            try {
              await setDoc(doc(db, 'users', userId, 'categories', c.id), {
                ...c,
                userId,
              });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, `users/${userId}/categories/${c.id}`);
            }
          }
        } else {
          const loaded: Category[] = snapshot.docs.map((d) => d.data() as Category);
          callbacks.onCategoriesChanged(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/categories`);
      }
    );

    // 3. Habits Listener
    const habitsCol = collection(db, 'users', userId, 'habits');
    unsubHabits = onSnapshot(
      habitsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          for (const h of initialData.habits) {
            try {
              await setDoc(doc(db, 'users', userId, 'habits', h.id), {
                ...h,
                userId,
              });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, `users/${userId}/habits/${h.id}`);
            }
          }
        } else {
          const loaded: Habit[] = snapshot.docs.map((d) => d.data() as Habit);
          callbacks.onHabitsChanged(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/habits`);
      }
    );

    // 4. Countdowns Listener
    const countdownsCol = collection(db, 'users', userId, 'countdowns');
    unsubCountdowns = onSnapshot(
      countdownsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          for (const cd of initialData.countdowns) {
            try {
              await setDoc(doc(db, 'users', userId, 'countdowns', cd.id), {
                ...cd,
                userId,
              });
            } catch (e) {
              handleFirestoreError(e, OperationType.WRITE, `users/${userId}/countdowns/${cd.id}`);
            }
          }
        } else {
          const loaded: Countdown[] = snapshot.docs.map((d) => d.data() as Countdown);
          callbacks.onCountdownsChanged(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${userId}/countdowns`);
      }
    );

    // 5. User Profile Document Listener
    const userDocRef = doc(db, 'users', userId);
    unsubProfile = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.wakeTime && data.sleepTime) {
            callbacks.onConfigChanged({
              wakeTime: data.wakeTime,
              sleepTime: data.sleepTime,
              dailyGoalFocusMinutes: data.dailyGoalFocusMinutes || 120,
              dailyGoalTasks: data.dailyGoalTasks || 6,
            });
          }
          if (data.themeId) {
            callbacks.onThemeChanged(data.themeId);
          }
        } else {
          // Initialize user profile
          await setDoc(userDocRef, {
            userId,
            email: user.email || 'guest@hwaiting.app',
            wakeTime: initialData.config.wakeTime,
            sleepTime: initialData.config.sleepTime,
            dailyGoalFocusMinutes: initialData.config.dailyGoalFocusMinutes,
            dailyGoalTasks: initialData.config.dailyGoalTasks,
            themeId: initialData.themeId,
            updatedAt: new Date().toISOString(),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    );
  });
}

// Cloud Mutation Operations
export async function syncTaskToCloud(task: Task) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, 'users', user.uid, 'tasks', task.id), {
      ...task,
      userId: user.uid,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/tasks/${task.id}`);
  }
}

export async function deleteTaskFromCloud(taskId: string) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/tasks/${taskId}`);
  }
}

export async function syncCategoryToCloud(category: Category) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, 'users', user.uid, 'categories', category.id), {
      ...category,
      userId: user.uid,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/categories/${category.id}`);
  }
}

export async function syncHabitToCloud(habit: Habit) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, 'users', user.uid, 'habits', habit.id), {
      ...habit,
      userId: user.uid,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/habits/${habit.id}`);
  }
}

export async function deleteHabitFromCloud(habitId: string) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'habits', habitId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/habits/${habitId}`);
  }
}

export async function syncCountdownToCloud(countdown: Countdown) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(doc(db, 'users', user.uid, 'countdowns', countdown.id), {
      ...countdown,
      userId: user.uid,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/countdowns/${countdown.id}`);
  }
}

export async function deleteCountdownFromCloud(countdownId: string) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'countdowns', countdownId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/countdowns/${countdownId}`);
  }
}

export async function syncConfigToCloud(config: UserScheduleConfig, themeId: string) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        userId: user.uid,
        wakeTime: config.wakeTime,
        sleepTime: config.sleepTime,
        dailyGoalFocusMinutes: config.dailyGoalFocusMinutes,
        dailyGoalTasks: config.dailyGoalTasks,
        themeId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }
}

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export async function logoutUser() {
  stopAllListeners();
  await signOut(auth);
}

import { Task } from '../types';
import { playTaskAlarm, unlockAudioContext } from './audio';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

// Track triggered tasks so they only alarm once per day unless snoozed
const triggeredReminders = new Set<string>();
const snoozedReminders = new Map<string, number>(); // taskId -> timestamp until which it is snoozed

let titleFlasherInterval: any = null;
let originalTitle = typeof document !== 'undefined' ? document.title || '화이팅 🌸' : '화이팅 🌸';

export function stopTitleFlashing() {
  if (titleFlasherInterval) {
    clearInterval(titleFlasherInterval);
    titleFlasherInterval = null;
    if (typeof document !== 'undefined') {
      document.title = '화이팅 🌸';
    }
  }
}

// Listen for tab focus to automatically clear flashing title
if (typeof window !== 'undefined') {
  window.addEventListener('focus', stopTitleFlashing);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      stopTitleFlashing();
    }
  });
}

/**
 * Flashes browser tab title back and forth so users looking at another tab immediately see the alert
 */
function startTitleFlashing(taskTitle: string) {
  stopTitleFlashing();
  let state = false;
  titleFlasherInterval = setInterval(() => {
    if (typeof document !== 'undefined') {
      document.title = state ? `🔔 [Start Task!] ${taskTitle}` : '🌸 화이팅';
      state = !state;
    }
  }, 750);

  // Auto-stop after 45 seconds to avoid infinite flashing
  setTimeout(stopTitleFlashing, 45000);
}

// Global active alarm listener for in-app floating banner
type AlarmListener = (task: Task) => void;
const alarmListeners = new Set<AlarmListener>();

export function subscribeToTaskAlarm(listener: AlarmListener): () => void {
  alarmListeners.add(listener);
  return () => alarmListeners.delete(listener);
}

export function snoozeTaskAlarm(taskId: string, minutes: number = 5) {
  const snoozeUntil = Date.now() + minutes * 60 * 1000;
  snoozedReminders.set(taskId, snoozeUntil);
  stopTitleFlashing();
}

/**
 * Core Alarm Trigger: Runs on every tick, checks start time, and fires Web Audio chime + notifications
 */
export function checkAndTriggerTaskReminders(tasks: Task[]) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nowMs = now.getTime();

  tasks.forEach((task) => {
    if (task.completed || !task.dueDate || task.dueDate !== todayStr || !task.startTime) {
      return;
    }

    // Check if task is currently snoozed
    const snoozeExpiry = snoozedReminders.get(task.id);
    if (snoozeExpiry && nowMs < snoozeExpiry) {
      return;
    }

    const key = `${task.id}_${todayStr}_${task.startTime}`;
    if (triggeredReminders.has(key) && !snoozeExpiry) {
      return;
    }

    // Parse task scheduled date & time
    const [startH, startM] = task.startTime.split(':').map((v) => parseInt(v, 10));
    const scheduledDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM, 0, 0);
    const scheduledMs = scheduledDate.getTime();

    // Check if current time has reached or just passed the scheduled start time (within a 3-minute grace window)
    const diffSeconds = (nowMs - scheduledMs) / 1000;

    if (diffSeconds >= 0 && diffSeconds < 180) {
      // Mark as triggered for today
      triggeredReminders.add(key);
      snoozedReminders.delete(task.id);

      // 1. Proactively unlock and play the Web Audio API synthesized chime
      unlockAudioContext().then(() => {
        playTaskAlarm();
      });

      // 2. Trigger background OS notification via Service Worker (or Web Notifications fallback)
      if ('Notification' in window && Notification.permission === 'granted') {
        const notifTitle = `⏰ [화이팅 🌸] Task Starting Now!`;
        const notifOptions = {
          body: `"${task.title}" (${task.durationMinutes}m scheduled)\nReady to get focused? 화이팅 🌷`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `hwaiting-task-${task.id}`,
          requireInteraction: true,
        };

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(notifTitle, notifOptions).catch(() => {
              new Notification(notifTitle, notifOptions);
            });
          }).catch(() => {
            new Notification(notifTitle, notifOptions);
          });
        } else {
          try {
            const notif = new Notification(notifTitle, notifOptions);
            notif.onclick = () => {
              window.focus();
              stopTitleFlashing();
              notif.close();
            };
          } catch (e) {
            console.warn('Native notification error:', e);
          }
        }
      }

      // 3. If user is in another tab, flash the document tab title
      if (typeof document !== 'undefined' && document.hidden) {
        startTitleFlashing(task.title);
      }

      // 4. Notify in-app banner listeners
      alarmListeners.forEach((listener) => {
        try {
          listener(task);
        } catch (e) {}
      });
    }
  });
}

/**
 * Initializes a resilient background ticker using an inline Web Worker.
 * Web Workers run in an isolated thread that is NOT throttled by Chrome/Safari
 * when the tab is hidden or backgrounded!
 */
export function startBackgroundAlarmWorker(onTick: () => void): () => void {
  let worker: Worker | null = null;
  let fallbackInterval: any = null;

  try {
    const workerScript = `
      var intervalId = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (!intervalId) {
            intervalId = setInterval(function() {
              self.postMessage('tick');
            }, 3000); // Check every 3 seconds for precise second-level triggering
          }
        } else if (e.data === 'stop') {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
      if (e.data === 'tick') {
        onTick();
      }
    };

    worker.postMessage('start');
  } catch (err) {
    console.warn('Web Worker initialization fallback to DOM interval:', err);
    fallbackInterval = setInterval(onTick, 5000);
  }

  // Also check immediately when tab gains focus or visibility changes
  const handleVisibilityChange = () => {
    onTick();
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
  }

  return () => {
    if (worker) {
      worker.postMessage('stop');
      worker.terminate();
    }
    if (fallbackInterval) {
      clearInterval(fallbackInterval);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    }
  };
}

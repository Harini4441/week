import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Coffee,
  Brain,
} from 'lucide-react';
import { Task, FocusSession } from '../../types';
import { playCelebration, playChime, playTaskAlarm, ambientSound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface PomodoroTimerViewProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectActiveTask: (task: Task | null) => void;
  onRecordSession: (session: Omit<FocusSession, 'id'>) => void;
  focusSessions: FocusSession[];
}

export const PomodoroTimerView: React.FC<PomodoroTimerViewProps> = ({
  tasks,
  activeTask,
  onSelectActiveTask,
  onRecordSession,
  focusSessions,
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ambientType, setAmbientType] = useState<'none' | 'rain' | 'cafe' | 'pink_noise'>('none');

  const timerRef = useRef<any>(null);

  // Switch modes
  const handleSwitchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    let mins = 25;
    if (newMode === 'shortBreak') mins = 5;
    if (newMode === 'longBreak') mins = 15;
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, durationMinutes, activeTask]);

  const handleTimerComplete = () => {
    // Web Audio API alarm sound so session/break end is unmistakably audible
    playTaskAlarm();
    playCelebration();
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F8C8DC', '#CDEBFF', '#DCCBFF'],
      });
    } catch (e) {}

    // Record session
    onRecordSession({
      taskId: activeTask?.id,
      taskTitle: activeTask?.title || (mode === 'pomodoro' ? 'Deep Focus Session' : 'Rest Break'),
      durationMinutes,
      type: mode,
      completedAt: new Date().toISOString(),
    });

    // Auto prompt transition
    if (mode === 'pomodoro') {
      handleSwitchMode('shortBreak');
    } else {
      handleSwitchMode('pomodoro');
    }
  };

  const handleTogglePlay = () => {
    playChime();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const handleAmbientChange = (type: 'none' | 'rain' | 'cafe' | 'pink_noise') => {
    setAmbientType(type);
    if (type === 'none') {
      ambientSound.stop();
    } else {
      ambientSound.start(type);
    }
  };

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const totalSeconds = durationMinutes * 60;
  const progressRatio = Math.max(0, Math.min(1, (totalSeconds - secondsLeft) / totalSeconds));
  const strokeDashoffset = 282.7 * (1 - progressRatio);

  const todaySessions = focusSessions.filter((s) => {
    const today = new Date().toISOString().split('T')[0];
    return s.completedAt.startsWith(today) && s.type === 'pomodoro';
  });

  const totalFocusMinutesToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div
      className={`space-y-6 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[var(--color-bg,#FFF9F2)] p-8 flex flex-col justify-center items-center overflow-auto'
          : ''
      }`}
    >
      {/* Top Banner (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🍅</span>
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-text,#3D3548)]">
                Pomodoro Focus & Ambient Sounds
              </h2>
            </div>
            <p className="text-xs text-[var(--color-muted,#7B6F8A)] mt-1">
              Immerse yourself in gentle deep work. Synthetic binaural/rain ambience generated without external requests.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text,#3D3548)]">
            <span className="px-3 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)]/40 border border-[var(--color-border,#F1E4DF)] tabular-nums">
              {todaySessions.length} sessions completed ({totalFocusMinutesToday} mins)
            </span>
          </div>
        </div>
      )}

      {/* Main Focus Card */}
      <div className="p-8 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs flex flex-col items-center justify-center max-w-xl mx-auto w-full relative">
        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Zen Fullscreen Mode'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs mb-8">
          <button
            onClick={() => handleSwitchMode('pomodoro')}
            className={`px-4 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] shadow-xs'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
            }`}
          >
            🌸 Deep Focus (25m)
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`px-4 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              mode === 'shortBreak'
                ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] shadow-xs'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
            }`}
          >
            ☕ Short Break (5m)
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`px-4 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              mode === 'longBreak'
                ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] shadow-xs'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
            }`}
          >
            🌱 Long Break (15m)
          </button>
        </div>

        {/* Sync with Currently Active Scheduled Task Block */}
        {(() => {
          const todayStr = new Date().toISOString().split('T')[0];
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();

          const currentScheduledTask = tasks.find((t) => {
            if (t.completed || t.dueDate !== todayStr || !t.startTime) return false;
            const [h, m] = t.startTime.split(':').map((v) => parseInt(v, 10));
            const startMin = h * 60 + m;
            const endMin = startMin + (t.durationMinutes || 60);
            return currentMinutes >= startMin && currentMinutes <= endMin;
          }) || tasks.find((t) => {
            if (t.completed || t.dueDate !== todayStr || !t.startTime) return false;
            const [h, m] = t.startTime.split(':').map((v) => parseInt(v, 10));
            const startMin = h * 60 + m;
            return startMin >= currentMinutes && startMin <= currentMinutes + 45;
          }) || tasks.find((t) => !t.completed && t.dueDate === todayStr && t.startTime);

          if (!currentScheduledTask) return null;

          return (
            <div className="w-full max-w-sm mb-4">
              <button
                type="button"
                onClick={() => {
                  onSelectActiveTask(currentScheduledTask);
                  const taskDuration = Math.min(90, Math.max(10, currentScheduledTask.durationMinutes || 25));
                  setMode('pomodoro');
                  setDurationMinutes(taskDuration);
                  setSecondsLeft(taskDuration * 60);
                  setIsRunning(false);
                  playChime();
                }}
                className="w-full p-2.5 rounded-2xl bg-linear-to-r from-pastel-pink/40 to-pastel-purple/40 hover:from-pastel-pink/60 hover:to-pastel-purple/60 border border-pastel-pink/60 text-xs text-stone-800 dark:text-stone-200 transition-all flex items-center justify-between shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                  <span className="text-sm">⚡</span>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-pink-700 dark:text-pink-300 block">
                      Active Timetable Block
                    </span>
                    <span className="font-semibold text-xs truncate block text-stone-900 dark:text-stone-100">
                      {currentScheduledTask.title} ({currentScheduledTask.startTime})
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-stone-800 text-[10px] font-bold text-stone-700 dark:text-stone-300 shrink-0">
                  Sync {currentScheduledTask.durationMinutes || 25}m
                </span>
              </button>
            </div>
          );
        })()}

        {/* Active Task Linker */}
        <div className="w-full max-w-sm mb-6">
          <label className="text-[11px] font-semibold text-[var(--color-muted,#7B6F8A)] block text-center mb-1">
            Linked Task
          </label>
          <select
            value={activeTask?.id || ''}
            onChange={(e) => {
              const found = tasks.find((t) => t.id === e.target.value) || null;
              onSelectActiveTask(found);
            }}
            className="w-full px-3 py-2 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs font-semibold text-[var(--color-text,#3D3548)] focus:outline-none cursor-pointer text-center"
          >
            <option value="">(No specific task - General Focus)</option>
            {tasks
              .filter((t) => !t.completed)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
          </select>
        </div>

        {/* Animated Circular Timer */}
        <div className="relative w-64 h-64 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-[var(--color-border,#F1E4DF)]"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="var(--color-accent,#E78EA9)"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray="282.7"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-[var(--color-text,#3D3548)] tabular-nums tracking-tighter">
              {timeFormatted}
            </span>
            <span className="text-xs font-medium text-[var(--color-muted,#7B6F8A)] mt-1">
              {isRunning ? 'Flow state active 🌸' : 'Ready to start'}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handleReset}
            title="Reset timer"
            className="p-3 rounded-2xl border border-[var(--color-border,#F1E4DF)] text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-3xl bg-[var(--color-primary,#F8C8DC)] hover:brightness-95 shadow-md flex items-center justify-center text-[var(--color-text,#3D3548)] transition-all cursor-pointer active:scale-95"
          >
            {isRunning ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleTimerComplete}
            title="Skip to next session"
            className="p-3 rounded-2xl border border-[var(--color-border,#F1E4DF)] text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-all cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Ambient Sound Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border,#F1E4DF)] w-full flex flex-col items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--color-muted,#7B6F8A)] uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" /> Ambient Synthetic Soundscapes
          </span>

          <div className="flex flex-wrap justify-center gap-1.5 text-xs">
            <button
              onClick={() => handleAmbientChange('none')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                ambientType === 'none'
                  ? 'bg-[var(--color-primary,#F8C8DC)]/40 font-semibold'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-bg,#FFF9F2)]'
              }`}
            >
              Mute
            </button>
            <button
              onClick={() => handleAmbientChange('rain')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                ambientType === 'rain'
                  ? 'bg-[var(--color-primary,#F8C8DC)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-bg,#FFF9F2)]'
              }`}
            >
              🌧️ Cozy Rain
            </button>
            <button
              onClick={() => handleAmbientChange('cafe')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                ambientType === 'cafe'
                  ? 'bg-[var(--color-primary,#F8C8DC)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-bg,#FFF9F2)]'
              }`}
            >
              ☕ Cafe Vinyl
            </button>
            <button
              onClick={() => handleAmbientChange('pink_noise')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                ambientType === 'pink_noise'
                  ? 'bg-[var(--color-primary,#F8C8DC)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-bg,#FFF9F2)]'
              }`}
            >
              🌸 Pink Noise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

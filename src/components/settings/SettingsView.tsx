import React, { useState } from 'react';
import {
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Volume2,
  Sliders,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { UserScheduleConfig } from '../../types';
import { playChime, playCelebration } from '../../utils/audio';

interface SettingsViewProps {
  scheduleConfig: UserScheduleConfig;
  onUpdateConfig: (config: UserScheduleConfig) => void;
  onExportAllData: () => void;
  onImportData: (jsonData: string) => void;
  onResetSampleData: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  scheduleConfig,
  onUpdateConfig,
  onExportAllData,
  onImportData,
  onResetSampleData,
  deferredPrompt,
  onInstallPwa,
}) => {
  const [wake, setWake] = useState(scheduleConfig.wakeTime);
  const [sleep, setSleep] = useState(scheduleConfig.sleepTime);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...scheduleConfig,
      wakeTime: wake,
      sleepTime: sleep,
    });
    setSavedSuccess(true);
    playChime();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportData(content);
        playCelebration();
      }
    };
    reader.readAsText(file);
  };

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        playChime();
        new Notification('화이팅 🌸 Notification Enabled!', {
          body: 'Your little steps, your big dreams 🌷 You will receive reminders for focus sessions and upcoming tasks.',
        });
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚙️</span>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text,#3D3548)]">
            Cloud Sync, Backup & Preferences
          </h2>
        </div>
        <p className="text-xs text-[var(--color-muted,#7B6F8A)] mt-1">
          Manage cross-device synchronization, export/import JSON backups, and configure notification routines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Cloud & Local Storage Status */}
        <div className="p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[var(--color-accent,#E78EA9)]" />
            <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
              Cross-Device Cloud Synchronization
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text,#3D3548)]">
                Storage Status
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Local & Cloud Ready
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-muted,#7B6F8A)] leading-relaxed">
              All changes are immediately persisted to local storage & IndexedDB cache for offline instant access, prepared for multi-device sync across your laptop, phone, and tablet.
            </p>
          </div>

          {/* PWA Install Button */}
          {deferredPrompt && (
            <div className="p-4 rounded-2xl bg-[var(--color-primary,#F8C8DC)]/20 border border-[var(--color-border,#F1E4DF)] flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[var(--color-text,#3D3548)] block">
                  Install Progressive Web App (PWA)
                </span>
                <span className="text-[11px] text-[var(--color-muted,#7B6F8A)]">
                  Add 화이팅 to home screen for native full-screen experience.
                </span>
              </div>
              <button
                onClick={onInstallPwa}
                className="px-3 py-1.5 rounded-xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30 shrink-0 cursor-pointer"
              >
                Install App
              </button>
            </div>
          )}

          {/* Backup / Restore Controls */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border,#F1E4DF)]">
            <span className="text-xs font-bold text-[var(--color-text,#3D3548)] block">
              Data Backup & Restore
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportAllData}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)] transition-colors cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={onResetSampleData}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-[var(--color-muted,#7B6F8A)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Sample Starter Data</span>
            </button>
          </div>
        </div>

        {/* Section 2: Daily Routine Hours & Notifications */}
        <div className="p-6 rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--color-accent,#E78EA9)]" />
            <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
              Daily Schedule & Free Time Window
            </h3>
          </div>

          <form onSubmit={handleSaveHours} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                  Wake Time
                </label>
                <input
                  type="time"
                  value={wake}
                  onChange={(e) => setWake(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs font-semibold text-[var(--color-text,#3D3548)] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                  Sleep Time
                </label>
                <input
                  type="time"
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs font-semibold text-[var(--color-text,#3D3548)] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:brightness-95 transition-all cursor-pointer"
            >
              {savedSuccess ? 'Saved Schedule Successfully! ✓' : 'Update Free Time Window'}
            </button>
          </form>

          {/* Notifications config */}
          <div className="space-y-3 pt-3 border-t border-[var(--color-border,#F1E4DF)]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--color-muted,#7B6F8A)]" />
              <span className="text-xs font-bold text-[var(--color-text,#3D3548)]">
                Smart Notifications
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-muted,#7B6F8A)]">
                Browser Permission: <strong>{notificationStatus}</strong>
              </span>

              {notificationStatus !== 'granted' && (
                <button
                  onClick={handleRequestNotification}
                  className="px-3 py-1 rounded-xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30"
                >
                  Enable Alerts
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[var(--color-muted,#7B6F8A)]">
                Synthetic Web Audio Chimes
              </span>
              <button
                onClick={() => playCelebration()}
                className="px-3 py-1 rounded-xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:bg-[var(--color-primary,#F8C8DC)]/30"
              >
                Test Chime 🔔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Cloud, LogIn, LogOut, Bell, Volume2, CheckCircle2, Laptop, Smartphone, Music } from 'lucide-react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser } from '../../firebase/syncService';
import {
  playTaskAlarm,
  unlockAudioContext,
  getAlarmVolume,
  setAlarmVolume,
  getChimeType,
  setChimeType,
  ChimeType,
} from '../../utils/audio';
import { requestNotificationPermission } from '../../utils/notifications';

interface SyncModalProps {
  user: User | null;
  syncStatus: 'connecting' | 'synced' | 'offline' | 'error';
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  user,
  syncStatus,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [testChimePlaying, setTestChimePlaying] = useState(false);
  const [volume, setVolume] = useState<number>(() => getAlarmVolume());
  const [selectedChime, setSelectedChime] = useState<ChimeType>(() => getChimeType());

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google login popup cancelled or error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAlarm = async (type?: ChimeType) => {
    setTestChimePlaying(true);
    await unlockAudioContext();
    playTaskAlarm(type || selectedChime);
    setTimeout(() => setTestChimePlaying(false), 1500);
  };

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setNotificationStatus(res);
    await unlockAudioContext();
    playTaskAlarm();
  };

  const handleChimeChange = (type: ChimeType) => {
    setSelectedChime(type);
    setChimeType(type);
    handleTestAlarm(type);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setAlarmVolume(newVol);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
                Cloud Sync & Web Audio Alarm Settings
              </h3>
              <p className="text-[11px] text-[var(--color-muted,#7B6F8A)]">
                Real-time cross-device data sync & task start audio chime
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="p-4 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className={`w-4 h-4 ${syncStatus === 'synced' ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              <span className="text-xs font-bold text-[var(--color-text,#3D3548)]">
                Sync Status: {syncStatus === 'synced' ? 'Connected & Live' : 'Connecting...'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Firebase Firestore
            </span>
          </div>

          <div className="flex items-center justify-around pt-2 text-[11px] text-[var(--color-muted,#7B6F8A)]">
            <div className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
              <span>Laptop Browser</span>
            </div>
            <span className="text-emerald-500 font-bold">⇄</span>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
              <span>Mobile Chrome</span>
            </div>
          </div>
        </div>

        {/* User Account / One-Click Google Sync */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[var(--color-text,#3D3548)] block">
            Account Synchronization
          </span>

          {user && !user.isAnonymous ? (
            <div className="p-3.5 rounded-2xl bg-[var(--color-primary,#F8C8DC)]/20 border border-[var(--color-border,#F1E4DF)] space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[var(--color-text,#3D3548)] truncate">
                    {user.email || user.displayName || 'Google Account Connected'}
                  </div>
                  <div className="text-[10px] text-[var(--color-muted,#7B6F8A)]">
                    Sign in with this same Google account on mobile Chrome to sync all your tasks, habits, and schedules instantly.
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-[var(--color-border,#F1E4DF)] text-xs font-semibold text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-card,#FFFFFF)] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[var(--color-muted,#7B6F8A)]">
                Currently saving automatically to your <strong>guest real-time cloud session</strong>. To keep data in sync between your laptop and phone, sign in with Google:
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-xs font-bold text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sync with Google Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Web Audio API Chime & Task Alarm Settings */}
        <div className="space-y-4 pt-3 border-t border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[var(--color-accent,#E78EA9)]" />
              <span className="text-xs font-bold text-[var(--color-text,#3D3548)]">
                Web Audio API Chime & Alarm Sound
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Background Active
            </span>
          </div>

          {/* Sound Preset Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--color-muted,#7B6F8A)] flex items-center gap-1">
              <Music className="w-3 h-3" />
              <span>Select Chime Sound Preset:</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
              {[
                { id: 'pastel' as ChimeType, name: '🌸 Pastel Chime', desc: 'Sweet music box glockenspiel' },
                { id: 'temple' as ChimeType, name: '🔔 Temple Bell', desc: 'Healing resonant brass chime' },
                { id: 'marimba' as ChimeType, name: '🎵 Marimba', desc: 'Warm acoustic wooden melody' },
                { id: 'crystal' as ChimeType, name: '✨ Crystal Bell', desc: 'Bright crystalline shimmer bells' },
              ].map((preset) => {
                const isSelected = selectedChime === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleChimeChange(preset.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[var(--color-primary,#F8C8DC)]/30 border-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] shadow-2xs'
                        : 'bg-[var(--color-bg,#FFF9F2)] border-[var(--color-border,#F1E4DF)] text-[var(--color-muted,#7B6F8A)] hover:border-[var(--color-primary,#F8C8DC)]'
                    }`}
                  >
                    <span className="font-bold text-[11px] text-[var(--color-text,#3D3548)]">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted,#7B6F8A)] mt-0.5">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)]">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text,#3D3548)]">
              <span>Alarm Volume:</span>
              <span className="text-[var(--color-accent,#E78EA9)] font-bold tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-[var(--color-accent,#E78EA9)] cursor-pointer"
            />
          </div>

          {/* Action Buttons: Enable Notification & Test Sound */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleEnableNotifications}
              className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                notificationStatus === 'granted'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-[var(--color-bg,#FFF9F2)] border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)] hover:border-[var(--color-primary,#F8C8DC)]'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
              <span>{notificationStatus === 'granted' ? 'Notifications Enabled ✓' : 'Enable Web Notifications'}</span>
            </button>

            <button
              onClick={() => handleTestAlarm()}
              className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                testChimePlaying
                  ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] animate-pulse'
                  : 'bg-[var(--color-bg,#FFF9F2)] border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)] hover:border-[var(--color-primary,#F8C8DC)]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
              <span>{testChimePlaying ? 'Playing Chime... 🎵' : 'Test Chime Sound'}</span>
            </button>
          </div>

          <p className="text-[10px] text-[var(--color-muted,#7B6F8A)] leading-tight">
            💡 <strong>Even if you're not looking at the screen</strong>, when a task's scheduled start time arrives, Web Audio API synthesizes pleasant chime sounds and flashes the tab title so you never miss a beat! 화이팅 🌷
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-xs font-bold text-[var(--color-text,#3D3548)] hover:brightness-95 cursor-pointer transition-colors shadow-xs active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

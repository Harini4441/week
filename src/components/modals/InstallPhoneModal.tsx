import React, { useState } from 'react';
import { X, Smartphone, Apple, Chrome, Copy, Check, QrCode, ArrowRight, Share2, Sparkles, Download } from 'lucide-react';

interface InstallPhoneModalProps {
  onClose: () => void;
  deferredPrompt: any;
  onInstallDirect: () => void;
}

export const InstallPhoneModal: React.FC<InstallPhoneModalProps> = ({
  onClose,
  deferredPrompt,
  onInstallDirect,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'share'>('android');
  const [copied, setCopied] = useState(false);

  // App public URL
  const appUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary,#F8C8DC)] flex items-center justify-center text-base shadow-2xs">
              🌸
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
                Install 화이팅 (Hwaiting) on Your Phone 📱
              </h3>
              <p className="text-[11px] text-[var(--color-muted,#7B6F8A)]">
                Works like a native app on Android, iPhone, and iPad with offline support!
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

        {/* If browser supports direct 1-click install banner */}
        {deferredPrompt && (
          <div className="p-3.5 rounded-2xl bg-[var(--color-primary,#F8C8DC)]/30 border border-[var(--color-border,#F1E4DF)] flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[var(--color-text,#3D3548)] block">
                Instant 1-Click Install Available!
              </span>
              <span className="text-[11px] text-[var(--color-muted,#7B6F8A)]">
                Your browser supports immediate standalone app installation.
              </span>
            </div>
            <button
              onClick={onInstallDirect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)] text-xs font-bold text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Device Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] shadow-xs'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
            }`}
          >
            <Chrome className="w-3.5 h-3.5 text-emerald-500" />
            <span>Android (Chrome)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] shadow-xs'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-slate-800 dark:text-slate-100" />
            <span>iPhone / iOS (Safari)</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] shadow-xs'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[var(--color-accent,#E78EA9)]" />
            <span>Share Link</span>
          </button>
        </div>

        {/* Tab 1: Android Instructions */}
        {activeTab === 'android' && (
          <div className="space-y-3 p-4 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs text-[var(--color-text,#3D3548)]">
            <h4 className="font-bold flex items-center gap-1.5">
              <span>🤖</span> Easy 3-Step Android Installation
            </h4>
            <ol className="space-y-2 list-decimal list-inside leading-relaxed text-[11px] text-[var(--color-muted,#7B6F8A)]">
              <li>
                Open <strong className="text-[var(--color-text,#3D3548)]">Google Chrome</strong> on your Android phone and visit this app link.
              </li>
              <li>
                Tap the <strong className="text-[var(--color-text,#3D3548)]">Three Dots (⋮)</strong> menu in the upper-right corner of Chrome.
              </li>
              <li>
                Select <strong className="text-[var(--color-text,#3D3548)]">"Install app"</strong> or <strong className="text-[var(--color-text,#3D3548)]">"Add to Home screen"</strong>.
              </li>
              <li>
                Tap <strong className="text-[var(--color-text,#3D3548)]">Install</strong>. The cute <strong className="text-[var(--color-text,#3D3548)]">화이팅 🌸</strong> icon will appear on your home screen and open in full-screen mode without address bars!
              </li>
            </ol>
          </div>
        )}

        {/* Tab 2: iPhone / iPad Instructions */}
        {activeTab === 'ios' && (
          <div className="space-y-3 p-4 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs text-[var(--color-text,#3D3548)]">
            <h4 className="font-bold flex items-center gap-1.5">
              <span>🍏</span> iPhone & iPad Installation in Safari
            </h4>
            <ol className="space-y-2 list-decimal list-inside leading-relaxed text-[11px] text-[var(--color-muted,#7B6F8A)]">
              <li>
                Open <strong className="text-[var(--color-text,#3D3548)]">Safari</strong> on your iPhone or iPad and open this app URL.
              </li>
              <li>
                Tap the <strong className="text-[var(--color-text,#3D3548)]">Share Button</strong> (the square icon with an arrow pointing up ⎘) at the bottom toolbar.
              </li>
              <li>
                Scroll down in the share sheet and tap <strong className="text-[var(--color-text,#3D3548)]">"Add to Home Screen" ➕</strong>.
              </li>
              <li>
                Tap <strong className="text-[var(--color-text,#3D3548)]">Add</strong> in the top right. <strong className="text-[var(--color-text,#3D3548)]">화이팅</strong> will now sit on your home screen and run natively like an App Store app!
              </li>
            </ol>
          </div>
        )}

        {/* Tab 3: Share / QR Link */}
        {activeTab === 'share' && (
          <div className="space-y-3 p-4 rounded-2xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-xs text-[var(--color-text,#3D3548)]">
            <h4 className="font-bold flex items-center gap-1.5">
              <span>🔗</span> Open On Your Phone
            </h4>
            <p className="text-[11px] text-[var(--color-muted,#7B6F8A)]">
              Send this link to yourself on WhatsApp, Telegram, or email, then open it on your phone:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-card,#FFFFFF)] font-mono text-[var(--color-text,#3D3548)] truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:brightness-95 transition-all shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Feature benefits */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px] text-[var(--color-muted,#7B6F8A)]">
          <div className="p-2 rounded-xl bg-[var(--color-bg,#FFF9F2)]/60 border border-[var(--color-border,#F1E4DF)]/60">
            <span className="font-semibold block text-[var(--color-text,#3D3548)]">⚡ Instant Load</span>
            Works 100% offline
          </div>
          <div className="p-2 rounded-xl bg-[var(--color-bg,#FFF9F2)]/60 border border-[var(--color-border,#F1E4DF)]/60">
            <span className="font-semibold block text-[var(--color-text,#3D3548)]">🌸 Full Screen</span>
            No browser address bar
          </div>
          <div className="p-2 rounded-xl bg-[var(--color-bg,#FFF9F2)]/60 border border-[var(--color-border,#F1E4DF)]/60">
            <span className="font-semibold block text-[var(--color-text,#3D3548)]">☁️ Synced</span>
            Shared tasks & streaks
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border,#F1E4DF)]">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs text-[var(--color-accent,#E78EA9)] font-semibold hover:underline"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied to Clipboard! ✓' : 'Copy App Link for Phone'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--color-primary,#F8C8DC)] text-xs font-semibold text-[var(--color-text,#3D3548)] hover:brightness-95"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

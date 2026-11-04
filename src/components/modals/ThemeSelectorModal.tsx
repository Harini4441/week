import React, { useState } from 'react';
import { X, Check, Palette, Moon, Sun, Sparkles } from 'lucide-react';
import { ThemePreset } from '../../types';
import { THEME_PRESETS, applyTheme } from '../../utils/themePresets';

interface ThemeSelectorModalProps {
  currentTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  currentTheme,
  onSelectTheme,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'light' | 'dark' | 'custom'>('all');

  // Custom theme editor state
  const [customPrimary, setCustomPrimary] = useState('#F8C8DC');
  const [customBg, setCustomBg] = useState('#FFF9F2');
  const [customCard, setCustomCard] = useState('#FFFFFF');
  const [customAccent, setCustomAccent] = useState('#E78EA9');
  const [customIsDark, setCustomIsDark] = useState(false);

  const filteredPresets = THEME_PRESETS.filter((t) => {
    if (activeTab === 'light') return !t.isDark;
    if (activeTab === 'dark') return t.isDark;
    return true;
  });

  const handleApplyCustom = () => {
    const custom: ThemePreset = {
      id: `custom-${Date.now()}`,
      name: 'My Custom Pastel',
      koreanName: '나만의 파스텔',
      emoji: '🎨',
      primary: customPrimary,
      secondary: '#FFE0C2',
      accent: customAccent,
      bg: customBg,
      cardBg: customCard,
      text: customIsDark ? '#F3EFFC' : '#3D3548',
      mutedText: customIsDark ? '#9E98B3' : '#7B6F8A',
      border: customIsDark ? '#2C283E' : '#F1E4DF',
      isDark: customIsDark,
    };
    onSelectTheme(custom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
                Pastel Theme Library ({THEME_PRESETS.length} Presets)
              </h3>
              <p className="text-xs text-[var(--color-muted,#7B6F8A)]">
                Choose from 40+ Korean-inspired pastel aesthetics or craft your own color palette.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-2.5 border-b border-[var(--color-border,#F1E4DF)] flex items-center justify-between text-xs bg-[var(--color-bg,#FFF9F2)]/40">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)]'
              }`}
            >
              All (42)
            </button>
            <button
              onClick={() => setActiveTab('light')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'light'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light Pastel</span>
            </button>
            <button
              onClick={() => setActiveTab('dark')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'dark'
                  ? 'bg-[var(--color-card,#FFFFFF)] text-[var(--color-text,#3D3548)] font-semibold shadow-xs'
                  : 'text-[var(--color-muted,#7B6F8A)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Velvet Dark</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-semibold ${
              activeTab === 'custom'
                ? 'bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] shadow-xs'
                : 'text-[var(--color-accent,#E78EA9)] hover:underline'
            }`}
          >
            + Custom Builder
          </button>
        </div>

        {/* Content: Preset Grid or Custom Builder */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab !== 'custom' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredPresets.map((preset) => {
                const isSelected = currentTheme.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectTheme(preset);
                      applyTheme(preset);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative ${
                      isSelected
                        ? 'border-[var(--color-accent,#E78EA9)] ring-2 ring-[var(--color-accent,#E78EA9)]/40 shadow-xs'
                        : 'border-[var(--color-border,#F1E4DF)] hover:border-[var(--color-primary,#F8C8DC)]'
                    }`}
                    style={{ backgroundColor: preset.cardBg }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-base">{preset.emoji}</span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xs font-bold block truncate mt-1"
                        style={{ color: preset.text }}
                      >
                        {preset.name}
                      </span>
                      {preset.koreanName && (
                        <span
                          className="text-[10px] block opacity-70 truncate"
                          style={{ color: preset.mutedText }}
                        >
                          {preset.koreanName}
                        </span>
                      )}
                    </div>

                    {/* Color Swatch Strip */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.accent }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: preset.bg }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-4 py-4">
              <h4 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
                Build Your Custom Aesthetic Palette 🎀
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                    Primary / Button Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-xl border border-[var(--color-border,#F1E4DF)] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customAccent}
                      onChange={(e) => setCustomAccent(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={customAccent}
                      onChange={(e) => setCustomAccent(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-xl border border-[var(--color-border,#F1E4DF)] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                    Canvas Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-xl border border-[var(--color-border,#F1E4DF)] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
                    Card Surface
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customCard}
                      onChange={(e) => setCustomCard(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={customCard}
                      onChange={(e) => setCustomCard(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-xl border border-[var(--color-border,#F1E4DF)] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="darkCheck"
                  checked={customIsDark}
                  onChange={(e) => setCustomIsDark(e.target.checked)}
                  className="rounded text-[var(--color-accent,#E78EA9)]"
                />
                <label htmlFor="darkCheck" className="text-xs text-[var(--color-text,#3D3548)]">
                  Use light text on dark surfaces (Dark Mode)
                </label>
              </div>

              <button
                onClick={handleApplyCustom}
                className="w-full py-2.5 rounded-2xl bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] text-xs font-semibold hover:brightness-95 transition-all shadow-xs cursor-pointer"
              >
                Apply Custom Palette
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border,#F1E4DF)] flex items-center justify-between text-xs text-[var(--color-muted,#7B6F8A)] bg-[var(--color-card,#FFFFFF)]">
          <span>Active: <strong>{currentTheme.name}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--color-bg,#FFF9F2)] border border-[var(--color-border,#F1E4DF)] text-[var(--color-text,#3D3548)] font-semibold hover:bg-[var(--color-primary,#F8C8DC)]/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

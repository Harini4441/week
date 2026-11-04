import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Category } from '../../types';

interface NewCategoryModalProps {
  onClose: () => void;
  onAddCategory: (category: Category) => void;
}

export const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  onClose,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌸');
  const [color, setColor] = useState('#F8C8DC');

  const presetColors = [
    '#F8C8DC',
    '#DCCBFF',
    '#CDEBFF',
    '#CFF5E7',
    '#FFE0C2',
    '#FAD2E1',
    '#BBF7D0',
    '#DDD6FE',
    '#FED7AA',
    '#BAE6FD',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      id: `cat-${Date.now()}`,
      name: name.trim(),
      emoji: emoji.trim() || '📁',
      color,
      isCustom: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--color-card,#FFFFFF)] border border-[var(--color-border,#F1E4DF)] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border,#F1E4DF)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <h3 className="text-sm font-bold text-[var(--color-text,#3D3548)]">
              Create New Category
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
              Category Name & Emoji
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-12 text-center py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-base"
                placeholder="🌸"
              />
              <input
                type="text"
                required
                placeholder="e.g. Thesis, Robotics, Dance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border,#F1E4DF)] bg-[var(--color-bg,#FFF9F2)] text-xs text-[var(--color-text,#3D3548)] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--color-muted,#7B6F8A)]">
              Color Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border transition-all ${
                    color === c ? 'ring-2 ring-[var(--color-accent,#E78EA9)] scale-110' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border,#F1E4DF)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--color-muted,#7B6F8A)] hover:bg-[var(--color-primary,#F8C8DC)]/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--color-primary,#F8C8DC)] text-[var(--color-text,#3D3548)] hover:brightness-95 shadow-xs"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

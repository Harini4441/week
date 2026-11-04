import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  HeartHandshake,
  Timer,
  MoreHorizontal,
} from 'lucide-react';
import { MainTab } from './Sidebar';

interface MobileNavProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenMoreMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMoreMenu,
}) => {
  const quickItems = [
    { id: 'dashboard' as MainTab, label: 'Home', icon: LayoutDashboard },
    { id: 'tasks' as MainTab, label: 'Tasks', icon: CheckSquare },
    { id: 'calendar' as MainTab, label: 'Calendar', icon: Calendar },
    { id: 'freetime' as MainTab, label: 'Free Time', icon: Clock },
    { id: 'habits' as MainTab, label: 'Habits', icon: HeartHandshake },
    { id: 'pomodoro' as MainTab, label: 'Focus', icon: Timer },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-card,#FFFFFF)]/95 backdrop-blur-md border-t border-[var(--color-border,#F1E4DF)] px-2 py-1 flex items-center justify-around shadow-lg">
      {quickItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
              isActive
                ? 'text-[var(--color-accent,#E78EA9)] font-bold'
                : 'text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)]'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenMoreMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium text-[var(--color-muted,#7B6F8A)] hover:text-[var(--color-text,#3D3548)] cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4 mb-0.5" />
        <span>More</span>
      </button>
    </nav>
  );
};

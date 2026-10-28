import React from 'react';
import { User } from '../types';

export type ActiveNavTab =
  | 'home'
  | 'nowShowing'
  | 'comingSoon'
  | 'cinemas'
  | 'myDashboard'
  | 'admin';

interface NavbarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
}) => {
  const navItems: { id: ActiveNavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'nowShowing', label: 'Now Showing' },
    { id: 'comingSoon', label: 'Coming Soon' },
    { id: 'cinemas', label: 'Cinemas' },
    { id: 'myDashboard', label: 'My Bookings' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      {/* Zone 1: Single text element wordmark */}
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className="text-xl font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500"
      >
        i movies
      </button>

      {/* Zone 2: 5 concise single-line navigation links */}
      <nav
        aria-label="Primary Navigation"
        className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer border-b-2 ${
                isActive
                  ? 'text-white border-amber-500'
                  : 'text-zinc-400 border-transparent hover:text-zinc-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {currentUser ? `Account (${currentUser.username})` : 'Sign In'}
        </button>
      </div>
    </header>
  );
};

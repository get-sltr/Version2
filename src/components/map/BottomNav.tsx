// =============================================================================
// BottomNav - Explore | Taps | PRO | Messages | Views
// =============================================================================

'use client';

import type { BottomNavProps, NavTab } from '@/types/map';
import styles from './Map.module.css';

// Custom Icons
const ExploreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 3C12 3 12 8 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 12L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TapsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M20.84 4.61C20.33 4.1 19.72 3.69 19.05 3.41C18.38 3.13 17.66 2.98 16.93 2.98C16.2 2.98 15.48 3.13 14.81 3.41C14.14 3.69 13.53 4.1 13.02 4.61L12 5.64L10.98 4.61C9.95 3.58 8.55 3 7.07 3C5.59 3 4.19 3.58 3.16 4.61C2.13 5.64 1.55 7.04 1.55 8.52C1.55 10 2.13 11.4 3.16 12.43L12 21.27L20.84 12.43C21.35 11.92 21.76 11.31 22.04 10.64C22.32 9.97 22.47 9.25 22.47 8.52C22.47 7.79 22.32 7.07 22.04 6.4C21.76 5.73 21.35 5.12 20.84 4.61Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MessagesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M21 11.5C21 16.19 16.97 20 12 20C10.64 20 9.34 19.72 8.17 19.22L3 21L4.78 16.83C3.66 15.36 3 13.5 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ViewsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    {/* First flame (larger, back) */}
    <path
      d="M8 22C5.24 22 3 19.76 3 17C3 14.5 5 12.5 5 10C5 7 8 4 8 4C8 4 9 7 9 9C9 10 8.5 11 9 12C9.5 11 10 10 10 9C10 7 9 5 9 5C9 5 13 8 13 12C13 12.5 12.8 13 13 13.5C13.5 12.5 14 11.5 14 10C14 10 16 12 16 15C16 19 12.5 22 8 22Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Second flame (smaller, front, offset) */}
    <path
      d="M16 22C14 22 12.5 20.5 12.5 18.5C12.5 17 13.5 15.5 13.5 14C13.5 12.5 15 11 15 11C15 11 15.5 12.5 15.5 13.5C15.5 14 15.3 14.5 15.5 15C15.8 14.5 16 14 16 13.5C16 12.5 15.5 11.5 15.5 11.5C15.5 11.5 18 13 18 15.5C18 15.8 17.9 16 18 16.3C18.3 15.8 18.5 15.3 18.5 14.5C18.5 14.5 20 16 20 18C20 20.5 18.5 22 16 22Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface NavItemProps {
  tab: NavTab;
  label: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
  showBadge?: boolean;
}

function NavItem({ tab, label, icon, isActive, onClick, badgeCount, showBadge }: NavItemProps) {
  const isPro = tab === 'pro';

  return (
    <button
      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={`${label}${badgeCount && badgeCount > 0 ? `, ${badgeCount} new` : ''}`}
    >
      {isPro ? (
        <span className={styles.navItemPro}>PRO</span>
      ) : (
        <>
          <span className={styles.navItemIcon}>
            {icon}
            {badgeCount !== undefined && badgeCount > 0 && (
              <span className={styles.navBadgeCount}>{badgeCount > 99 ? '99+' : badgeCount}</span>
            )}
            {showBadge && !badgeCount && <span className={styles.navBadge} />}
          </span>
          <span className={styles.navItemLabel}>{label}</span>
        </>
      )}
    </button>
  );
}

export function BottomNav({
  activeTab,
  onTabChange,
  messageCount = 0,
  viewCount = 0,
  tapCount = 0,
}: BottomNavProps) {
  return (
    <nav className={styles.bottomNav} role="tablist" aria-label="Main navigation">
      <NavItem
        tab="explore"
        label="Explore"
        icon={<ExploreIcon />}
        isActive={activeTab === 'explore'}
        onClick={() => onTabChange('explore')}
      />
      <NavItem
        tab="taps"
        label="Taps"
        icon={<TapsIcon />}
        isActive={activeTab === 'taps'}
        onClick={() => onTabChange('taps')}
        badgeCount={tapCount}
      />
      <NavItem
        tab="pro"
        label="PRO"
        isActive={activeTab === 'pro'}
        onClick={() => onTabChange('pro')}
      />
      <NavItem
        tab="messages"
        label="Messages"
        icon={<MessagesIcon />}
        isActive={activeTab === 'messages'}
        onClick={() => onTabChange('messages')}
        badgeCount={messageCount}
      />
      <NavItem
        tab="views"
        label="Views"
        icon={<ViewsIcon />}
        isActive={activeTab === 'views'}
        onClick={() => onTabChange('views')}
        badgeCount={viewCount}
      />
    </nav>
  );
}

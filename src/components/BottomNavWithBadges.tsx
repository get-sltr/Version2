// ============================================
// BOTTOM NAVIGATION - PRIMAL
// ============================================
// 5 Buttons: Explore | Taps | PRO | Messages | Views
// - PRO always lit orange (center)
// - Views uses cascading double flames
// - Real-time badge counts from Supabase
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ============================================
// STYLES
// ============================================

const ICON_SIZE = 24; // HIG minimum for tab bar icons
const FONT_SIZE = 10; // HIG minimum label size

const styles = {
  nav: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: '#111',
    borderTop: '1px solid #222',
    borderRadius: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    padding: '6px 8px calc(env(safe-area-inset-bottom, 0px) + 2px) 8px',
    boxShadow: 'none',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    padding: '4px 8px 6px 8px',
    cursor: 'pointer',
    position: 'relative' as const,
    textDecoration: 'none',
    borderRadius: 10,
    minWidth: 48,
    minHeight: 44,
    height: 44,
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    background: 'transparent',
  },
  navItemActive: {
    borderBottom: '3px solid #ff6b35',
    boxShadow: '0 4px 12px rgba(255,107,53,0.5), inset 0 -8px 16px rgba(255,107,53,0.15)',
  },
  iconWrapper: {
    height: ICON_SIZE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT_SIZE,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: '#ff6b35', // Always orange
  },
  accent: {
    position: 'absolute' as const,
    bottom: 4,
    left: '50%',
    transform: 'translateX(-50%)',
    height: 3,
    borderRadius: 2,
    background: '#ff6b35',
  },
  badge: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    minWidth: 14,
    height: 14,
    padding: '0 3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ff6b35',
    color: '#fff',
    fontSize: 8,
    fontWeight: 700,
    borderRadius: 7,
    boxShadow: '0 0 6px rgba(255,107,53,0.6)',
  },
  proText: {
    fontSize: 12,
    fontWeight: 800,
    color: '#ff6b35',
    letterSpacing: 0.5,
    textShadow: '0 0 10px rgba(255,107,53,0.5)',
  },
};

// ============================================
// ICONS (all use ICON_SIZE for consistent sizing)
// ============================================

function ExploreIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="#ff6b35">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );
}

function TapsIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="#ff6b35">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="#ff6b35">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>
  );
}

function ViewsIcon() {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      {/* Flame 1: Front, larger */}
      <path
        d="M10 22C6 22 3 18.5 3 15C3 10 10 2 10 2C10 2 17 10 17 15C17 18.5 14 22 10 22Z"
        fill="#ff6b35"
      />
      {/* Flame 2: Back, smaller, offset right */}
      <path
        d="M16 18C13.5 18 11.5 15.8 11.5 13.5C11.5 10 16 5 16 5C16 5 20.5 10 20.5 13.5C20.5 15.8 18.5 18 16 18Z"
        fill="#ff6b35"
        fillOpacity={0.4}
      />
    </svg>
  );
}

// ============================================
// NAV ITEM
// ============================================

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  badge?: number;
}

function NavItem({ href, label, icon, isActive, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={isActive}
      aria-label={`${label}${badge && badge > 0 ? `, ${badge} new` : ''}`}
      style={{
        ...styles.navItem,
        ...(isActive ? styles.navItemActive : {}),
        color: '#ff6b35',
      }}
    >
      <div style={styles.iconWrapper}>
        {icon}
      </div>
      <span style={styles.label}>{label}</span>
      {badge && badge > 0 && (
        <span style={styles.badge}>{badge > 99 ? '99+' : badge}</span>
      )}
    </Link>
  );
}

// ============================================
// PRO BUTTON
// ============================================

function PrimalPlus({ onClick, isActive }: { onClick: () => void; isActive: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navItem,
        ...(isActive ? styles.navItemActive : {}),
        background: 'none',
        border: 'none',
        borderBottom: isActive ? '3px solid #ff6b35' : 'none',
      }}
    >
      <div style={styles.iconWrapper}>
        <span style={styles.proText}>PRO</span>
      </div>
      <span style={{ ...styles.label, opacity: 0 }}>PRO</span>
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface BottomNavWithBadgesProps {
  onPrimalPlusClick?: () => void;
}

export function BottomNavWithBadges({ onPrimalPlusClick }: BottomNavWithBadgesProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [badges, setBadges] = useState({ taps: 0, messages: 0, views: 0 });

  // Fetch badge counts
  useEffect(() => {
    const fetchCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch unread taps count
      const { count: tapsCount } = await supabase
        .from('taps')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('viewed_at', null);

      // Fetch unread messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      // Fetch unread views count (profile_views table)
      const { count: viewsCount } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_id', user.id)
        .is('seen_at', null);

      setBadges({
        taps: tapsCount || 0,
        messages: messagesCount || 0,
        views: viewsCount || 0,
      });
    };

    fetchCounts();

    // Subscribe to real-time updates
    const tapsChannel = supabase
      .channel('bottom-nav-taps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'taps' }, fetchCounts)
      .subscribe();

    const messagesChannel = supabase
      .channel('bottom-nav-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchCounts)
      .subscribe();

    const viewsChannel = supabase
      .channel('bottom-nav-views')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_views' }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(tapsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(viewsChannel);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard';
    if (href === '/premium') return pathname === '/premium';
    return pathname.startsWith(href);
  };

  const handlePrimalPlus = () => {
    if (onPrimalPlusClick) {
      onPrimalPlusClick();
    } else {
      // Default: go to premium page
      router.push('/premium');
    }
  };

  return (
    <nav role="tablist" aria-label="Main navigation" style={styles.nav}>
      <NavItem
        href="/dashboard"
        label="Explore"
        icon={<ExploreIcon />}
        isActive={isActive('/dashboard')}
      />
      <NavItem
        href="/taps"
        label="Taps"
        icon={<TapsIcon />}
        isActive={isActive('/taps')}
        badge={badges.taps}
      />
      <PrimalPlus onClick={handlePrimalPlus} isActive={isActive('/premium')} />
      <NavItem
        href="/messages"
        label="Messages"
        icon={<MessagesIcon />}
        isActive={isActive('/messages')}
        badge={badges.messages}
      />
      <NavItem
        href="/views"
        label="Views"
        icon={<ViewsIcon />}
        isActive={isActive('/views')}
        badge={badges.views}
      />
    </nav>
  );
}

export default BottomNavWithBadges;

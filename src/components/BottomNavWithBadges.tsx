// ============================================
// BOTTOM NAVIGATION - SLTR
// ============================================
// 5 Buttons: Explore | Taps | SLTR+ | Messages | Views
// - SLTR+ always lit orange (center)
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

const ICON_SIZE = 28; // 1.5x bigger (was ~18-22)
const FONT_SIZE = 13; // 1.5x bigger (was 9)

const styles = {
  nav: {
    position: 'fixed' as const,
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 50,
    background: '#111',
    border: '1px solid #222',
    borderRadius: 24,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    padding: '12px 8px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
    padding: '8px 10px',
    cursor: 'pointer',
    position: 'relative' as const,
    textDecoration: 'none',
    borderRadius: 14,
    minWidth: 56,
    height: 60, // Fixed height for alignment
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
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ff6b35',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 9,
    boxShadow: '0 0 8px rgba(255,107,53,0.6)',
  },
  sltrText: {
    fontSize: 18, // 1.5x bigger
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
    <Link href={href} style={styles.navItem}>
      <div style={styles.iconWrapper}>
        {icon}
      </div>
      <span style={styles.label}>{label}</span>
      {/* Orange underline - only visible when selected */}
      {isActive && (
        <span style={{
          ...styles.accent,
          width: 28, // Slightly longer underline
          boxShadow: '0 0 8px rgba(255,107,53,0.8)',
        }} />
      )}
      {badge && badge > 0 && (
        <span style={styles.badge}>{badge > 99 ? '99+' : badge}</span>
      )}
    </Link>
  );
}

// ============================================
// SLTR+ BUTTON
// ============================================

function SltrPlus({ onClick, isActive }: { onClick: () => void; isActive: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navItem,
        background: 'none',
        border: 'none',
      }}
    >
      <div style={styles.iconWrapper}>
        <span style={styles.sltrText}>SLTR+</span>
      </div>
      <span style={{ ...styles.label, opacity: 0 }}>SLTR+</span>
      {/* Always show underline for SLTR+ or only when active */}
      {isActive && (
        <span style={{
          ...styles.accent,
          width: 32,
          boxShadow: '0 0 8px rgba(255,107,53,0.8)',
        }} />
      )}
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface BottomNavWithBadgesProps {
  onSltrPlusClick?: () => void;
}

export function BottomNavWithBadges({ onSltrPlusClick }: BottomNavWithBadgesProps) {
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

  const handleSltrPlus = () => {
    if (onSltrPlusClick) {
      onSltrPlusClick();
    } else {
      // Default: go to premium page
      router.push('/premium');
    }
  };

  return (
    <nav style={styles.nav}>
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
      <SltrPlus onClick={handleSltrPlus} isActive={isActive('/premium')} />
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

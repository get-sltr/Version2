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
    alignItems: 'center',
    padding: '10px 6px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    padding: '6px 8px',
    cursor: 'pointer',
    position: 'relative' as const,
    textDecoration: 'none',
    borderRadius: 14,
  },
  label: {
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  accent: {
    position: 'absolute' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    height: 2,
    borderRadius: 1,
    background: '#ff6b35',
  },
  badge: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    padding: '0 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ff6b35',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    borderRadius: 8,
    boxShadow: '0 0 8px rgba(255,107,53,0.6)',
  },
  sltrText: {
    fontSize: 13,
    fontWeight: 800,
    color: '#ff6b35',
    letterSpacing: 0.5,
    textShadow: '0 0 10px rgba(255,107,53,0.5)',
  },
};

// ============================================
// ICONS
// ============================================

function ExploreIcon({ color }: { color: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );
}

function TapsIcon({ color }: { color: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill={color}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

function MessagesIcon({ color }: { color: string }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill={color}>
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>
  );
}

function ViewsIcon({ color, fadedColor }: { color: string; fadedColor: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {/* Flame 1: Front, larger */}
      <path
        d="M10 22C6 22 3 18.5 3 15C3 10 10 2 10 2C10 2 17 10 17 15C17 18.5 14 22 10 22Z"
        fill={color}
      />
      {/* Flame 2: Back, smaller, offset right */}
      <path
        d="M16 18C13.5 18 11.5 15.8 11.5 13.5C11.5 10 16 5 16 5C16 5 20.5 10 20.5 13.5C20.5 15.8 18.5 18 16 18Z"
        fill={fadedColor}
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
  const color = isActive ? '#ff6b35' : '#666';

  return (
    <Link href={href} style={styles.navItem}>
      <div style={{
        filter: isActive ? 'drop-shadow(0 0 8px rgba(255,107,53,0.6))' : 'none'
      }}>
        {icon}
      </div>
      <span style={{ ...styles.label, color }}>{label}</span>
      <span style={{
        ...styles.accent,
        width: isActive ? 18 : 0,
        boxShadow: isActive ? '0 0 8px rgba(255,107,53,0.8)' : 'none',
      }} />
      {badge && badge > 0 && (
        <span style={styles.badge}>{badge > 99 ? '99+' : badge}</span>
      )}
    </Link>
  );
}

// ============================================
// SLTR+ BUTTON
// ============================================

function SltrPlus({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.navItem,
        padding: '10px 12px',
        background: 'none',
        border: 'none',
      }}
    >
      <span style={styles.sltrText}>SLTR+</span>
      <span style={{
        ...styles.accent,
        width: 22,
        boxShadow: '0 0 8px rgba(255,107,53,0.8)',
      }} />
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
    return pathname.startsWith(href);
  };

  const getColor = (href: string) => isActive(href) ? '#ff6b35' : '#666';

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
        icon={<ExploreIcon color={getColor('/dashboard')} />}
        isActive={isActive('/dashboard')}
      />
      <NavItem
        href="/taps"
        label="Taps"
        icon={<TapsIcon color={getColor('/taps')} />}
        isActive={isActive('/taps')}
        badge={badges.taps}
      />
      <SltrPlus onClick={handleSltrPlus} />
      <NavItem
        href="/messages"
        label="Messages"
        icon={<MessagesIcon color={getColor('/messages')} />}
        isActive={isActive('/messages')}
        badge={badges.messages}
      />
      <NavItem
        href="/views"
        label="Views"
        icon={<ViewsIcon color={getColor('/views')} fadedColor={getColor('/views')} />}
        isActive={isActive('/views')}
        badge={badges.views}
      />
    </nav>
  );
}

export default BottomNavWithBadges;

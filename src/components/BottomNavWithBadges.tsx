// ============================================
// BOTTOM NAVIGATION - PRIMAL
// ============================================
// HIG-compliant iOS tab bar
// Inactive: gray icons/labels
// Active: orange icon/label with glow
// Dark glass background with blur
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ============================================
// CONSTANTS (HIG)
// ============================================

const ICON_SIZE = 25;       // HIG standard tab bar icon (25pt)
const FONT_SIZE = 10;       // HIG minimum label size (10pt)
const INACTIVE = '#8E8E93'; // iOS system gray
const ACTIVE = '#ff6b35';   // Primal orange

// ============================================
// ICONS — accept `color` for active/inactive
// ============================================

function ExploreIcon({ color }: { color: string }) {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );
}

function TapsIcon({ color }: { color: string }) {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill={color}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

function MessagesIcon({ color }: { color: string }) {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill={color}>
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>
  );
}

function ViewsIcon({ color }: { color: string }) {
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <path
        d="M10 22C6 22 3 18.5 3 15C3 10 10 2 10 2C10 2 17 10 17 15C17 18.5 14 22 10 22Z"
        fill={color}
      />
      <path
        d="M16 18C13.5 18 11.5 15.8 11.5 13.5C11.5 10 16 5 16 5C16 5 20.5 10 20.5 13.5C20.5 15.8 18.5 18 16 18Z"
        fill={color}
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
      aria-label={`${label}${badge != null && badge > 0 ? `, ${badge} new` : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: '4px 8px',
        cursor: 'pointer',
        position: 'relative',
        textDecoration: 'none',
        minWidth: 48,
        minHeight: 44,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        background: 'transparent',
      }}
    >
      <div style={{ height: ICON_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{
        fontSize: FONT_SIZE,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: isActive ? ACTIVE : INACTIVE,
      }}>
        {label}
      </span>
      {badge != null && badge > 0 ? (
        <span style={{
          position: 'absolute',
          top: 0,
          right: 0,
          minWidth: 16,
          height: 16,
          padding: '0 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ff3b30',
          color: '#fff',
          fontSize: 9,
          fontWeight: 700,
          borderRadius: 8,
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
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
      role="tab"
      aria-selected={isActive}
      aria-label="Primal Pro"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: '4px 8px',
        cursor: 'pointer',
        position: 'relative',
        minWidth: 48,
        minHeight: 44,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        background: 'none',
        border: 'none',
      }}
    >
      <span style={{
        fontSize: 13,
        fontWeight: 800,
        color: ACTIVE,
        letterSpacing: 0.5,
        textShadow: '0 0 8px rgba(255,107,53,0.4)',
      }}>
        PRO
      </span>
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

      const { count: tapsCount } = await supabase
        .from('taps')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('viewed_at', null);

      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

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
    if (href === '/dashboard') return pathname === '/' || pathname === '/dashboard' || pathname === '/map';
    if (href === '/premium') return pathname === '/premium';
    return pathname.startsWith(href);
  };

  const handlePrimalPlus = () => {
    if (onPrimalPlusClick) {
      onPrimalPlusClick();
    } else {
      router.push('/premium');
    }
  };

  return (
    <nav role="tablist" aria-label="Main navigation" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(17, 17, 17, 0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'stretch',
      padding: '4px 8px env(safe-area-inset-bottom, 0px) 8px',
    }}>
      <NavItem
        href="/dashboard"
        label="Explore"
        icon={<ExploreIcon color={isActive('/dashboard') ? ACTIVE : INACTIVE} />}
        isActive={isActive('/dashboard')}
      />
      <NavItem
        href="/taps"
        label="Taps"
        icon={<TapsIcon color={isActive('/taps') ? ACTIVE : INACTIVE} />}
        isActive={isActive('/taps')}
        badge={badges.taps}
      />
      <PrimalPlus onClick={handlePrimalPlus} isActive={isActive('/premium')} />
      <NavItem
        href="/messages"
        label="Messages"
        icon={<MessagesIcon color={isActive('/messages') ? ACTIVE : INACTIVE} />}
        isActive={isActive('/messages')}
        badge={badges.messages}
      />
      <NavItem
        href="/views"
        label="Views"
        icon={<ViewsIcon color={isActive('/views') ? ACTIVE : INACTIVE} />}
        isActive={isActive('/views')}
        badge={badges.views}
      />
    </nav>
  );
}

export default BottomNavWithBadges;

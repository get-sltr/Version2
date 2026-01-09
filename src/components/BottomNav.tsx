// =============================================================================
// BottomNav - Shared bottom navigation with custom icons and badge counts
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSearch, IconFlame, IconChat, IconUser } from '@/components/Icons';
import { supabase } from '@/lib/supabase';

type NavItem = 'explore' | 'taps' | 'messages' | 'profile';

interface BottomNavProps {
  active?: NavItem;
}

export function BottomNav({ active }: BottomNavProps) {
  const { colors } = useTheme();
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unviewedTaps, setUnviewedTaps] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unread messages count
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (msgCount !== null) setUnreadMessages(msgCount);

      // Get unviewed taps count
      const { count: tapCount } = await supabase
        .from('taps')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('viewed_at', null);

      if (tapCount !== null) setUnviewedTaps(tapCount);
    };

    loadCounts();

    // Set up real-time subscriptions for updates
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to new messages
      const messagesChannel = supabase
        .channel('bottom-nav-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`
          },
          () => loadCounts()
        )
        .subscribe();

      // Subscribe to new taps
      const tapsChannel = supabase
        .channel('bottom-nav-taps')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'taps',
            filter: `recipient_id=eq.${user.id}`
          },
          () => loadCounts()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(tapsChannel);
      };
    };

    const cleanup = setupSubscriptions();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, []);

  // Auto-detect active based on path if not provided
  const currentActive = active || detectActive(pathname);

  // Build nav items - standard 4-item navigation
  const navItems: { key: NavItem; href: string; icon: typeof IconSearch; label: string }[] = [
    { key: 'explore', href: '/dashboard', icon: IconSearch, label: 'Explore' },
    { key: 'taps', href: '/taps', icon: IconFlame, label: 'Taps' },
    { key: 'messages', href: '/messages', icon: IconChat, label: 'Messages' },
    { key: 'profile', href: '/profile/edit', icon: IconUser, label: 'Profile' },
  ];

  const getBadgeCount = (key: NavItem): number => {
    if (key === 'messages') return unreadMessages;
    if (key === 'taps') return unviewedTaps;
    return 0;
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: colors.surface,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '6px 0 18px',
      zIndex: 100
    }}>
      {navItems.map(({ key, href, icon: Icon, label }) => {
        const isActive = currentActive === key;
        const badgeCount = getBadgeCount(key);
        return (
          <Link
            key={key}
            href={href}
            style={{
              textAlign: 'center',
              color: isActive ? colors.accent : colors.textSecondary,
              textDecoration: 'none',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'relative',
              display: 'inline-flex'
            }}>
              <Icon size={18} />
              {badgeCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  minWidth: '14px',
                  height: '14px',
                  borderRadius: '7px',
                  background: colors.accent,
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px'
                }}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </div>
              )}
            </div>
            <span style={{
              fontSize: '9px',
              fontWeight: isActive ? 600 : 400
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function detectActive(pathname: string): NavItem {
  if (pathname.startsWith('/taps')) return 'taps';
  if (pathname.startsWith('/messages')) return 'messages';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'explore';
}

export default BottomNav;

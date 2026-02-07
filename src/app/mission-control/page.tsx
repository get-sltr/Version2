'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { usePremium } from '@/hooks/usePremium';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useMapProfiles } from '@/hooks/useMapProfiles';
import { useLocationPresence } from '@/hooks/useLocationPresence';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { getMyFavorites } from '@/lib/api/favorites';
import { getReceivedTaps } from '@/lib/api/taps';
import { getProfileViews } from '@/lib/api/views';
import { getCruisingUpdates } from '@/lib/api/cruisingUpdates';
import { PremiumPromo } from '@/components/PremiumPromo';
import MapboxMap from '@/components/Mapbox/MapboxMap';
import ProBadge from '@/components/ProBadge';
import { glassCard, glassBottomNav } from '@/styles/design-tokens';
import type { ProfilePreview } from '@/types/database';
import type { Coordinates, MapProfile } from '@/types/map';
import type { CruisingUpdateWithUser } from '@/lib/api/cruisingUpdates';

// ============================================
// TYPES
// ============================================

type GridTab = 'favorites' | 'taps' | 'views';

type GridProfile = {
  id: string;
  display_name: string | null;
  age: number | null;
  photo_url: string | null;
  position: string | null;
};

type ConversationPreview = {
  userId: string;
  displayName: string | null;
  photoUrl: string | null;
  isOnline: boolean;
  isPremium: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

// ============================================
// UTILS
// ============================================

const formatRelativeTime = (isoDate: string) => {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return '';
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d`;
  return new Date(isoDate).toLocaleDateString();
};

// ============================================
// PANEL HEADER
// ============================================

function PanelHeader({ title, expandHref }: { title: string; expandHref: string }) {
  const router = useRouter();
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: "'Orbitron', sans-serif",
      }}>
        {title}
      </span>
      <button
        onClick={() => router.push(expandHref)}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '4px',
          lineHeight: 1,
        }}
        aria-label={`Expand ${title}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z" />
        </svg>
      </button>
    </div>
  );
}

// ============================================
// GRID PANEL
// ============================================

function GridPanel({ activeTab, onTabChange }: { activeTab: GridTab; onTabChange: (t: GridTab) => void }) {
  const router = useRouter();
  const [profiles, setProfiles] = useState<GridProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        let result: GridProfile[] = [];
        if (activeTab === 'favorites') {
          const data = await getMyFavorites();
          result = data.slice(0, 4).map(f => ({
            id: f.profile.id,
            display_name: f.profile.display_name,
            age: f.profile.age,
            photo_url: f.profile.photo_url,
            position: f.profile.position,
          }));
        } else if (activeTab === 'taps') {
          const data = await getReceivedTaps();
          result = data.slice(0, 4).map(t => ({
            id: t.user.id,
            display_name: t.user.display_name,
            age: t.user.age,
            photo_url: t.user.photo_url,
            position: t.user.position,
          }));
        } else {
          const data = await getProfileViews();
          result = data.slice(0, 4).map(v => ({
            id: v.viewer.id,
            display_name: v.viewer.display_name,
            age: v.viewer.age,
            photo_url: v.viewer.photo_url,
            position: v.viewer.position,
          }));
        }
        if (!cancelled) setProfiles(result);
      } catch (err) {
        console.error('Grid panel error:', err);
        if (!cancelled) setProfiles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeTab]);

  const expandHref = activeTab === 'favorites' ? '/favorites' : activeTab === 'taps' ? '/taps' : '/views';

  const tabs: { key: GridTab; label: string }[] = [
    { key: 'favorites', label: 'Fav' },
    { key: 'taps', label: 'Taps' },
    { key: 'views', label: 'Views' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PanelHeader title="Grid" expandHref={expandHref} />
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: activeTab === tab.key
                ? 'linear-gradient(135deg, rgba(255,107,53,0.25), rgba(255,107,53,0.15))'
                : 'rgba(255,255,255,0.04)',
              color: activeTab === tab.key ? '#FF6B35' : 'rgba(255,255,255,0.5)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            Loading...
          </div>
        ) : profiles.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            No profiles yet
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', height: 'fit-content' }}>
            {profiles.map(p => (
              <div
                key={p.id}
                onClick={() => router.push(`/profile/${p.id}`)}
                style={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#1a1a1a',
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${p.photo_url || '/images/5.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 6px 6px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                    {p.display_name || 'New User'}{p.age ? `, ${p.age}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MESSAGES PANEL
// ============================================

function MessagesPanel() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const { blockedIds } = useBlockedUsers();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) { setLoading(false); return; }

        const { data: messagesData } = await supabase
          .from('messages')
          .select('id, sender_id, recipient_id, content, type, read_at, created_at')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(200);

        if (!messagesData?.length || cancelled) {
          if (!cancelled) { setConversations([]); setLoading(false); }
          return;
        }

        const otherUserIds = Array.from(new Set(
          messagesData
            .flatMap(m => [m.sender_id, m.recipient_id])
            .filter((id): id is string => id !== null && id !== user.id)
        ));

        if (!otherUserIds.length) {
          if (!cancelled) { setConversations([]); setLoading(false); }
          return;
        }

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, photo_url, is_online, is_premium')
          .in('id', otherUserIds);

        const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));
        const convMap = new Map<string, ConversationPreview>();

        for (const msg of messagesData) {
          const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
          if (blockedIds.has(otherId)) continue;
          const profile = profilesMap.get(otherId);
          if (!profile) continue;

          if (!convMap.has(otherId)) {
            convMap.set(otherId, {
              userId: otherId,
              displayName: profile.display_name,
              photoUrl: profile.photo_url,
              isOnline: profile.is_online ?? false,
              isPremium: profile.is_premium ?? false,
              lastMessage: msg.content || (msg.type === 'image' ? 'Shared an image' : 'New message'),
              lastMessageTime: msg.created_at,
              unreadCount: 0,
            });
          }
          if (msg.recipient_id === user.id && !msg.read_at) {
            const conv = convMap.get(otherId);
            if (conv) conv.unreadCount++;
          }
        }

        if (!cancelled) {
          setConversations(Array.from(convMap.values()));
          setLoading(false);
        }
      } catch (err) {
        console.error('Messages panel error:', err);
        if (!cancelled) { setConversations([]); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [blockedIds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PanelHeader title="Messages" expandHref="/messages" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            No conversations yet
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.userId}
              onClick={() => router.push(`/messages/${conv.userId}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#333',
                  backgroundImage: `url(${conv.photoUrl || '/images/5.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
                {conv.isOnline && (
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#FF6B35',
                    border: '2px solid #000',
                  }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: conv.unreadCount > 0 ? 700 : 500,
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {conv.displayName || 'New User'}
                  </span>
                  {conv.isPremium && <ProBadge size="sm" />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    color: conv.unreadCount > 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                    fontWeight: conv.unreadCount > 0 ? 600 : 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {conv.lastMessage}
                  </span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: '6px' }}>
                    {formatRelativeTime(conv.lastMessageTime)}
                  </span>
                </div>
              </div>
              {conv.unreadCount > 0 && (
                <div style={{
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  background: '#FF6B35',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#fff',
                  padding: '0 4px',
                  flexShrink: 0,
                }}>
                  {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// CRUISING PANEL
// ============================================

function CruisingPanel() {
  const router = useRouter();
  const [updates, setUpdates] = useState<CruisingUpdateWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCruisingUpdates();
        if (!cancelled) setUpdates(data.slice(0, 20));
      } catch (err) {
        console.error('Cruising panel error:', err);
        if (!cancelled) setUpdates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PanelHeader title="Cruising" expandHref="/cruising" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            Loading...
          </div>
        ) : updates.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
            No updates yet
          </div>
        ) : (
          updates.map(update => (
            <div
              key={update.id}
              onClick={() => router.push('/cruising')}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '10px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                flexShrink: 0,
                background: '#333',
                backgroundImage: `url(${update.user.photo_url || '/images/5.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>
                    {update.user.display_name || 'Anonymous'}
                  </span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                    {formatRelativeTime(update.created_at)}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.6)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '3px',
                }}>
                  {update.text}
                </div>
                {update.like_count > 0 && (
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                    {update.like_count} like{update.like_count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// MAP PANEL
// ============================================

function MapPanel() {
  const router = useRouter();
  const { blockedIds } = useBlockedUsers();
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);

  const handleCenterUpdate = useCallback((coords: Coordinates) => {
    setMapCenter(coords);
  }, []);

  useLocationPresence({ onFirstFix: handleCenterUpdate });

  const { profile: currentUser } = useCurrentUserProfile({
    onLocationLoaded: handleCenterUpdate,
  });

  const { profiles } = useMapProfiles({ mapCenter, blockedIds });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PanelHeader title="Map" expandHref="/map" />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapboxMap
          profiles={profiles}
          mapCenter={mapCenter}
          currentUserProfile={currentUser ? {
            id: currentUser.id,
            lat: currentUser.lat ?? undefined,
            lng: currentUser.lng ?? undefined,
            image: currentUser.image ?? undefined,
          } : undefined}
          onSelectProfile={(p: MapProfile) => router.push(`/profile/${p.id}`)}
        />
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function MissionControlPage() {
  const router = useRouter();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [gridTab, setGridTab] = useState<GridTab>('favorites');
  const [onlineCount, setOnlineCount] = useState(0);

  // Fetch online count (profiles with last_seen within 5 minutes)
  useEffect(() => {
    const fetchOnlineCount = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', fiveMinutesAgo);
      setOnlineCount(count || 0);
    };
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist grid tab preference
  useEffect(() => {
    const saved = localStorage.getItem('mc_grid_tab');
    if (saved === 'favorites' || saved === 'taps' || saved === 'views') {
      setGridTab(saved);
    }
  }, []);

  const handleGridTabChange = useCallback((tab: GridTab) => {
    setGridTab(tab);
    localStorage.setItem('mc_grid_tab', tab);
  }, []);

  // Premium gate
  if (premiumLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '2px solid rgba(255,107,53,0.3)',
          borderTopColor: '#FF6B35',
          borderRadius: '50%',
          animation: 'mc-spin 1s linear infinite',
        }} />
        <style jsx>{`@keyframes mc-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isPremium) {
    return <PremiumPromo feature="Mission Control" fullPage />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      maxHeight: '100vh',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* STATUS BAR / HEADER */}
      <header style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 8px) 16px 8px',
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            fontFamily: "'Orbitron', sans-serif",
            background: 'linear-gradient(135deg, #FF6B35, #ff8c5a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            MISSION CONTROL
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#4caf50',
              boxShadow: '0 0 6px rgba(76,175,80,0.6)',
              animation: 'mc-pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
              {onlineCount} online
            </span>
          </div>
          <button
            onClick={() => router.back()}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close Mission Control"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </header>

      {/* TOP PANELS (Grid + Messages) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        flex: 1,
        minHeight: 0,
        background: 'rgba(255,255,255,0.04)',
      }}>
        <div style={{ ...glassCard, borderRadius: 0, border: 'none', overflow: 'hidden' }}>
          <GridPanel activeTab={gridTab} onTabChange={handleGridTabChange} />
        </div>
        <div style={{ ...glassCard, borderRadius: 0, border: 'none', overflow: 'hidden' }}>
          <MessagesPanel />
        </div>
      </div>

      {/* CHROME BANNER */}
      <div style={{
        height: '32px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg, #8a8a8a, #d4d4d4, #f5f5f5, #d4d4d4, #8a8a8a)',
        backgroundSize: '200% 100%',
        animation: 'mc-chrome-sweep 4s ease-in-out infinite',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '4px',
          fontFamily: "'Orbitron', sans-serif",
          color: '#222',
          textShadow: '0 1px 0 rgba(255,255,255,0.4)',
          zIndex: 1,
        }}>
          PRIMAL+
        </span>
      </div>

      {/* BOTTOM PANELS (Cruising + Map) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        flex: 1,
        minHeight: 0,
        background: 'rgba(255,255,255,0.04)',
      }}>
        <div style={{ ...glassCard, borderRadius: 0, border: 'none', overflow: 'hidden' }}>
          <CruisingPanel />
        </div>
        <div style={{ ...glassCard, borderRadius: 0, border: 'none', overflow: 'hidden' }}>
          <MapPanel />
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        ...glassBottomNav,
        padding: '8px 16px calc(env(safe-area-inset-bottom, 0px) + 8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '6px',
          fontFamily: "'Orbitron', sans-serif",
          color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase',
        }}>
          MISSION CONTROL
        </span>
      </footer>

      {/* GLOBAL ANIMATIONS */}
      <style jsx>{`
        @keyframes mc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes mc-chrome-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes mc-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

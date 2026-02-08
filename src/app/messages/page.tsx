'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { IconClose, IconMenu, IconChat } from '@/components/Icons';
import BottomNavWithBadges from '@/components/BottomNavWithBadges';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { glassHeader } from '@/styles/design-tokens';
import ProBadge from '@/components/ProBadge';

type ProfilePreview = {
  id: string;
  display_name?: string | null;
  photo_url?: string | null;
  is_online?: boolean | null;
  is_premium?: boolean | null;
  distance?: number | null;
};

type MessageRecord = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
};

type ConversationPreview = {
  user: ProfilePreview;
  lastMessage: MessageRecord;
  unreadCount: number;
};

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

export default function MessagesPage() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const { blockedIds, isReady: blockedReady } = useBlockedUsers();
  // Stable key for blockedIds so the effect doesn't loop on Set reference changes
  const blockedKey = useMemo(() => Array.from(blockedIds).sort().join(','), [blockedIds]);
  const blockedRef = useRef(blockedIds);
  blockedRef.current = blockedIds;

  // Load pinned conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pinnedConversations');
    if (saved) {
      setPinnedIds(JSON.parse(saved));
    }
  }, []);

  const togglePin = (userId: string) => {
    setPinnedIds(prev => {
      const newPinned = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      localStorage.setItem('pinnedConversations', JSON.stringify(newPinned));
      return newPinned;
    });
    setLongPressId(null);
  };

  const handleTypingIndicatorClear = (threadId: string) => {
    setTypingMap((prev) => {
      const copy = { ...prev };
      delete copy[threadId];
      return copy;
    });
  };

  const handleTypingBroadcast = (payload: any) => {
    const senderId = payload?.payload?.userId;
    const threadId = payload?.payload?.threadId;
    if (!senderId || !threadId) return;
    // if I'm the sender, ignore; only show others typing to me
    if (senderId === currentUserId) return;
    
    setTypingMap((prev) => ({ ...prev, [threadId]: true }));
    setTimeout(() => handleTypingIndicatorClear(threadId), 2000);
  };

  useEffect(() => {
    if (!blockedReady) return;

    let isMounted = true;

    const loadConversations = async () => {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (isMounted) {
          setConversations([]);
          setLoading(false);
        }
        return;
      }
      setCurrentUserId(user.id);
      // Fetch messages
      const { data: messagesData, error: messageError } = await supabase
        .from('messages')
        .select('id, sender_id, recipient_id, content, type, read_at, created_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(200);

      if (messageError) {
        console.error('Messages error:', messageError);
        if (isMounted) {
          setConversations([]);
          setLoading(false);
        }
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        if (isMounted) {
          setConversations([]);
          setLoading(false);
        }
        return;
      }

      // Get unique other user IDs
      const otherUserIds = Array.from(new Set(
        messagesData
          .flatMap(m => [m.sender_id, m.recipient_id])
          .filter((id): id is string => id !== null && id !== user.id)
      ));

      // Fetch profiles separately

      // Guard against empty array
      if (otherUserIds.length === 0) {
        if (isMounted) {
          setConversations([]);
          setLoading(false);
        }
        return;
      }
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url, is_online, is_premium')
        .in('id', otherUserIds.length > 0 ? otherUserIds : ['00000000-0000-0000-0000-000000000000']);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      const conversationMap = new Map<string, ConversationPreview>();

      messagesData.forEach((message: any) => {
        const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
        const otherProfile = profilesMap.get(otherUserId);
        if (!otherProfile?.id) return;

        if (!conversationMap.has(otherProfile.id)) {
          conversationMap.set(otherProfile.id, {
            user: otherProfile,
            lastMessage: {
              id: message.id,
              sender_id: message.sender_id,
              recipient_id: message.recipient_id,
              content: message.content,
              type: message.type,
              read_at: message.read_at,
              created_at: message.created_at,
            },
            unreadCount: 0,
          });
        }

        if (message.recipient_id === user.id && !message.read_at) {
          const preview = conversationMap.get(otherProfile.id);
          if (preview) {
            preview.unreadCount += 1;
          }
        }
      });

      // Remove blocked users from conversations
      blockedRef.current.forEach(id => conversationMap.delete(id));

      if (isMounted) {
        setConversations(Array.from(conversationMap.values()));
        setLoading(false);
      }
    };

    loadConversations();

    const channel = supabase.channel('messages-channel').on('broadcast', { event: 'typing' }, handleTypingBroadcast).subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, blockedKey, blockedReady]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    if (activeTab === 'unread') {
      filtered = conversations.filter((conv) => conv.unreadCount > 0);
    }
    // Sort pinned conversations to the top
    return filtered.sort((a, b) => {
      const aIsPinned = pinnedIds.includes(a.user?.id || '');
      const bIsPinned = pinnedIds.includes(b.user?.id || '');
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });
  }, [activeTab, conversations, pinnedIds]);

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif", paddingBottom: '80px' }}>
      {/* Header */}
        <header style={{
          ...glassHeader,
          padding: 'calc(env(safe-area-inset-top, 0px) + 15px) 20px 15px',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <Link href="/dashboard" aria-label="Back to dashboard" style={{ color: colors.text, textDecoration: 'none', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconClose size={24} />
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Messages</h1>
          <Link href="/settings" aria-label="Settings" style={{ color: colors.text, textDecoration: 'none', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconMenu size={24} />
          </Link>
        </div>
        
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                flex: 1,
                background: activeTab === 'all' ? colors.accent : 'rgba(128, 128, 128, 0.15)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                color: activeTab === 'all' ? '#fff' : colors.text,
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: activeTab === 'all' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              style={{
                flex: 1,
                background: activeTab === 'unread' ? colors.accent : 'rgba(128, 128, 128, 0.15)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                color: activeTab === 'unread' ? '#fff' : colors.text,
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: activeTab === 'unread' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              Unread
            </button>
          </div>
        </header>
  
        <div>
          {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
            Loading messages...
          </div>
        )}
        {!loading && filteredConversations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: '20px', opacity: 0.3, display: 'flex', justifyContent: 'center' }}>
              <IconChat size={64} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px', color: colors.text }}>
              {activeTab === 'unread' ? 'No Unread Messages' : 'No Conversations Yet'}
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              {activeTab === 'unread' ? 'All caught up!' : 'Start a conversation to see it here.'}
            </p>
          </div>
        )}
        {!loading && filteredConversations.length > 0 && (
          <>
            {filteredConversations.map((conv) => {
              const isPinned = pinnedIds.includes(conv.user?.id || '');
              const isLongPressActive = longPressId === conv.user?.id;

              return (
              <div
                key={conv.user?.id || Math.random().toString(36)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px 20px',
                  borderBottom: `1px solid ${colors.border}`,
                  textDecoration: 'none',
                  color: colors.text,
                  position: 'relative',
                  background: isPinned ? 'rgba(255, 107, 53, 0.05)' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (!isLongPressActive) {
                    window.location.href = `/messages/${conv.user?.id ?? ''}`;
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setLongPressId(isLongPressActive ? null : conv.user?.id || null);
                }}
              >
                {/* Pin indicator */}
                {isPinned && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    fontSize: '10px',
                    color: '#FF6B35',
                  }}>
                    📌
                  </div>
                )}

                {/* Long press menu */}
                {isLongPressActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '20px',
                      transform: 'translateY(-50%)',
                      background: '#222',
                      borderRadius: '8px',
                      padding: '8px',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => togglePin(conv.user?.id || '')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {isPinned ? '📌 Unpin' : '📌 Pin'}
                    </button>
                  </div>
                )}

                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#333',
                      backgroundImage: `url(${conv.user?.photo_url || '/images/5.jpg'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: isPinned ? '2px solid #FF6B35' : '2px solid #000',
                    }}
                  />
                  {conv.user?.is_online && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#FF6B35',
                        border: '2px solid #000',
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '17px', fontWeight: conv.unreadCount > 0 ? 700 : 600 }}>
                        {conv.user?.display_name || 'New User'}
                      </span>
                      {conv.user?.is_premium && <ProBadge size="sm" />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {(() => {
                        const isTyping = typingMap[conv.user?.id || ''];
                        const unreadMessageColor = conv.unreadCount > 0 ? colors.text : colors.textSecondary;
                        const messageColor = isTyping ? colors.accent : unreadMessageColor;
                        
                        const messageText = conv.lastMessage?.content || (conv.lastMessage?.type === 'image' ? 'Shared an image' : 'New message');
                        const senderPrefix = conv.lastMessage?.sender_id === currentUserId ? 'You: ' : '';
                        const displayText = typingMap[conv.user?.id || '']
                          ? 'Typing…'
                          : `${senderPrefix}${messageText}`;
                        
                        return (
                          <div
                            style={{
                              fontSize: '15px',
                              color: messageColor,
                              fontWeight: conv.unreadCount > 0 || typingMap[conv.user?.id || ''] ? 600 : 400,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}
                          >
                            {displayText}
                          </div>
                        );
                      })()}
                      {conv.unreadCount > 0 && (
                      <div
                        style={{
                          background: '#FF6B35',
                          borderRadius: '10px',
                          minWidth: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                          marginLeft: '10px',
                        }}
                      >
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </>
        )}
          </div>
    
        {/* Bottom Navigation */}
      <BottomNavWithBadges />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { getGroup, isGroupMember } from '@/lib/api/groups';
import { getGroupMessages, sendGroupMessage, deleteGroupMessage } from '@/lib/api/groupMessages';
import type { GroupMessageWithSender } from '@/lib/api/groupMessages';
import type { GroupWithHost } from '@/types/database';

export default function GroupMessagesPage() {
  const params = useParams();
  const router = useRouter();
  const { colors } = useTheme();
  const groupId = params.id as string;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [group, setGroup] = useState<GroupWithHost | null>(null);
  const [messages, setMessages] = useState<GroupMessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  // Load group and messages
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to view messages.');
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      // Load group info
      const groupData = await getGroup(groupId);
      if (!groupData) {
        setError('Group not found.');
        setLoading(false);
        return;
      }

      // Check membership
      const role = await isGroupMember(groupId);
      const isHost = groupData.host_id === user.id;

      if (!role && !isHost) {
        setError('You must be a member to view group messages.');
        setLoading(false);
        return;
      }

      if (mounted) {
        setGroup(groupData);
      }

      // Load messages
      try {
        const msgs = await getGroupMessages(groupId);
        if (mounted) {
          setMessages(msgs);
          setLoading(false);
          setTimeout(() => {
            listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
          }, 50);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load messages.');
          setLoading(false);
        }
      }
    };

    load();

    // Subscribe to new messages
    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, () => {
        // Reload messages on new insert
        getGroupMessages(groupId).then(msgs => {
          if (mounted) {
            setMessages(msgs);
            setTimeout(() => {
              listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
            }, 50);
          }
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  // Send message
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !currentUserId) return;

    setSending(true);
    setInput('');

    try {
      await sendGroupMessage(groupId, text);
      // Message will appear via realtime subscription
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      setInput(text); // Restore input on error
    } finally {
      setSending(false);
    }
  };

  // Delete message
  const handleDelete = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      await deleteGroupMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      setError('Failed to delete message');
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        background: colors.background,
        zIndex: 10
      }}>
        <Link href={`/groups/${groupId}`} style={{ color: colors.text, textDecoration: 'none', fontSize: '20px' }}>
          ←
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>{group?.name || 'Group Chat'}</div>
          <div style={{ fontSize: '12px', color: colors.textSecondary }}>
            {group?.attendees || 0} members
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {error && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#ff4444',
            background: 'rgba(255,68,68,0.1)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(m => {
            const mine = m.sender_id === currentUserId;

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: mine ? 'flex-end' : 'flex-start',
                  marginBottom: '12px'
                }}
              >
                <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
                  {/* Sender name (for others) */}
                  {!mine && (
                    <div style={{ fontSize: '12px', color: colors.accent, marginBottom: '4px', marginLeft: '12px' }}>
                      {m.sender.display_name || 'Unknown'}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    style={{
                      background: mine ? colors.accent : colors.surface,
                      color: mine ? '#fff' : colors.text,
                      padding: '10px 14px',
                      borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      border: mine ? 'none' : `1px solid ${colors.border}`,
                      position: 'relative',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {m.content}

                    {/* Delete button for own messages */}
                    {mine && (
                      <button
                        onClick={() => handleDelete(m.id)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: colors.surface,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          color: colors.textSecondary,
                          cursor: 'pointer',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div style={{ fontSize: '10px', color: colors.textSecondary, marginTop: '4px', marginLeft: mine ? 0 : '12px', marginRight: mine ? '12px' : 0 }}>
                    {formatTime(m.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${colors.border}`,
        background: colors.background,
        position: 'sticky',
        bottom: 0
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !sending) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={sending || !!error}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.text,
              fontSize: '15px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: '24px',
              border: 'none',
              background: sending || !input.trim() ? colors.textSecondary : colors.accent,
              color: '#fff',
              fontWeight: 700,
              cursor: sending || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

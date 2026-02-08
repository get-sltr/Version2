'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

interface BlockedUserWithProfile {
  id: string;
  blocked_user_id: string;
  reason: string | null;
  created_at: string;
  blocked_user: {
    id: string;
    display_name: string | null;
    photo_url: string | null;
  } | null;
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const { colors, darkMode } = useTheme();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('blocks')
        .select(`
          id,
          blocked_user_id,
          reason,
          created_at,
          blocked_user:profiles!blocked_user_id(id, display_name, photo_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Supabase returns joined relations as arrays; extract the first element
      const normalized = (data || []).map((row: Record<string, unknown>) => ({
        ...row,
        blocked_user: Array.isArray(row.blocked_user)
          ? row.blocked_user[0] ?? null
          : row.blocked_user ?? null,
      })) as BlockedUserWithProfile[];

      setBlockedUsers(normalized);
    } catch (err) {
      console.error('Failed to load blocked users:', err);
      setError('Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (blockId: string, blockedUserId: string) => {
    setUnblockingId(blockId);
    try {
      const { error: deleteError } = await supabase
        .from('blocks')
        .delete()
        .eq('id', blockId);

      if (deleteError) throw deleteError;

      setBlockedUsers(prev => prev.filter(u => u.id !== blockId));
    } catch (err) {
      console.error('Failed to unblock user:', err);
      alert('Failed to unblock user. Please try again.');
    } finally {
      setUnblockingId(null);
    }
  };

  const unblockAll = async () => {
    if (!confirm(`Are you sure you want to unblock all ${blockedUsers.length} ${blockedUsers.length === 1 ? 'user' : 'users'}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: deleteError } = await supabase
        .from('blocks')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setBlockedUsers([]);
    } catch (err) {
      console.error('Failed to unblock all users:', err);
      alert('Failed to unblock users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, background: darkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', zIndex: 100 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: colors.text, fontSize: '24px', cursor: 'pointer', padding: '8px' }}
        >
          ‹
        </button>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Blocked Users</span>
        <span style={{ width: '40px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
            Loading...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#ff3b30', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={loadBlockedUsers}
              style={{ background: '#FF6B35', border: 'none', borderRadius: '8px', padding: '12px 24px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.3 }}>🚫</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>No Blocked Users</h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: 1.6 }}>
              When you block someone, they won't be able to see your profile or send you messages.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
                {blockedUsers.length} {blockedUsers.length === 1 ? 'person' : 'people'} blocked
              </p>
              <button
                type="button"
                onClick={unblockAll}
                disabled={loading}
                style={{ background: '#ff3b30', border: 'none', borderRadius: '8px', padding: '10px 16px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                Unblock All
              </button>
            </div>

            {blockedUsers.map(block => (
              <div key={block.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: `1px solid ${colors.border}` }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: darkMode ? '#333' : '#ddd',
                    backgroundImage: block.blocked_user?.photo_url ? `url(${block.blocked_user.photo_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: colors.textSecondary,
                  }}
                >
                  {!block.blocked_user?.photo_url && '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                    {block.blocked_user?.display_name || 'Deleted User'}
                  </div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                    Blocked on {formatDate(block.created_at)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => unblockUser(block.id, block.blocked_user_id)}
                  disabled={unblockingId === block.id}
                  style={{
                    background: darkMode ? '#1c1c1e' : '#f5f5f5',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: '#FF6B35',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: unblockingId === block.id ? 'wait' : 'pointer',
                    opacity: unblockingId === block.id ? 0.5 : 1,
                  }}
                >
                  {unblockingId === block.id ? 'Unblocking...' : 'Unblock'}
                </button>
              </div>
            ))}
          </>
        )}

        <div style={{ background: darkMode ? '#1c1c1e' : '#f5f5f5', borderRadius: '8px', padding: '15px', marginTop: '30px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>About Blocking</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: colors.textSecondary, lineHeight: 1.8 }}>
            <li>Blocked users can't see your profile or send you messages</li>
            <li>They won't be notified that you've blocked them</li>
            <li>You won't see each other in browse or search</li>
            <li>You can unblock someone at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

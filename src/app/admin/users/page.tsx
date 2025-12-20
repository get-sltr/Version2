'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { isFounder, hasPermission, getAdminRole } from '@/lib/admin';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  age: number | null;
  photo_url: string | null;
  is_online: boolean;
  is_premium: boolean;
  is_verified: boolean;
  created_at: string;
  last_seen: string | null;
  premium_until: string | null;
  city: string | null;
  country: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserEmail(user?.email || null);
    });
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        filter,
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const performAction = async (userId: string, action: string, data?: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Action failed');
      }

      // Refresh user list
      fetchUsers(pagination?.page);
      setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const canEditUsers = currentUserEmail && hasPermission(currentUserEmail, 'EDIT_USER');
  const canBanUsers = currentUserEmail && hasPermission(currentUserEmail, 'BAN_USER');
  const canDeleteUsers = currentUserEmail && isFounder(currentUserEmail);

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Users</h1>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
          style={{
            background: '#151515',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '10px 16px',
            color: '#fff',
            fontSize: '14px',
            flex: 1,
            minWidth: '200px',
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: '#151515',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '10px 16px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Users</option>
          <option value="premium">Premium Only</option>
          <option value="free">Free Only</option>
          <option value="online">Online Now</option>
          <option value="verified">Verified Only</option>
        </select>
        <button
          onClick={() => fetchUsers(1)}
          style={{
            background: '#FF6B35',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </div>

      {/* Results count */}
      {pagination && (
        <div style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
          Showing {users.length} of {pagination.total} users
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          background: 'rgba(255, 59, 48, 0.1)',
          border: '1px solid rgba(255, 59, 48, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          color: '#FF3B30',
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading users...
        </div>
      ) : (
        <>
          {/* Users Table */}
          <div style={{
            background: '#151515',
            borderRadius: '16px',
            border: '1px solid #222',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1a1a1a' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Joined</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Last Seen</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 600 }}>Location</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: '#888', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{ borderTop: '1px solid #222' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: user.photo_url
                            ? `url(${user.photo_url}) center/cover`
                            : '#333',
                          position: 'relative',
                        }}>
                          {user.is_online && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '12px',
                              height: '12px',
                              background: '#4CAF50',
                              borderRadius: '50%',
                              border: '2px solid #151515',
                            }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {user.display_name || 'No name'}
                            {user.age && <span style={{ color: '#888', fontWeight: 400 }}> • {user.age}</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {user.is_premium && (
                          <span style={{
                            background: 'rgba(255, 215, 0, 0.2)',
                            color: '#FFD700',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>
                            Premium
                          </span>
                        )}
                        {user.is_verified && (
                          <span style={{
                            background: 'rgba(33, 150, 243, 0.2)',
                            color: '#2196F3',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>
                            Verified
                          </span>
                        )}
                        {!user.is_premium && !user.is_verified && (
                          <span style={{
                            background: 'rgba(136, 136, 136, 0.2)',
                            color: '#888',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                          }}>
                            Free
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
                      {formatTime(user.last_seen)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
                      {user.city || user.country || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedUser(user)}
                        style={{
                          background: '#333',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px',
            }}>
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                style={{
                  background: '#222',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: pagination.page <= 1 ? '#555' : '#fff',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ padding: '8px 16px', color: '#888' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                style={{
                  background: '#222',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: pagination.page >= pagination.totalPages ? '#555' : '#fff',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* User Management Modal */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setSelectedUser(null)}
        >
          <div
            style={{
              background: '#151515',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: selectedUser.photo_url
                  ? `url(${selectedUser.photo_url}) center/cover`
                  : '#333',
              }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>
                  {selectedUser.display_name || 'No name'}
                </h2>
                <div style={{ color: '#888', fontSize: '14px' }}>{selectedUser.email}</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>User ID</div>
              <div style={{
                background: '#1a1a1a',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}>
                {selectedUser.id}
              </div>
            </div>

            <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {canEditUsers && (
                <>
                  {!selectedUser.is_verified ? (
                    <button
                      onClick={() => performAction(selectedUser.id, 'verify')}
                      disabled={actionLoading}
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#2196F3',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      ✓ Verify User
                    </button>
                  ) : (
                    <button
                      onClick={() => performAction(selectedUser.id, 'unverify')}
                      disabled={actionLoading}
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#888',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      Remove Verification
                    </button>
                  )}

                  {!selectedUser.is_premium ? (
                    <button
                      onClick={() => performAction(selectedUser.id, 'grant_premium', { months: 1 })}
                      disabled={actionLoading}
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#FFD700',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      💎 Grant Premium (1 month)
                    </button>
                  ) : (
                    <button
                      onClick={() => performAction(selectedUser.id, 'revoke_premium')}
                      disabled={actionLoading}
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#888',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      Revoke Premium
                    </button>
                  )}
                </>
              )}

              {canBanUsers && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to ban this user?')) {
                      performAction(selectedUser.id, 'ban');
                    }
                  }}
                  disabled={actionLoading}
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#FF9500',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  🚫 Ban User
                </button>
              )}

              {canDeleteUsers && (
                <button
                  onClick={() => {
                    if (confirm('⚠️ PERMANENT: Are you sure you want to DELETE this user? This cannot be undone!')) {
                      performAction(selectedUser.id, 'delete');
                    }
                  }}
                  disabled={actionLoading}
                  style={{
                    background: 'rgba(255, 59, 48, 0.1)',
                    border: '1px solid rgba(255, 59, 48, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#FF3B30',
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginTop: '8px',
                  }}
                >
                  🗑️ Delete User (Founder Only)
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              style={{
                width: '100%',
                background: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                marginTop: '24px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

interface PaymentStats {
  totalPremium: number;
  activePremium: number;
  expiredPremium: number;
  expiringSoon: number;
}

interface PremiumUser {
  id: string;
  display_name: string | null;
  email: string | null;
  photo_url: string | null;
  is_premium: boolean;
  premium_until: string | null;
  created_at: string;
  last_seen: string | null;
}

export default function AdminPaymentsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [users, setUsers] = useState<PremiumUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/payments?filter=${filter}&page=${page}&limit=25`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch payments');

      setStats(data.stats);
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filter, page]);

  const formatTime = (dateString: string) => new Date(dateString).toLocaleString();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPremiumStatus = (premiumUntil: string | null): { label: string; color: string; bg: string } => {
    if (!premiumUntil) return { label: 'No Expiry', color: '#888', bg: 'rgba(136,136,136,0.2)' };

    const expiryDate = new Date(premiumUntil);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { label: 'Expired', color: '#F44336', bg: 'rgba(244,67,54,0.2)' };
    if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: '#FF9800', bg: 'rgba(255,152,0,0.2)' };
    return { label: 'Active', color: '#4CAF50', bg: 'rgba(76,175,80,0.2)' };
  };

  const StatCard = ({
    title,
    value,
    icon,
    color = '#FF6B35',
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: string;
    color?: string;
    subtitle?: string;
  }) => (
    <div style={{
      background: '#151515',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #222',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color }}>{value}</div>
          {subtitle && (
            <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>{subtitle}</div>
          )}
        </div>
        <span style={{ fontSize: '28px' }}>{icon}</span>
      </div>
    </div>
  );

  const filterButtons: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All Premium' },
    { key: 'active', label: 'Active' },
    { key: 'expiring', label: 'Expiring Soon' },
    { key: 'expired', label: 'Expired' },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Payments & Subscriptions</h1>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <StatCard
            title="Total Premium"
            value={stats.totalPremium}
            icon="💎"
            color="#FFD700"
          />
          <StatCard
            title="Active"
            value={stats.activePremium}
            icon="✨"
            color="#4CAF50"
          />
          <StatCard
            title="Expiring Soon"
            value={stats.expiringSoon}
            icon="⏳"
            color="#FF9800"
            subtitle="Within 7 days"
          />
          <StatCard
            title="Expired"
            value={stats.expiredPremium}
            icon="⏰"
            color="#F44336"
            subtitle="Needs renewal"
          />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {filterButtons.map(fb => (
          <button
            key={fb.key}
            onClick={() => { setFilter(fb.key); setPage(1); }}
            style={{
              padding: '8px 16px',
              background: filter === fb.key ? '#FF6B35' : '#222',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {fb.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading payments...</div>
      ) : error ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#FF3B30',
          background: 'rgba(255, 59, 48, 0.1)',
          borderRadius: '12px',
        }}>
          {error}
          <button
            onClick={fetchPayments}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#FF6B35',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              display: 'block',
              margin: '16px auto 0',
            }}
          >
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: '#666',
          background: '#151515',
          borderRadius: '16px',
          border: '1px solid #222',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💎</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            No premium users found
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            No users match the current filter
          </div>
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
                <tr style={{ borderBottom: '1px solid #222' }}>
                  {['User', 'Email', 'Premium Until', 'Status', 'Last Seen', 'Actions'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const status = getPremiumStatus(user.premium_until);
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #1a1a1a',
                      }}
                    >
                      {/* User */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#222',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}>
                            {user.photo_url && (
                              <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>
                            {user.display_name || 'No Name'}
                          </span>
                        </div>
                      </td>
                      {/* Email */}
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
                        {user.email || '—'}
                      </td>
                      {/* Premium Until */}
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#ccc' }}>
                        {formatDate(user.premium_until)}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: status.bg,
                          color: status.color,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}>
                          {status.label}
                        </span>
                      </td>
                      {/* Last Seen */}
                      <td style={{ padding: '12px 16px', fontSize: '12px', color: '#666' }}>
                        {user.last_seen ? formatDate(user.last_seen) : 'Never'}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        <a
                          href={`/admin/users?search=${encodeURIComponent(user.email || user.display_name || '')}`}
                          style={{
                            color: '#FF6B35',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                        >
                          Manage
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px',
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  background: page === 1 ? '#1a1a1a' : '#222',
                  border: 'none',
                  borderRadius: '8px',
                  color: page === 1 ? '#444' : '#fff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '13px', color: '#888' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  background: page === totalPages ? '#1a1a1a' : '#222',
                  border: 'none',
                  borderRadius: '8px',
                  color: page === totalPages ? '#444' : '#fff',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

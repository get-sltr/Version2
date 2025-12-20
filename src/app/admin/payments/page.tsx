'use client';

import { useEffect, useState } from 'react';

interface PremiumUser {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  is_premium: boolean;
  premium_until: string | null;
  created_at: string;
}

interface StripeStats {
  balance: {
    available: number;
    pending: number;
    currency: string;
  };
  mrr: number;
  activeSubscriptions: number;
  recentCharges: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: string;
    customerEmail: string | null;
  }[];
}

interface PaymentData {
  premiumUsers: PremiumUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalPremiumUsers: number;
    activePremiumUsers: number;
  };
  stripe: StripeStats | null;
}

export default function AdminPaymentsPage() {
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/payments?page=${page}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payment data');
      }

      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (amount: number, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isPremiumActive = (premiumUntil: string | null) => {
    if (!premiumUntil) return false;
    return new Date(premiumUntil) > new Date();
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
        Loading payment data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#FF3B30',
        background: 'rgba(255, 59, 48, 0.1)',
        borderRadius: '12px',
      }}>
        {error}
        <button
          onClick={() => fetchPayments()}
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
    );
  }

  if (!data) return null;

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Payments & Revenue</h1>

      {/* Stripe Stats (if available) */}
      {data.stripe && (
        <>
          <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>
            Stripe Overview
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            <div style={{
              background: '#151515',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #222',
            }}>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Available Balance</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#4CAF50' }}>
                {formatCurrency(data.stripe.balance.available, data.stripe.balance.currency)}
              </div>
            </div>
            <div style={{
              background: '#151515',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #222',
            }}>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Pending Balance</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#FF9500' }}>
                {formatCurrency(data.stripe.balance.pending, data.stripe.balance.currency)}
              </div>
            </div>
            <div style={{
              background: '#151515',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #222',
            }}>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Monthly Recurring</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#FF6B35' }}>
                {formatCurrency(data.stripe.mrr)}
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>MRR</div>
            </div>
            <div style={{
              background: '#151515',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #222',
            }}>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Active Subscriptions</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#2196F3' }}>
                {data.stripe.activeSubscriptions}
              </div>
            </div>
          </div>

          {/* Recent Charges */}
          {data.stripe.recentCharges.length > 0 && (
            <>
              <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>
                Recent Charges
              </h2>
              <div style={{
                background: '#151515',
                borderRadius: '16px',
                border: '1px solid #222',
                overflow: 'hidden',
                marginBottom: '32px',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a1a1a' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888' }}>Date</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888' }}>Customer</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888' }}>Amount</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stripe.recentCharges.map((charge) => (
                      <tr key={charge.id} style={{ borderTop: '1px solid #222' }}>
                        <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                          {formatDate(charge.created)}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
                          {charge.customerEmail || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>
                          {formatCurrency(charge.amount, charge.currency)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: charge.status === 'succeeded'
                              ? 'rgba(76, 175, 80, 0.2)'
                              : 'rgba(255, 149, 0, 0.2)',
                            color: charge.status === 'succeeded' ? '#4CAF50' : '#FF9500',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>
                            {charge.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Premium Summary */}
      <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>
        Premium Users Summary
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{
          background: '#151515',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #222',
        }}>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Total Premium</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFD700' }}>
            {data.summary.totalPremiumUsers}
          </div>
        </div>
        <div style={{
          background: '#151515',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #222',
        }}>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Active Premium</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#4CAF50' }}>
            {data.summary.activePremiumUsers}
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>Not expired</div>
        </div>
      </div>

      {/* Premium Users List */}
      <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>
        Premium Users ({data.pagination.total})
      </h2>
      <div style={{
        background: '#151515',
        borderRadius: '16px',
        border: '1px solid #222',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888' }}>User</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888' }}>Joined</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888' }}>Premium Until</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.premiumUsers.map((user) => {
              const active = isPremiumActive(user.premium_until);
              return (
                <tr key={user.id} style={{ borderTop: '1px solid #222' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: user.photo_url
                          ? `url(${user.photo_url}) center/cover`
                          : '#333',
                      }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {user.display_name || 'No name'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
                    {formatDate(user.created_at)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>
                    {user.premium_until ? formatDate(user.premium_until) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: active
                        ? 'rgba(76, 175, 80, 0.2)'
                        : 'rgba(255, 59, 48, 0.2)',
                      color: active ? '#4CAF50' : '#FF3B30',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      {active ? 'Active' : 'Expired'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {data.premiumUsers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  No premium users yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
        }}>
          <button
            onClick={() => fetchPayments(data.pagination.page - 1)}
            disabled={data.pagination.page <= 1}
            style={{
              background: '#222',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              color: data.pagination.page <= 1 ? '#555' : '#fff',
              cursor: data.pagination.page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px', color: '#888' }}>
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => fetchPayments(data.pagination.page + 1)}
            disabled={data.pagination.page >= data.pagination.totalPages}
            style={{
              background: '#222',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              color: data.pagination.page >= data.pagination.totalPages ? '#555' : '#fff',
              cursor: data.pagination.page >= data.pagination.totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

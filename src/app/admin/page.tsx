'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  users: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    online: number;
    verified: number;
  };
  premium: {
    total: number;
    active: number;
    conversionRate: string;
  };
  content: {
    messages: number;
    groups: number;
    activeGroups: number;
  };
  signupsByDay: { date: string; count: number }[];
  generatedAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
        Loading dashboard...
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
          onClick={fetchStats}
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

  if (!stats) return null;

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = '#FF6B35',
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
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

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <div style={{ color: '#666', fontSize: '12px' }}>
          Last updated: {new Date(stats.generatedAt).toLocaleTimeString()}
        </div>
      </div>

      {/* User Stats */}
      <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>
        Users
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <StatCard
          title="Total Users"
          value={stats.users.total.toLocaleString()}
          icon="👥"
        />
        <StatCard
          title="Today's Signups"
          value={stats.users.today}
          icon="📈"
          color="#4CAF50"
        />
        <StatCard
          title="This Week"
          value={stats.users.thisWeek}
          icon="📅"
          color="#2196F3"
        />
        <StatCard
          title="This Month"
          value={stats.users.thisMonth}
          icon="📆"
          color="#9C27B0"
        />
        <StatCard
          title="Online Now"
          value={stats.users.online}
          subtitle="Active in last 15 min"
          icon="🟢"
          color="#4CAF50"
        />
        <StatCard
          title="Verified"
          value={stats.users.verified}
          icon="✓"
          color="#2196F3"
        />
      </div>

      {/* Premium Stats */}
      <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>
        Premium / Revenue
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <StatCard
          title="Premium Users"
          value={stats.premium.total}
          icon="💎"
          color="#FFD700"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.premium.active}
          subtitle="Not expired"
          icon="✨"
          color="#FF6B35"
        />
        <StatCard
          title="Conversion Rate"
          value={stats.premium.conversionRate}
          subtitle="Premium / Total users"
          icon="📊"
          color="#4CAF50"
        />
      </div>

      {/* Content Stats */}
      <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>
        Content
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <StatCard
          title="Total Messages"
          value={stats.content.messages.toLocaleString()}
          icon="💬"
          color="#2196F3"
        />
        <StatCard
          title="Total Groups"
          value={stats.content.groups}
          icon="👨‍👩‍👦‍👦"
          color="#9C27B0"
        />
        <StatCard
          title="Active Groups"
          value={stats.content.activeGroups}
          icon="🔥"
          color="#FF6B35"
        />
      </div>

      {/* Signups Chart */}
      <h2 style={{ fontSize: '16px', color: '#888', marginBottom: '16px', fontWeight: 600 }}>
        Signups - Last 7 Days
      </h2>
      <div style={{
        background: '#151515',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #222',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          height: '200px',
        }}>
          {stats.signupsByDay.map((day, i) => {
            const maxCount = Math.max(...stats.signupsByDay.map(d => d.count), 1);
            const height = (day.count / maxCount) * 150;
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  {day.count}
                </div>
                <div style={{
                  width: '100%',
                  maxWidth: '60px',
                  height: `${Math.max(height, 4)}px`,
                  background: i === stats.signupsByDay.length - 1
                    ? 'linear-gradient(180deg, #FF6B35 0%, #ff8c5a 100%)'
                    : 'linear-gradient(180deg, #333 0%, #222 100%)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s',
                }} />
                <div style={{ color: '#666', fontSize: '11px' }}>{dayName}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '16px', color: '#888', marginTop: '32px', marginBottom: '16px', fontWeight: 600 }}>
        Quick Actions
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {[
          { label: 'View All Users', href: '/admin/users', icon: '👥' },
          { label: 'Cruising Reports', href: '/admin/reports', icon: '🚩' },
          { label: 'View Payments', href: '/admin/payments', icon: '💰' },
          { label: 'View Errors', href: '/admin/errors', icon: '🐛' },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '16px',
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#222';
              e.currentTarget.style.borderColor = '#FF6B35';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a1a1a';
              e.currentTarget.style.borderColor = '#333';
            }}
          >
            <span style={{ fontSize: '24px' }}>{action.icon}</span>
            <span style={{ fontWeight: 500 }}>{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

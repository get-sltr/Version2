'use client';

import { useState, useEffect } from 'react';

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);

  useEffect(() => {
    // Load blocked users from localStorage
    const saved = localStorage.getItem('blockedUsers');
    if (saved) {
      setBlockedUsers(JSON.parse(saved));
    }
  }, []);

  const unblockUser = (userId: number) => {
    const updated = blockedUsers.filter(user => user.id !== userId);
    setBlockedUsers(updated);
    localStorage.setItem('blockedUsers', JSON.stringify(updated));
  };

  const unblockAll = () => {
    if (confirm(`Are you sure you want to unblock all ${blockedUsers.length} ${blockedUsers.length === 1 ? 'user' : 'users'}?`)) {
      setBlockedUsers([]);
      localStorage.setItem('blockedUsers', JSON.stringify([]));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Blocked Users</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        {blockedUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.3 }}>🚫</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>No Blocked Users</h3>
            <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
              When you block someone, they won't be able to see your profile or send you messages.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: 1.5 }}>
                {blockedUsers.length} {blockedUsers.length === 1 ? 'person' : 'people'} blocked
              </p>
              <button
                onClick={unblockAll}
                style={{ background: '#ff3b30', border: 'none', borderRadius: '8px', padding: '10px 16px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Unblock All
              </button>
            </div>
            
            {blockedUsers.map(user => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid #1c1c1e' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#333', backgroundImage: `url(${user.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{user.name}</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>Blocked on {user.blockedDate}</div>
                </div>
                <button
                  onClick={() => unblockUser(user.id)}
                  style={{ background: '#1c1c1e', border: '1px solid #333', borderRadius: '8px', padding: '10px 16px', color: '#FF6B35', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Unblock
                </button>
              </div>
            ))}
          </>
        )}

        <div style={{ background: '#1c1c1e', borderRadius: '8px', padding: '15px', marginTop: '30px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>About Blocking</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#888', lineHeight: 1.8 }}>
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isAdmin, getAdminRole, formatRole, getRoleBadgeColor, isFounder, FOUNDER_EMAIL } from '@/lib/admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.email) {
          router.push('/login?redirect=/admin');
          return;
        }

        if (!isAdmin(user.email)) {
          router.push('/dashboard');
          return;
        }

        setUserEmail(user.email);
        const adminRole = getAdminRole(user.email);
        setRole(adminRole ? formatRole(adminRole) : null);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}>
        <div>Loading admin panel...</div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/payments', label: 'Payments', icon: '💰' },
    { href: '/admin/errors', label: 'Errors', icon: '🐛' },
  ];

  const roleColor = role ? getRoleBadgeColor(role.toLowerCase() as any) : '#888';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Top Bar */}
      <div style={{
        background: '#111',
        borderBottom: '1px solid #222',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Back to App
          </button>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#FF6B35',
            margin: 0,
          }}>
            SLTR Admin
          </h1>
          {isFounder(userEmail) && (
            <span style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Founder
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>{userEmail}</span>
          {role && (
            <span style={{
              background: roleColor,
              color: role.toLowerCase() === 'founder' ? '#000' : '#fff',
              padding: '4px 10px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              {role}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <nav style={{
          width: '200px',
          background: '#111',
          borderRight: '1px solid #222',
          minHeight: 'calc(100vh - 53px)',
          padding: '16px 0',
          position: 'sticky',
          top: '53px',
          height: 'calc(100vh - 53px)',
        }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #FF6B35' : '3px solid transparent',
                  color: isActive ? '#FF6B35' : '#888',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '24px',
          maxWidth: 'calc(100% - 200px)',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

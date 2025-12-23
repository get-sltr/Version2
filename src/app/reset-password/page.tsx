'use client';

import { useState, useEffect, useId } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const passwordId = useId();
  const confirmPasswordId = useId();
  const errorId = useId();

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // No valid session, redirect to login
        router.push('/login?error=invalid_reset_link');
      }
    };
    checkSession();
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=password_reset_success');
        }, 3000);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px',
    color: '#333',
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '30px', borderBottom: '1px solid #eee' }}>
          <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
        </header>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 30px' }}>
          <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '30px' }}>✓</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, marginBottom: '20px' }}>Password Reset!</h1>
            <p style={{ fontSize: '16px', lineHeight: 1.7, opacity: 0.7, marginBottom: '30px' }}>Your password has been successfully reset. Redirecting you to login...</p>
            <a href="/login" style={{ display: 'inline-block', padding: '16px 40px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', background: '#000', color: '#fff', textDecoration: 'none' }}>Go to Login</a>
          </div>
        </main>
        <footer style={{ padding: '20px 30px', borderTop: '1px solid #eee', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', opacity: 0.3 }}>© 2025 SLTR Digital LLC</p>
        </footer>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
      </header>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 30px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, marginBottom: '10px', textAlign: 'center' }}>Create New Password</h1>
          <p style={{ fontSize: '13px', opacity: 0.5, textAlign: 'center', marginBottom: '40px' }}>Enter your new password below</p>

          {error && (
            <div
              role="alert"
              id={errorId}
              style={{ background: '#ffebee', color: '#c62828', padding: '15px', marginBottom: '20px', fontSize: '14px', borderLeft: '3px solid #c62828' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} aria-describedby={error ? errorId : undefined}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor={passwordId} style={labelStyle}>
                New Password
              </label>
              <input
                id={passwordId}
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                aria-required="true"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#000';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor={confirmPasswordId} style={labelStyle}>
                Confirm Password
              </label>
              <input
                id={confirmPasswordId}
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                aria-required="true"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#000';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                outline: 'none',
                transition: 'box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <a href="/login" style={{ fontSize: '13px', color: '#000', opacity: 0.6, textDecoration: 'none' }}>← Back to Login</a>
          </div>
        </div>
      </main>
      <footer style={{ padding: '20px 30px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', opacity: 0.3 }}>© 2025 SLTR Digital LLC</p>
      </footer>
    </div>
  );
}

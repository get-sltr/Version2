'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Redirect to dashboard on success
      window.location.href = '/dashboard';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      setError(errorMessage);
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

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
        <a href="/signup" style={{ fontSize: '13px', color: '#000', textDecoration: 'none', fontWeight: 600 }}>Sign up</a>
      </header>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 30px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, marginBottom: '10px', textAlign: 'center' }}>Welcome Back</h1>
          <p style={{ fontSize: '13px', opacity: 0.5, textAlign: 'center', marginBottom: '40px' }}>Log in to continue</p>

          {error && (
            <div
              role="alert"
              id={errorId}
              style={{ background: '#ffebee', color: '#c62828', padding: '15px', marginBottom: '20px', fontSize: '14px', borderLeft: '3px solid #c62828' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor={emailId} style={labelStyle}>
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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

            <div style={{ marginBottom: '8px' }}>
              <label htmlFor={passwordId} style={labelStyle}>
                Password
              </label>
              <input
                id={passwordId}
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <a
                href="/forgot-password"
                style={{ fontSize: '13px', color: '#000', textDecoration: 'underline', opacity: 0.7 }}
              >
                Forgot password?
              </a>
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
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>
      </main>
      <footer style={{ padding: '20px 30px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <a href="/about" style={{ fontSize: '12px', color: '#000', textDecoration: 'none', opacity: 0.5 }}>About SLTR</a>
        <p style={{ fontSize: '10px', opacity: 0.3, marginTop: '10px' }}>© 2025 SLTR Digital LLC</p>
      </footer>
    </div>
  );
}

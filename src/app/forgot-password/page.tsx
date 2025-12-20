'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${globalThis.location.origin}/auth/callback`,
      });

      if (resetError) {
        throw resetError;
      }

      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '30px', borderBottom: '1px solid #eee' }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</a>
      </header>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 30px' }}>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          {sent ? (
            <>
              <div style={{ fontSize: '64px', marginBottom: '30px' }}>✉️</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, marginBottom: '20px' }}>Check Your Email</h1>
              <p style={{ fontSize: '16px', lineHeight: 1.7, opacity: 0.7, marginBottom: '30px' }}>We sent a password reset link to <strong>{email}</strong></p>
              <div style={{ background: '#f9f9f9', padding: '25px', marginBottom: '30px', borderLeft: '3px solid #000', textAlign: 'left' }}>
                <p style={{ fontSize: '14px', margin: 0 }}><strong>Dont see it?</strong> Check your spam folder.</p>
              </div>
              <a href="/login" style={{ display: 'inline-block', padding: '16px 40px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', background: '#000', color: '#fff', textDecoration: 'none' }}>Back to Login</a>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: 300, marginBottom: '10px' }}>Reset Password</h1>
              <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '40px' }}>Enter your email and we will send you a reset link</p>
              {error && (
                <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', marginBottom: '16px', fontSize: '13px', borderLeft: '3px solid #c62828', textAlign: 'left' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '16px 20px', fontSize: '15px', border: '1px solid #ddd', marginBottom: '20px', boxSizing: 'border-box' }} />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '3px', background: '#000', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <a href="/login" style={{ display: 'inline-block', marginTop: '30px', fontSize: '13px', color: '#000', opacity: 0.6 }}>← Back to Login</a>
            </>
          )}
        </div>
      </main>
      <footer style={{ padding: '20px 30px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', opacity: 0.3 }}>© 2025 SLTR Digital LLC</p>
      </footer>
    </div>
  );
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paramEmail = searchParams.get('email');
    if (paramEmail) {
      setEmail(paramEmail);
      try {
        localStorage.setItem('lastSignupEmail', paramEmail);
      } catch {
        // ignore storage failures
      }
      return;
    }
    try {
      const cached = localStorage.getItem('lastSignupEmail');
      if (cached) setEmail(cached);
    } catch {
      // ignore
    }
  }, [searchParams]);

  const handleResend = async () => {
    setMessage(null);
    setError(null);

    if (!email) {
      setError('Enter your email address so we know where to send it.');
      return;
    }

    setSending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      if (resendError) throw resendError;
      setMessage('Verification email sent. Give it a minute and check spam just in case.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#000", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "30px", borderBottom: "1px solid #eee" }}>
        <a href="/" style={{ fontFamily: "'Audiowide', sans-serif", fontSize: "28px", fontWeight: 700, letterSpacing: "0.1em", textDecoration: "none", color: "#000" }}>PRIMAL</a>
      </header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 30px", textAlign: "center" }}>
        <div style={{ maxWidth: "500px", width: "100%" }}>
          <div style={{ fontSize: "64px", marginBottom: "30px" }}>✉️</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "42px", fontWeight: 300, marginBottom: "20px" }}>Check Your Email</h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, opacity: 0.7, marginBottom: "30px" }}>
            We sent a verification link to <strong>{email || 'your email'}</strong>. Click the link to verify your account.
          </p>
          <div style={{ background: "#f9f9f9", padding: "25px", marginBottom: "30px", borderLeft: "3px solid #000" }}>
            <p style={{ fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              <strong>Don't see it?</strong> Check spam or junk folders, and wait at least a minute before resending.
            </p>
          </div>
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label htmlFor="verify-email-input" style={{ fontSize: "12px", opacity: 0.6, display: "block", marginBottom: "5px" }}>
              Email address
            </label>
            <input
              id="verify-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{ width: "100%", padding: "14px 16px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
            />
          </div>
          {message && (
            <div style={{ background: "#e8f5e9", color: "#2e7d32", padding: "12px", marginBottom: "20px", borderLeft: "3px solid #2e7d32", fontSize: "14px" }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{ background: "#ffebee", color: "#c62828", padding: "12px", marginBottom: "20px", borderLeft: "3px solid #c62828", fontSize: "14px" }}>
              {error}
            </div>
          )}
          <p style={{ fontSize: "14px", opacity: 0.5, marginBottom: "30px" }}>The verification link expires in 24 hours.</p>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleResend}
              disabled={sending}
              style={{ padding: "16px 40px", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", background: "#000", color: "#fff", border: "none", cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.6 : 1 }}
            >
              {sending ? 'Sending…' : 'Resend Email'}
            </button>
            <a href="/login" style={{ padding: "16px 40px", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", background: "#fff", color: "#000", border: "1px solid #000", textDecoration: "none" }}>Back to Login</a>
          </div>
        </div>
      </main>
      <footer style={{ padding: "20px 30px", borderTop: "1px solid #eee", textAlign: "center" }}>
        <p style={{ fontSize: "10px", opacity: 0.3 }}>© 2025 Primal</p>
      </footer>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}

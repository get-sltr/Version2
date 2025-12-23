'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

function ReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportedUser = searchParams.get('user') || 'User';
  
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { id: 'fake', label: 'Fake Profile or Impersonation', icon: '🎭' },
    { id: 'harassment', label: 'Harassment or Bullying', icon: '😡' },
    { id: 'spam', label: 'Spam or Scam', icon: '📧' },
    { id: 'hate', label: 'Hate Speech', icon: '⚠️' },
    { id: 'minor', label: 'Underage User', icon: '🔞' },
    { id: 'violence', label: 'Threats or Violence', icon: '🚨' },
    { id: 'sexual', label: 'Inappropriate Sexual Content', icon: '🚫' },
    { id: 'drugs', label: 'Drug Sales', icon: '💊' },
    { id: 'stolen', label: 'Stolen Photos', icon: '📸' },
    { id: 'other', label: 'Other', icon: '❓' }
  ];

  const toggleReason = (id: string) => {
    if (selectedReasons.includes(id)) {
      setSelectedReasons(selectedReasons.filter(r => r !== id));
    } else {
      setSelectedReasons([...selectedReasons, id]);
    }
  };

  const handleSubmit = () => {
    if (selectedReasons.length === 0) {
      alert('Please select at least one reason');
      return;
    }

    // Capture user_reported event in PostHog
    posthog.capture('user_reported', {
      reported_user: reportedUser,
      reasons: selectedReasons,
      has_additional_info: !!additionalInfo.trim(),
    });

    // In production, send report to backend
    setSubmitted(true);

    setTimeout(() => {
      router.back();
    }, 2000);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Report Submitted</h2>
          <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.6 }}>
            Thank you for helping keep SLTR safe. We'll review this report and take appropriate action.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{
        padding: '15px 20px',
        borderBottom: '1px solid #1c1c1e',
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '16px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          Cancel
        </button>
        <h1 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>Report User</h1>
        <button
          onClick={handleSubmit}
          disabled={selectedReasons.length === 0}
          style={{
            background: 'none',
            border: 'none',
            color: selectedReasons.length > 0 ? '#FF6B35' : '#333',
            fontSize: '16px',
            fontWeight: 600,
            cursor: selectedReasons.length > 0 ? 'pointer' : 'not-allowed',
            padding: 0
          }}
        >
          Submit
        </button>
      </header>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Warning Banner */}
        <div style={{
          background: 'rgba(255,59,48,0.15)',
          border: '1px solid rgba(255,59,48,0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '15px', lineHeight: 1.6 }}>
            <strong>Reporting {reportedUser}</strong>
            <br />
            False reports may result in your account being suspended. Only report genuine violations of our Community Guidelines.
          </div>
        </div>

        {/* Reasons */}
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#888', marginBottom: '15px', letterSpacing: '0.5px' }}>
          SELECT REASON(S)
        </h3>

        <div style={{ marginBottom: '30px' }}>
          {reasons.map(reason => (
            <button
              key={reason.id}
              onClick={() => toggleReason(reason.id)}
              style={{
                width: '100%',
                background: selectedReasons.includes(reason.id) 
                  ? 'rgba(255,107,53,0.15)' 
                  : 'rgba(255,255,255,0.05)',
                border: selectedReasons.includes(reason.id)
                  ? '2px solid #FF6B35'
                  : '2px solid transparent',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                color: '#fff',
                fontSize: '15px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '24px' }}>{reason.icon}</span>
              <span style={{ flex: 1 }}>{reason.label}</span>
              {selectedReasons.includes(reason.id) && (
                <span style={{ color: '#FF6B35', fontSize: '20px' }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Additional Info */}
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#888', marginBottom: '15px', letterSpacing: '0.5px' }}>
          ADDITIONAL DETAILS (OPTIONAL)
        </h3>

        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Provide any additional context that might help us investigate..."
          style={{
            width: '100%',
            minHeight: '120px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #1c1c1e',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '15px',
            fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
            outline: 'none',
            resize: 'vertical'
          }}
        />

        {/* Info */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '30px',
          fontSize: '13px',
          color: '#888',
          lineHeight: 1.6
        }}>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>What happens next?</strong>
          • Our safety team will review your report within 24 hours
          <br />
          • We may contact you for additional information
          <br />
          • The reported user won't know who reported them
          <br />
          • You can block this user to prevent further contact
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportPageContent />
    </Suspense>
  );
}

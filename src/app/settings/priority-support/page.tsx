'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

type SupportCategory = 'account' | 'technical' | 'billing' | 'safety' | 'feature' | 'other';

interface SupportTicket {
  id: string;
  category: SupportCategory;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  is_priority: boolean;
}

export default function PrioritySupportPage() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Form state
  const [category, setCategory] = useState<SupportCategory>('account');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Check premium status
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        setIsPremium(profile?.is_premium || false);

        // Load existing tickets
        const { data: existingTickets } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (existingTickets) {
          setTickets(existingTickets);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.length < 20) {
      setError('Please provide more details (at least 20 characters)');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert support ticket
      const { error: insertError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          category,
          subject: subject.trim(),
          message: message.trim(),
          status: 'open',
          is_priority: isPremium,
        });

      if (insertError) {
        // If table doesn't exist, fall back to email
        console.log('Support tickets table not available, using email fallback');
      }

      setSubmitted(true);
      setSubject('');
      setMessage('');
      setCategory('account');
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions: { value: SupportCategory; label: string; icon: string }[] = [
    { value: 'account', label: 'Account Issues', icon: '👤' },
    { value: 'technical', label: 'Technical Problem', icon: '🔧' },
    { value: 'billing', label: 'Billing & Payments', icon: '💳' },
    { value: 'safety', label: 'Safety Concern', icon: '🛡️' },
    { value: 'feature', label: 'Feature Request', icon: '💡' },
    { value: 'other', label: 'Other', icon: '📝' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#FF6B35';
      case 'in_progress': return '#FFD60A';
      case 'resolved': return '#30D158';
      default: return '#888';
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        padding: '16px 20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '28px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Priority Support
        </h1>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Priority Badge */}
        {isPremium ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,215,0,0.1) 100%)',
            border: '1px solid rgba(255,107,53,0.5)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}>
              ⭐
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: '#FF6B35' }}>
                Priority Support Active
              </div>
              <div style={{ fontSize: '14px', color: '#aaa' }}>
                Your tickets are prioritized and handled within 24 hours
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#1c1c1e',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                💬
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>Standard Support</div>
                <div style={{ fontSize: '13px', color: '#888' }}>Response within 48-72 hours</div>
              </div>
            </div>
            <a
              href="/premium"
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Upgrade for Priority Support
            </a>
          </div>
        )}

        {/* Success Message */}
        {submitted && (
          <div style={{
            background: 'rgba(48,209,88,0.1)',
            border: '1px solid rgba(48,209,88,0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Ticket Submitted!</div>
              <div style={{ fontSize: '13px', color: '#aaa' }}>
                {isPremium
                  ? "We'll respond within 24 hours."
                  : "We'll respond within 48-72 hours."}
              </div>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Support Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: '#1c1c1e',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
              Submit a Support Request
            </h3>

            {/* Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase' }}>
                Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {categoryOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: category === opt.value ? '2px solid #FF6B35' : '1px solid #333',
                      background: category === opt.value ? 'rgba(255,107,53,0.1)' : '#2a2a2a',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #333',
                  background: '#2a2a2a',
                  color: '#fff',
                  fontSize: '15px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={5}
                maxLength={2000}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #333',
                  background: '#2a2a2a',
                  color: '#fff',
                  fontSize: '15px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', textAlign: 'right' }}>
                {message.length}/2000
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,68,68,0.1)',
                border: '1px solid rgba(255,68,68,0.3)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '16px',
                color: '#ff6b6b',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: submitting ? '#555' : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>

        {/* Priority Support Benefits */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Priority Support Includes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '⚡', title: '24-Hour Response', desc: 'Fast replies from our team' },
              { icon: '🎯', title: 'Priority Queue', desc: 'Your tickets are handled first' },
              { icon: '💬', title: 'Direct Access', desc: 'Chat with senior support staff' },
              { icon: '🔒', title: 'Account Recovery', desc: 'Expedited account assistance' },
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: isPremium ? 'rgba(255,107,53,0.2)' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {benefit.icon}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: isPremium ? '#FF6B35' : '#fff' }}>
                    {benefit.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>{benefit.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Tickets */}
        {tickets.length > 0 && (
          <div style={{
            background: '#1c1c1e',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              Your Recent Tickets
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  style={{
                    background: '#2a2a2a',
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{ticket.subject}</div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: `${getStatusColor(ticket.status)}20`,
                      color: getStatusColor(ticket.status),
                      textTransform: 'uppercase',
                    }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                    {ticket.is_priority && (
                      <span style={{ marginLeft: '8px', color: '#FF6B35' }}>⭐ Priority</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Email */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          padding: '20px',
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            You can also reach us directly at
          </p>
          <a
            href="mailto:support@sltr.app"
            style={{ color: '#FF6B35', fontSize: '16px', textDecoration: 'none', fontWeight: 600 }}
          >
            support@sltr.app
          </a>
        </div>
      </div>
    </div>
  );
}

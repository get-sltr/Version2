'use client';

import { useEffect, useState } from 'react';

interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedMessageId: string | null;
  reportedGroupId: string | null;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  resolutionNotes: string | null;
  reporter: {
    id: string;
    display_name: string | null;
    email: string | null;
    photo_url: string | null;
  } | null;
  reportedUser: {
    id: string;
    display_name: string | null;
    email: string | null;
    photo_url: string | null;
  } | null;
}

export default function AdminUserReportsPage() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [notesModal, setNotesModal] = useState<{ reportId: string; action: string } | null>(null);
  const [notesText, setNotesText] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/user-reports?status=${filter}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch reports');

      setReports(data.reports || []);
      setPendingCount(data.pendingCount || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleAction = async (reportId: string, action: string, notes?: string) => {
    setActionLoading(reportId);
    try {
      const response = await fetch('/api/admin/user-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action, notes }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      fetchReports();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update report');
    } finally {
      setActionLoading(null);
      setNotesModal(null);
      setNotesText('');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Ban this user? This will disable their account.')) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'ban' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      alert('User banned successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to ban user');
    }
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleString();

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      spam: '#9C27B0',
      harassment: '#E91E63',
      inappropriate_content: '#F44336',
      fake_profile: '#FF9800',
      underage: '#D32F2F',
      scam: '#795548',
      hate_speech: '#B71C1C',
      other: '#607D8B',
      // Also handle comma-separated reasons from report page
      fake: '#FF9800',
      violence: '#D32F2F',
      sexual: '#E91E63',
      drugs: '#795548',
      stolen: '#FF5722',
      minor: '#D32F2F',
      hate: '#B71C1C',
    };

    // Handle comma-separated reasons
    const reasons = reason.split(',');
    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {reasons.map((r, i) => (
          <span
            key={i}
            style={{
              background: colors[r.trim()] || '#607D8B',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {r.trim().replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'rgba(255, 152, 0, 0.2)', text: '#FF9800' },
      reviewed: { bg: 'rgba(33, 150, 243, 0.2)', text: '#2196F3' },
      resolved: { bg: 'rgba(76, 175, 80, 0.2)', text: '#4CAF50' },
      dismissed: { bg: 'rgba(158, 158, 158, 0.2)', text: '#9E9E9E' },
    };
    const color = colors[status] || colors.pending;
    return (
      <span style={{
        background: color.bg,
        color: color.text,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}>
        {status}
      </span>
    );
  };

  const UserBadge = ({ user, label }: { user: UserReport['reporter']; label: string }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#222',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {user?.photo_url && (
          <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <div>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
          {user?.display_name || 'Unknown'}
        </div>
        <div style={{ fontSize: '11px', color: '#555' }}>
          {user?.email || user?.id?.slice(0, 8) || ''}
        </div>
      </div>
    </div>
  );

  const filterButtons: { key: typeof filter; label: string }[] = [
    { key: 'pending', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>User Reports</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {filterButtons.map(fb => (
            <button
              key={fb.key}
              onClick={() => setFilter(fb.key)}
              style={{
                padding: '8px 16px',
                background: filter === fb.key ? '#FF6B35' : '#222',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {fb.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading reports...</div>
      ) : error ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#FF3B30',
          background: 'rgba(255, 59, 48, 0.1)',
          borderRadius: '12px',
        }}>
          {error}
          <button
            onClick={fetchReports}
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
      ) : reports.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: '#666',
          background: '#151515',
          borderRadius: '16px',
          border: '1px solid #222',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {filter === 'pending' ? '✅' : '🚨'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            {filter === 'pending' ? 'No pending reports' : 'No reports found'}
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            {filter === 'pending'
              ? 'All user reports have been reviewed'
              : `No ${filter} reports`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map(report => (
            <div
              key={report.id}
              style={{
                background: '#151515',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #222',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {getReasonBadge(report.reason)}
                  {getStatusBadge(report.status)}
                </div>
                <div style={{ color: '#666', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {formatTime(report.createdAt)}
                </div>
              </div>

              {/* Reporter & Reported */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '16px',
                alignItems: 'center',
                background: '#1a1a1a',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <UserBadge user={report.reporter} label="REPORTER" />
                <div style={{ color: '#444', fontSize: '20px' }}>→</div>
                <UserBadge user={report.reportedUser} label="REPORTED USER" />
              </div>

              {/* Description */}
              {report.description && (
                <div style={{
                  background: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  borderLeft: '3px solid #FF6B35',
                }}>
                  <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px', fontWeight: 600 }}>
                    DETAILS
                  </div>
                  <div style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.6 }}>
                    {report.description}
                  </div>
                </div>
              )}

              {/* Resolution Notes */}
              {report.resolutionNotes && (
                <div style={{
                  background: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  borderLeft: '3px solid #4CAF50',
                }}>
                  <div style={{ color: '#4CAF50', fontSize: '11px', marginBottom: '8px', fontWeight: 600 }}>
                    RESOLUTION NOTES
                  </div>
                  <div style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.6 }}>
                    {report.resolutionNotes}
                  </div>
                </div>
              )}

              {/* Actions */}
              {report.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {report.reportedUserId && (
                    <a
                      href={`/profile/${report.reportedUserId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 16px',
                        background: 'transparent',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#FF6B35',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      View Profile
                    </a>
                  )}
                  <button
                    onClick={() => handleAction(report.id, 'dismissed')}
                    disabled={actionLoading === report.id}
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      color: '#888',
                      cursor: actionLoading === report.id ? 'wait' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      setNotesModal({ reportId: report.id, action: 'resolved' });
                      setNotesText('');
                    }}
                    disabled={actionLoading === report.id}
                    style={{
                      padding: '10px 20px',
                      background: '#4CAF50',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: actionLoading === report.id ? 'wait' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Resolve
                  </button>
                  {report.reportedUserId && (
                    <button
                      onClick={() => handleBanUser(report.reportedUserId)}
                      disabled={actionLoading === report.id}
                      style={{
                        padding: '10px 20px',
                        background: '#F44336',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: actionLoading === report.id ? 'wait' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      Ban User
                    </button>
                  )}
                </div>
              )}

              {report.reviewedAt && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#666',
                }}>
                  Reviewed on {formatTime(report.reviewedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes Modal */}
      {notesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #333',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', margin: '0 0 16px 0' }}>
              Resolution Notes
            </h3>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Add notes about how this was resolved..."
              style={{
                width: '100%',
                minHeight: '100px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => { setNotesModal(null); setNotesText(''); }}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(notesModal.reportId, notesModal.action, notesText)}
                style={{
                  padding: '10px 20px',
                  background: '#4CAF50',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Save & Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

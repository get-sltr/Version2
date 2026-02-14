'use client';

import { useEffect, useState } from 'react';

interface PhotoLog {
  id: string;
  userId: string;
  photoPath: string;
  scanPassed: boolean;
  modelAvailable: boolean;
  scores: Record<string, number> | null;
  failedCategory: string | null;
  requiresManualReview: boolean;
  reviewDecision: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  user: {
    id: string;
    display_name: string | null;
    email: string | null;
    photo_url: string | null;
  } | null;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<PhotoLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLog | null>(null);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/photos?filter=${filter}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch photos');

      setPhotos(data.photos || []);
      setPendingCount(data.pendingCount || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [filter]);

  const handleApprove = async (logId: string) => {
    setActionLoading(logId);
    try {
      const response = await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, decision: 'approved' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      fetchPhotos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve photo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (photo: PhotoLog) => {
    setActionLoading(photo.id);
    try {
      // First reject via the photo reject endpoint (removes from profile + stores hash)
      const rejectRes = await fetch('/api/admin/photos/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: photo.userId,
          photoUrl: photo.photoPath,
          photoPath: photo.photoPath,
          reason: photo.failedCategory || 'nsfw',
          hash: photo.photoPath, // Use path as hash fallback if no real hash
        }),
      });

      if (!rejectRes.ok) {
        const data = await rejectRes.json();
        throw new Error(data.error || 'Failed to reject photo');
      }

      // Also update the moderation log
      await fetch('/api/admin/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: photo.id, decision: 'rejected' }),
      });

      fetchPhotos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject photo');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleString();

  const getScoreBar = (label: string, value: number) => {
    const isHigh = value > 0.5;
    const isDanger = value > 0.7;
    return (
      <div key={label} style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
          <span style={{ color: '#888' }}>{label}</span>
          <span style={{ color: isDanger ? '#F44336' : isHigh ? '#FF9800' : '#4CAF50', fontWeight: 600 }}>
            {(value * 100).toFixed(1)}%
          </span>
        </div>
        <div style={{ background: '#222', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${value * 100}%`,
            height: '100%',
            background: isDanger ? '#F44336' : isHigh ? '#FF9800' : '#4CAF50',
            borderRadius: '4px',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
    );
  };

  const filterButtons: { key: typeof filter; label: string }[] = [
    { key: 'pending', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Photo Moderation</h1>
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
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading photos...</div>
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
            onClick={fetchPhotos}
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
      ) : photos.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: '#666',
          background: '#151515',
          borderRadius: '16px',
          border: '1px solid #222',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {filter === 'pending' ? '✅' : '📸'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            {filter === 'pending' ? 'No photos need review' : 'No photos found'}
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            {filter === 'pending'
              ? 'All flagged photos have been reviewed'
              : `No ${filter} photos in the moderation log`}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {photos.map(photo => (
            <div
              key={photo.id}
              style={{
                background: '#151515',
                borderRadius: '16px',
                border: '1px solid #222',
                overflow: 'hidden',
              }}
            >
              {/* Photo Preview */}
              <div
                style={{
                  height: '200px',
                  background: '#0a0a0a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.photoPath ? (
                  <img
                    src={photo.photoPath.startsWith('http') ? photo.photoPath : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${photo.photoPath}`}
                    alt="Flagged photo"
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: filter === 'pending' ? 'blur(8px)' : 'none',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span style={{ color: '#444', fontSize: '14px' }}>No preview available</span>
                )}
                {photo.failedCategory && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#F44336',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>
                    {photo.failedCategory}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '16px' }}>
                {/* User info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#222',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    {photo.user?.photo_url && (
                      <img src={photo.user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {photo.user?.display_name || 'Unknown User'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {formatTime(photo.createdAt)}
                    </div>
                  </div>
                  {photo.reviewDecision && (
                    <span style={{
                      background: photo.reviewDecision === 'approved'
                        ? 'rgba(76, 175, 80, 0.2)'
                        : 'rgba(244, 67, 54, 0.2)',
                      color: photo.reviewDecision === 'approved' ? '#4CAF50' : '#F44336',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>
                      {photo.reviewDecision}
                    </span>
                  )}
                </div>

                {/* NSFW Scores */}
                {photo.scores && (
                  <div style={{
                    background: '#1a1a1a',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '12px',
                  }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>
                      NSFW SCORES
                    </div>
                    {Object.entries(photo.scores).map(([label, value]) =>
                      getScoreBar(label, value as number)
                    )}
                  </div>
                )}

                {/* Status info */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <span style={{
                    background: photo.scanPassed ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                    color: photo.scanPassed ? '#4CAF50' : '#FF9800',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>
                    {photo.scanPassed ? 'Scan Passed' : 'Scan Failed'}
                  </span>
                  {!photo.modelAvailable && (
                    <span style={{
                      background: 'rgba(156, 39, 176, 0.2)',
                      color: '#9C27B0',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}>
                      Model Unavailable
                    </span>
                  )}
                </div>

                {/* Actions */}
                {!photo.reviewDecision && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(photo.id)}
                      disabled={actionLoading === photo.id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#4CAF50',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: actionLoading === photo.id ? 'wait' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {actionLoading === photo.id ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Reject this photo? It will be removed from the user\'s profile.')) {
                          handleReject(photo);
                        }
                      }}
                      disabled={actionLoading === photo.id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#F44336',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: actionLoading === photo.id ? 'wait' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {actionLoading === photo.id ? '...' : '✕ Reject'}
                    </button>
                  </div>
                )}

                {photo.reviewedAt && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#555',
                  }}>
                    Reviewed {formatTime(photo.reviewedAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto.photoPath.startsWith('http')
              ? selectedPhoto.photoPath
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${selectedPhoto.photoPath}`}
            alt="Full preview"
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </div>
      )}
    </div>
  );
}

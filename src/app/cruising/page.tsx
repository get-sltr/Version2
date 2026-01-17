'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { usePremium } from '@/hooks/usePremium';
import {
  getCruisingUpdates,
  postCruisingUpdate,
  deleteCruisingUpdate,
  likeCruisingUpdate,
  unlikeCruisingUpdate,
  getMyLikedUpdateIds,
  addCruisingReply,
  getCruisingReplies,
  reportCruisingUpdate,
  type CruisingReportReason
} from '@/lib/api/cruisingUpdates';
import type { CruisingUpdateWithUser, CruisingReply } from '@/lib/api/cruisingUpdates';

export default function CruisingUpdatesPage() {
  const router = useRouter();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [sortBy, setSortBy] = useState<'time' | 'distance'>('time');
  const [updateText, setUpdateText] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [updates, setUpdates] = useState<CruisingUpdateWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, CruisingReply[]>>({});
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reportingUpdate, setReportingUpdate] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<CruisingReportReason>('offensive');

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Location denied')
      );
    }
  }, []);

  // Load updates
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      try {
        const [data, myLikes] = await Promise.all([
          getCruisingUpdates(userLocation?.lat, userLocation?.lng, sortBy),
          getMyLikedUpdateIds()
        ]);
        if (mounted) {
          setUpdates(data);
          setLikedIds(myLikes);
        }
      } catch (err) {
        console.error('Failed to load updates:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // Subscribe to new updates
    const channel = supabase
      .channel('cruising-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cruising_updates'
      }, () => {
        getCruisingUpdates(userLocation?.lat, userLocation?.lng, sortBy)
          .then(data => { if (mounted) setUpdates(data); });
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [sortBy, userLocation]);

  // Post update
  const handlePostUpdate = async () => {
    if (!updateText.trim() || posting) return;

    // Check premium status before posting
    if (!premiumLoading && !isPremium) {
      setShowPremiumPrompt(true);
      return;
    }

    setPosting(true);
    try {
      await postCruisingUpdate(updateText, isHosting, userLocation?.lat, userLocation?.lng);
      setUpdateText('');
      setIsHosting(false);
      // Refresh updates
      const data = await getCruisingUpdates(userLocation?.lat, userLocation?.lng, sortBy);
      setUpdates(data);
    } catch (err: any) {
      alert(err.message || 'Failed to post update');
    } finally {
      setPosting(false);
    }
  };

  // Delete update
  const handleDelete = async (updateId: string) => {
    if (!confirm('Delete this update?')) return;
    try {
      await deleteCruisingUpdate(updateId);
      setUpdates(prev => prev.filter(u => u.id !== updateId));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // Like/unlike update
  const handleLike = async (updateId: string) => {
    const isLiked = likedIds.has(updateId);
    try {
      if (isLiked) {
        await unlikeCruisingUpdate(updateId);
        setLikedIds(prev => { const next = new Set(prev); next.delete(updateId); return next; });
        setUpdates(prev => prev.map(u => u.id === updateId ? { ...u, like_count: Math.max(0, (u.like_count || 0) - 1) } : u));
      } else {
        await likeCruisingUpdate(updateId);
        setLikedIds(prev => new Set(prev).add(updateId));
        setUpdates(prev => prev.map(u => u.id === updateId ? { ...u, like_count: (u.like_count || 0) + 1 } : u));
      }
    } catch (err) {
      console.error('Failed to like/unlike:', err);
    }
  };

  // Toggle replies
  const handleToggleReplies = async (updateId: string) => {
    if (expandedReplies === updateId) {
      setExpandedReplies(null);
      return;
    }
    setExpandedReplies(updateId);
    if (!replies[updateId]) {
      try {
        const data = await getCruisingReplies(updateId);
        setReplies(prev => ({ ...prev, [updateId]: data }));
      } catch (err) {
        console.error('Failed to load replies:', err);
      }
    }
  };

  // Submit reply
  const handleSubmitReply = async (updateId: string) => {
    if (!replyText.trim()) return;
    try {
      const newReply = await addCruisingReply(updateId, replyText);
      setReplies(prev => ({
        ...prev,
        [updateId]: [...(prev[updateId] || []), { ...newReply, user: { display_name: null, photo_url: null } }]
      }));
      setUpdates(prev => prev.map(u => u.id === updateId ? { ...u, reply_count: (u.reply_count || 0) + 1 } : u));
      setReplyText('');
      setReplyingTo(null);
    } catch (err: any) {
      alert(err.message || 'Failed to post reply');
    }
  };

  // Report update
  const handleReport = async () => {
    if (!reportingUpdate) return;
    try {
      await reportCruisingUpdate(reportingUpdate, reportReason);
      alert('Report submitted. Thank you.');
      setReportingUpdate(null);
    } catch (err) {
      alert('Failed to submit report');
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Format distance
  const formatDistance = (miles?: number) => {
    if (!miles) return '';
    if (miles < 0.1) return 'nearby';
    return `${miles.toFixed(1)} mi`;
  };

  // Build user display info
  const getUserDisplay = (update: CruisingUpdateWithUser) => {
    const { user } = update;
    if (user.display_name) return user.display_name;

    // Build stats string from profile
    const parts: string[] = [];
    if (user.age) parts.push(String(user.age));
    if ((user as any).height) parts.push((user as any).height);
    if ((user as any).weight) parts.push(`${(user as any).weight}lb`);
    if ((user as any).body_type) parts.push((user as any).body_type);
    if (user.position) parts.push(user.position);

    return parts.length > 0 ? parts.join(', ') : 'Anonymous';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        padding: '12px 20px',
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
            color: '#FF6B35',
            fontSize: '28px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          ←
        </button>

        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, flex: 1, textAlign: 'center' }}>
          Cruising Updates
        </h1>

        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: 0,
            position: 'relative'
          }}
        >
          ☰
        </button>

        {/* Sort Menu */}
        {showSortMenu && (
          <>
            <div onClick={() => setShowSortMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998 }} />
            <div style={{
              position: 'absolute',
              top: '60px',
              right: '20px',
              background: '#1c1c1e',
              borderRadius: '12px',
              overflow: 'hidden',
              zIndex: 999,
              minWidth: '160px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              <button
                onClick={() => { setSortBy('time'); setShowSortMenu(false); }}
                style={{
                  width: '100%',
                  background: sortBy === 'time' ? 'rgba(255,107,53,0.2)' : 'transparent',
                  border: 'none',
                  padding: '14px 16px',
                  color: sortBy === 'time' ? '#FF6B35' : '#fff',
                  fontSize: '15px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: '1px solid #333'
                }}
              >
                Sort by Time
              </button>
              <button
                onClick={() => { setSortBy('distance'); setShowSortMenu(false); }}
                style={{
                  width: '100%',
                  background: sortBy === 'distance' ? 'rgba(255,107,53,0.2)' : 'transparent',
                  border: 'none',
                  padding: '14px 16px',
                  color: sortBy === 'distance' ? '#FF6B35' : '#fff',
                  fontSize: '15px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Sort by Distance
              </button>
            </div>
          </>
        )}
      </header>

      {/* Sort Indicator */}
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888' }}>
        <span>{updates.length} active updates</span>
        <span>Sort by: <span style={{ color: '#fff' }}>{sortBy === 'time' ? 'Time' : 'Distance'}</span></span>
      </div>

      {/* Updates Feed */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '160px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>
        ) : updates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No updates yet</div>
            <div style={{ fontSize: '14px' }}>Be the first to post!</div>
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #1c1c1e',
                display: 'flex',
                gap: '12px',
                position: 'relative'
              }}
            >
              {/* Profile Image - Click to view profile */}
              <Link href={`/profile/${update.user_id}`} style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundImage: `url(${update.user.photo_url || '/images/default-avatar.png'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: update.is_hosting ? '2px solid #FF6B35' : '2px solid #333'
                }} />
                {update.user.is_online && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#4CD964',
                    border: '2px solid #000'
                  }} />
                )}
              </Link>

              {/* Content - Click to message */}
              <div
                style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                onClick={() => {
                  if (update.user_id !== currentUserId) {
                    router.push(`/messages/${update.user_id}`);
                  }
                }}
              >
                {/* Time and distance row */}
                <div style={{ fontSize: '12px', color: '#FF6B35', marginBottom: '4px', fontStyle: 'italic' }}>
                  {formatTime(update.created_at)}
                  {update.distance !== undefined && `, ${formatDistance(update.distance)}`}
                </div>

                {/* User stats row */}
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>
                  {getUserDisplay(update)}
                </div>

                {/* Message content */}
                <div style={{
                  fontSize: '15px',
                  color: '#fff',
                  fontWeight: 500,
                  lineHeight: 1.4
                }}>
                  {update.text}
                </div>

                {/* Location/hosting indicator */}
                {update.is_hosting && (
                  <div style={{
                    fontSize: '13px',
                    color: '#FF6B35',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🏠 Hosting
                  </div>
                )}
              </div>

              {/* Action buttons - vertical on right */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {/* Location button */}
                {update.lat && update.lng && (
                  <button
                    onClick={() => window.open(`https://maps.google.com/?q=${update.lat},${update.lng}`, '_blank')}
                    style={{ background: 'none', border: 'none', color: '#666', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
                    title="View on map"
                  >
                    📍
                  </button>
                )}

                {/* Delete (own) or Report (others) */}
                {update.user_id === currentUserId ? (
                  <button
                    onClick={() => handleDelete(update.id)}
                    style={{ background: 'none', border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer', padding: '4px' }}
                    title="Delete"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={() => setReportingUpdate(update.id)}
                    style={{ background: 'none', border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer', padding: '4px' }}
                    title="Report"
                  >
                    ⚑
                  </button>
                )}
              </div>
            </div>

            {/* Interaction bar - like, reply, message */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '8px 20px 12px 88px',
              borderBottom: '1px solid #1c1c1e'
            }}>
              {/* Like button */}
              <button
                onClick={() => handleLike(update.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: likedIds.has(update.id) ? '#FF6B35' : '#666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                {likedIds.has(update.id) ? '❤️' : '🤍'} {update.like_count || 0}
              </button>

              {/* Reply button */}
              <button
                onClick={() => handleToggleReplies(update.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: expandedReplies === update.id ? '#FF6B35' : '#666',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                💬 {update.reply_count || 0}
              </button>

              {/* Message button (for others' posts) */}
              {update.user_id !== currentUserId && (
                <button
                  onClick={() => router.push(`/messages/${update.user_id}`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  ✉️ Message
                </button>
              )}
            </div>

            {/* Replies section (expanded) */}
            {expandedReplies === update.id && (
              <div style={{ padding: '12px 20px 12px 88px', background: 'rgba(255,255,255,0.02)' }}>
                {/* Existing replies */}
                {(replies[update.id] || []).map(reply => (
                  <div key={reply.id} style={{ marginBottom: '12px', fontSize: '14px' }}>
                    <span style={{ color: '#FF6B35', fontWeight: 500 }}>
                      {reply.user?.display_name || 'User'}
                    </span>
                    <span style={{ color: '#fff', marginLeft: '8px' }}>{reply.text}</span>
                    <span style={{ color: '#666', marginLeft: '8px', fontSize: '12px' }}>
                      {formatTime(reply.created_at)}
                    </span>
                  </div>
                ))}

                {/* Reply input */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    value={replyingTo === update.id ? replyText : ''}
                    onChange={(e) => { setReplyingTo(update.id); setReplyText(e.target.value); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(update.id)}
                    placeholder="Write a reply..."
                    maxLength={500}
                    style={{
                      flex: 1,
                      background: '#1c1c1e',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleSubmitReply(update.id)}
                    disabled={!replyText.trim() || replyingTo !== update.id}
                    style={{
                      background: replyText.trim() && replyingTo === update.id ? '#FF6B35' : '#333',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '10px 16px',
                      color: '#fff',
                      fontSize: '14px',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}
          </div>
          ))
        )}

        {/* Refresh Button - Liquid Glass Effect */}
        {!loading && (
          <div style={{
            position: 'sticky',
            bottom: '140px',
            display: 'flex',
            justifyContent: 'center',
            padding: '16px',
            pointerEvents: 'none'
          }}>
            <button
              onClick={async () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const data = await getCruisingUpdates(userLocation?.lat, userLocation?.lng, sortBy);
                setUpdates(data);
              }}
              style={{
                background: 'rgba(255,107,53,0.15)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,107,53,0.4)',
                borderRadius: '24px',
                padding: '10px 24px',
                color: '#FF6B35',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 24px rgba(255,107,53,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                pointerEvents: 'all',
                transition: 'all 0.3s ease'
              }}
            >
              ↻ Refresh Updates
            </button>
          </div>
        )}
      </div>

      {/* Post Input */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#000',
        borderTop: '1px solid #1c1c1e',
        padding: '12px 20px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}>
        {/* Hosting Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => setIsHosting(!isHosting)}
            style={{
              background: isHosting ? '#FF6B35' : '#1c1c1e',
              border: isHosting ? 'none' : '1px solid #333',
              borderRadius: '20px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🏠 {isHosting ? 'Hosting' : 'Not Hosting'}
          </button>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {userLocation ? '📍 Location enabled' : '📍 Enable location for distance'}
          </span>
        </div>

        {/* Input Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !posting && handlePostUpdate()}
            onFocus={() => {
              if (!premiumLoading && !isPremium) {
                setShowPremiumPrompt(true);
              }
            }}
            placeholder={!premiumLoading && !isPremium ? "Upgrade to post updates..." : "Post an update..."}
            maxLength={200}
            style={{
              flex: 1,
              background: '#1c1c1e',
              border: 'none',
              borderRadius: '24px',
              padding: '14px 20px',
              color: '#fff',
              fontSize: '15px',
              outline: 'none',
              opacity: !premiumLoading && !isPremium ? 0.6 : 1
            }}
          />
          <button
            onClick={handlePostUpdate}
            disabled={!updateText.trim() || posting}
            style={{
              background: updateText.trim() && !posting ? '#FF6B35' : '#333',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              color: '#fff',
              fontSize: '20px',
              cursor: updateText.trim() && !posting ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {posting ? '...' : '➤'}
          </button>
        </div>
      </div>

      {/* Premium Prompt Modal */}
      {showPremiumPrompt && (
        <div
          onClick={() => setShowPremiumPrompt(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1c1c1e',
              borderRadius: '24px',
              padding: '32px 24px',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
              Post Cruising Updates
            </h3>
            <p style={{ fontSize: '15px', color: '#888', marginBottom: '24px', lineHeight: 1.5 }}>
              Upgrade to SLTR Pro to post updates and let others know where you are
            </p>
            <button
              onClick={() => router.push('/premium')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                border: 'none',
                borderRadius: '14px',
                padding: '16px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => setShowPremiumPrompt(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingUpdate && (
        <div
          onClick={() => setReportingUpdate(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1c1c1e',
              borderRadius: '24px',
              padding: '32px 24px',
              maxWidth: '340px',
              width: '100%'
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>
              Report Post
            </h3>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px', textAlign: 'center' }}>
              Why are you reporting this post?
            </p>

            {/* Report reasons */}
            {(['spam', 'offensive', 'harassment', 'fake', 'other'] as CruisingReportReason[]).map((reason) => (
              <button
                key={reason}
                onClick={() => setReportReason(reason)}
                style={{
                  width: '100%',
                  background: reportReason === reason ? 'rgba(255,107,53,0.2)' : 'transparent',
                  border: reportReason === reason ? '1px solid #FF6B35' : '1px solid #333',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: reportReason === reason ? '#FF6B35' : '#fff',
                  fontSize: '15px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }}
              >
                {reason === 'fake' ? 'Fake / Misleading' : reason}
              </button>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => setReportingUpdate(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#fff',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                style={{
                  flex: 1,
                  background: '#FF6B35',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

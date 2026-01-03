'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  isGroupMember
} from '@/lib/api/groups';
import type { GroupWithHost, GroupMemberRole, ProfilePreview } from '@/types/database';

interface GroupMemberWithProfile {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
  joined_at: string;
  profile: ProfilePreview;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<GroupWithHost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [memberRole, setMemberRole] = useState<GroupMemberRole | null>(null);
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([]);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Use ref to track if data has been loaded to prevent duplicate fetches
  const hasLoaded = useRef(false);

  // Group ID is a UUID string - get it once
  const groupId = typeof params.id === 'string' ? params.id : null;

  // Derived state
  const isHost = currentUserId && group?.host_id === currentUserId;
  const isMember = memberRole !== null;

  // Load group data - use useCallback to stabilize the function reference
  const loadGroup = useCallback(async () => {
    if (!groupId || hasLoaded.current) return;

    hasLoaded.current = true;
    setLoading(true);

    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Load group data
      const groupData = await getGroup(groupId);
      if (!groupData) {
        setError('Group not found');
        setLoading(false);
        return;
      }
      setGroup(groupData);

      // Check membership role if user is logged in
      if (user) {
        const role = await isGroupMember(groupId);
        setMemberRole(role);
      }

      // Load all members
      const allMembers = await getGroupMembers(groupId);
      setMembers(allMembers as GroupMemberWithProfile[]);
    } catch (err) {
      console.error('Error loading group:', err);
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Run load once on mount
  useEffect(() => {
    if (groupId && !hasLoaded.current) {
      loadGroup();
    }
  }, [groupId, loadGroup]);

  const handleJoinRequest = async () => {
    if (!groupId || actionLoading) return;
    setActionLoading(true);

    try {
      const result = await joinGroup(groupId);
      setMemberRole(result.role);

      // Refresh members list
      const allMembers = await getGroupMembers(groupId);
      setMembers(allMembers as GroupMemberWithProfile[]);
      if (group) {
        setGroup({ ...group, attendees: group.attendees + 1 });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to join group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId || actionLoading) return;
    setActionLoading(true);

    try {
      await leaveGroup(groupId);
      setMemberRole(null);
      setShowLeaveConfirm(false);

      // Refresh members list
      const allMembers = await getGroupMembers(groupId);
      setMembers(allMembers as GroupMemberWithProfile[]);
      if (group) {
        setGroup({ ...group, attendees: Math.max(0, group.attendees - 1) });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to leave group');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date/time for display
  const formatDateTime = () => {
    if (!group?.event_date) return { time: 'TBD', date: '' };

    const eventDate = new Date(group.event_date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = eventDate.toDateString() === today.toDateString();
    const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

    const timeStr = group.event_time || '';
    let time = '';
    if (isToday) {
      time = `Tonight ${timeStr}`;
    } else if (isTomorrow) {
      time = `Tomorrow ${timeStr}`;
    } else {
      time = `${eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${timeStr}`;
    }

    const date = eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return { time, date };
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '18px', color: '#888' }}>Loading...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 600 }}>{error || 'Group not found'}</div>
        <button
          onClick={() => router.back()}
          style={{ padding: '12px 24px', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const { time, date } = formatDateTime();
  const ageRange = group.min_age && group.max_age ? `${group.min_age}-${group.max_age}` : null;

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: 100
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF6B35', fontSize: '24px', cursor: 'pointer', padding: 0 }}>
          ‹
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 600, flex: 1 }}>Group Details</h1>
        {isHost && (
          <span style={{ fontSize: '12px', background: '#FF6B35', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>Host</span>
        )}
      </header>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#fff', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
          👥
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>{group.name}</h2>
        <div style={{ fontSize: '15px', opacity: 0.9, marginBottom: '20px' }}>
          {group.type} • Hosted by {group.host?.display_name || 'Unknown'}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '30px', fontSize: '16px', fontWeight: 600 }}>
          <span style={{ fontSize: '24px' }}>👥</span>
          {group.attendees}/{group.max_attendees} Attending
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Time & Location */}
        <div style={{ background: '#1c1c1e', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #333', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,107,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🕐</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>When</div>
              <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '4px' }}>{time}</div>
              <div style={{ fontSize: '14px', color: '#aaa' }}>{date}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,107,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>📍</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Where</div>
              <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '4px' }}>{group.location || 'Location TBD'}</div>
              {group.address && <div style={{ fontSize: '14px', color: '#aaa' }}>{group.address}</div>}
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <div style={{ background: '#1c1c1e', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>About</h3>
            <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px', whiteSpace: 'pre-wrap' }}>{group.description}</p>
            {group.tags && group.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {group.tags.map((tag: string) => (
                  <span key={tag} style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: '#FF6B35' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {ageRange && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#888' }}>
                Age Range: {ageRange}
              </div>
            )}
          </div>
        )}

        {/* Host */}
        <div style={{ background: '#1c1c1e', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Host</h3>
          <a href={`/profile/${group.host_id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#fff' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundImage: `url(${group.host?.photo_url || '/images/default-avatar.png'})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{group.host?.display_name || 'Unknown'}</div>
              <div style={{ fontSize: '13px', color: '#888' }}>View Profile →</div>
            </div>
          </a>
        </div>

        {/* Attendees */}
        {members.length > 0 && (
          <div style={{ background: '#1c1c1e', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              Attending ({members.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {members.map((member) => (
                <a key={member.user_id} href={`/profile/${member.user_id}`} style={{ textDecoration: 'none', color: '#fff', textAlign: 'center' }}>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', backgroundImage: `url(${member.profile?.photo_url || '/images/default-avatar.png'})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '6px', border: '2px solid #333' }} />
                  <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{member.profile?.display_name || 'Unknown'}</div>
                  {member.profile?.age && <div style={{ fontSize: '11px', color: '#888' }}>{member.profile.age}</div>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Group Messages - only for members */}
        {isMember && (
          <div style={{ background: '#1c1c1e', borderRadius: '16px', padding: '20px', marginBottom: '100px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Group Messages</h3>
            <a href={`/messages/group-${group.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#000', borderRadius: '12px', textDecoration: 'none', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '28px' }}>💬</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{group.name}</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>{group.attendees} members</div>
                </div>
              </div>
              <div style={{ fontSize: '20px', color: '#888' }}>›</div>
            </a>
          </div>
        )}

        {/* Spacer for fixed button */}
        {!isMember && <div style={{ height: '100px' }} />}
      </div>

      {/* Fixed Action Button */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 70%, transparent)', backdropFilter: 'blur(20px)' }}>
        {isHost ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href={`/messages/group-${group.id}`} style={{ flex: 1, background: '#FF6B35', border: 'none', borderRadius: '12px', padding: '18px', color: '#fff', fontSize: '16px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              💬 Group Chat
            </a>
          </div>
        ) : isMember ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <a href={`/messages/group-${group.id}`} style={{ flex: 1, background: '#FF6B35', border: 'none', borderRadius: '12px', padding: '18px', color: '#fff', fontSize: '16px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              💬 Open Messages
            </a>
            <button onClick={() => setShowLeaveConfirm(true)} style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid #FF3B30', borderRadius: '12px', padding: '18px 24px', color: '#FF3B30', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
              Leave
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoinRequest}
            disabled={actionLoading || group.attendees >= group.max_attendees}
            style={{
              width: '100%',
              background: (actionLoading || group.attendees >= group.max_attendees) ? '#333' : '#FF6B35',
              border: 'none',
              borderRadius: '12px',
              padding: '18px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: (actionLoading || group.attendees >= group.max_attendees) ? 'not-allowed' : 'pointer',
              opacity: (actionLoading || group.attendees >= group.max_attendees) ? 0.5 : 1
            }}
          >
            {actionLoading ? 'Joining...' : group.attendees >= group.max_attendees ? 'Group Full' : 'Join Group'}
          </button>
        )}
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <>
          <button onClick={() => setShowLeaveConfirm(false)} aria-label="Close modal" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, border: 'none', padding: 0, cursor: 'pointer' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#1c1c1e', borderRadius: '20px', padding: '30px', maxWidth: '320px', width: '90%', zIndex: 1001 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>Leave Group?</h3>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, textAlign: 'center', marginBottom: '24px' }}>
              You'll need to request to join again if you change your mind.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={handleLeaveGroup} disabled={actionLoading} style={{ background: '#FF3B30', border: 'none', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                {actionLoading ? 'Leaving...' : 'Leave Group'}
              </button>
              <button onClick={() => setShowLeaveConfirm(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    // Mock group data
    const mockGroup = {
      id: params.id,
      name: 'Late Night Fun 🌙',
      host: 'Jordan',
      hostId: 6,
      hostImage: '/images/6.jpg',
      type: 'Hangout',
      attendees: 8,
      maxAttendees: 15,
      time: 'Tonight 9:00 PM',
      date: 'Dec 9, 2025',
      location: 'West Hollywood',
      address: '8743 Santa Monica Blvd',
      description: 'Looking to meet some cool people for drinks and good vibes. BYOB! Open to hanging out after if the vibe is right. Must be chill and drama-free.',
      tags: ['Social', 'Drinks', 'Casual'],
      ageRange: '21-35',
      attendeesList: [
        { id: 1, name: 'Alex', image: '/images/5.jpg', age: 28 },
        { id: 2, name: 'Mike', image: '/images/5.jpg', age: 25 },
        { id: 3, name: 'Chris', image: '/images/6.jpg', age: 31 },
        { id: 4, name: 'Sam', image: '/images/6.jpg', age: 27 },
        { id: 5, name: 'Taylor', image: '/images/5.jpg', age: 24 },
        { id: 6, name: 'Jamie', image: '/images/5.jpg', age: 29 },
        { id: 7, name: 'Riley', image: '/images/6.jpg', age: 26 },
        { id: 8, name: 'Casey', image: '/images/6.jpg', age: 30 },
      ]
    };
    setGroup(mockGroup);

    // Check if user has joined
    const joinedGroups = JSON.parse(localStorage.getItem('joinedGroups') || '[]');
    setIsJoined(joinedGroups.includes(params.id));
  }, [params.id]);

  const handleJoinGroup = () => {
    const joinedGroups = JSON.parse(localStorage.getItem('joinedGroups') || '[]');
    if (!joinedGroups.includes(params.id)) {
      joinedGroups.push(params.id);
      localStorage.setItem('joinedGroups', JSON.stringify(joinedGroups));
      setIsJoined(true);
      setGroup({ ...group, attendees: group.attendees + 1 });
    }
  };

  const handleLeaveGroup = () => {
    const joinedGroups = JSON.parse(localStorage.getItem('joinedGroups') || '[]');
    const updated = joinedGroups.filter((id: string) => id !== params.id);
    localStorage.setItem('joinedGroups', JSON.stringify(updated));
    setIsJoined(false);
    setShowLeaveConfirm(false);
    setGroup({ ...group, attendees: group.attendees - 1 });
  };

  if (!group) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '18px', color: '#888' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
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
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '24px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ‹
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 600, flex: 1 }}>Group Details</h1>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ⋮
        </button>
      </header>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: '#fff',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '50px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}>
          👥
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
          {group.name}
        </h2>
        <div style={{ fontSize: '15px', opacity: 0.9, marginBottom: '20px' }}>
          {group.type} • Hosted by {group.host}
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '12px 20px',
          borderRadius: '30px',
          fontSize: '16px',
          fontWeight: 600
        }}>
          <span style={{ fontSize: '24px' }}>👥</span>
          {group.attendees}/{group.maxAttendees} Attending
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Time & Location */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            paddingBottom: '20px',
            borderBottom: '1px solid #333',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,107,53,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              🕐
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>When</div>
              <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '4px' }}>{group.time}</div>
              <div style={{ fontSize: '14px', color: '#aaa' }}>{group.date}</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,107,53,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              📍
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Where</div>
              <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '4px' }}>{group.location}</div>
              <div style={{ fontSize: '14px', color: '#aaa' }}>{group.address}</div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(group.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '12px',
                  color: '#FF6B35',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Get Directions →
              </a>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>About</h3>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
            {group.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {group.tags.map((tag: string) => (
              <span
                key={tag}
                style={{
                  background: 'rgba(255,107,53,0.15)',
                  border: '1px solid rgba(255,107,53,0.3)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  color: '#FF6B35'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Host */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Host</h3>
          <a
            href={`/profile/${group.hostId}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: '#fff'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundImage: `url(${group.hostImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{group.host}</div>
              <div style={{ fontSize: '13px', color: '#888' }}>View Profile →</div>
            </div>
          </a>
        </div>

        {/* Attendees */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Attending ({group.attendees})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            {group.attendeesList.map((attendee: any) => (
              <a
                key={attendee.id}
                href={`/profile/${attendee.id}`}
                style={{
                  textDecoration: 'none',
                  color: '#fff',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  backgroundImage: `url(${attendee.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: '6px',
                  border: '2px solid #333'
                }} />
                <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{attendee.name}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{attendee.age}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Group Chat */}
        {isJoined && (
          <div style={{
            background: '#1c1c1e',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '100px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Group Chat</h3>
            <a
              href={`/messages/group-${group.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#000',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '28px' }}>💬</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                    {group.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    {group.attendees} members
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '20px', color: '#888' }}>›</div>
            </a>
          </div>
        )}
      </div>

      {/* Fixed Action Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 70%, transparent)',
        backdropFilter: 'blur(20px)'
      }}>
        {isJoined ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href={`/messages/group-${group.id}`}
              style={{
                flex: 1,
                background: '#FF6B35',
                border: 'none',
                borderRadius: '12px',
                padding: '18px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              💬 Open Chat
            </a>
            <button
              onClick={() => setShowLeaveConfirm(true)}
              style={{
                background: 'rgba(255,59,48,0.15)',
                border: '1px solid #FF3B30',
                borderRadius: '12px',
                padding: '18px 24px',
                color: '#FF3B30',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Leave
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoinGroup}
            disabled={group.attendees >= group.maxAttendees}
            style={{
              width: '100%',
              background: group.attendees >= group.maxAttendees ? '#333' : '#FF6B35',
              border: 'none',
              borderRadius: '12px',
              padding: '18px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: group.attendees >= group.maxAttendees ? 'not-allowed' : 'pointer',
              opacity: group.attendees >= group.maxAttendees ? 0.5 : 1
            }}
          >
            {group.attendees >= group.maxAttendees ? 'Group Full' : 'Join Group'}
          </button>
        )}
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <>
          <button
            onClick={() => setShowLeaveConfirm(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowLeaveConfirm(false);
            }}
            aria-label="Close modal"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 1000,
              animation: 'fadeIn 0.2s',
              border: 'none',
              padding: 0,
              cursor: 'pointer'
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#1c1c1e',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '320px',
            width: '90%',
            zIndex: 1001,
            animation: 'slideUp 0.3s'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
              Leave Group?
            </h3>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, textAlign: 'center', marginBottom: '24px' }}>
              You'll need to request to join again if you change your mind.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleLeaveGroup}
                style={{
                  background: '#FF3B30',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Leave Group
              </button>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
}

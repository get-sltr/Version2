'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

type Participant = {
  id: string;
  display_name: string | null;
  photo_url: string | null;
  isSpeaking?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
};

type ChatMessage = {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
};

export default function ConferenceRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
      }
    };
    loadUser();
  }, [router]);

  // Simulate room connection and participants
  useEffect(() => {
    // Simulate connection
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
      setRoomName(`Room ${roomId.slice(0, 6)}`);

      // Simulate some participants for demo
      setParticipants([
        { id: '1', display_name: 'Alex', photo_url: null, isSpeaking: false, isMuted: false },
        { id: '2', display_name: 'Jordan', photo_url: null, isSpeaking: true, isMuted: false },
        { id: '3', display_name: 'Sam', photo_url: null, isSpeaking: false, isMuted: true },
      ]);
      setActiveSpeaker('2');
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, [roomId]);

  // Call duration timer
  useEffect(() => {
    if (!isConnecting) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isConnecting]);

  // Auto-hide controls
  useEffect(() => {
    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showChat && !showParticipants) {
          setShowControls(false);
        }
      }, 4000);
    };

    resetTimeout();
    const handleActivity = () => resetTimeout();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [showChat, showParticipants]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeaveRoom = () => {
    router.push('/dashboard');
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  const sendChatMessage = () => {
    if (!chatInput.trim() || !currentUser) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      sender_name: currentUser.display_name || 'You',
      content: chatInput.trim(),
      created_at: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  // Determine grid layout based on participant count
  const getGridStyle = () => {
    const count = participants.length + 1; // +1 for current user
    if (count === 1) return { gridTemplateColumns: '1fr' };
    if (count === 2) return { gridTemplateColumns: '1fr 1fr' };
    if (count <= 4) return { gridTemplateColumns: 'repeat(2, 1fr)' };
    if (count <= 6) return { gridTemplateColumns: 'repeat(3, 1fr)' };
    return { gridTemplateColumns: 'repeat(4, 1fr)' };
  };

  if (isConnecting) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          marginBottom: '24px',
          animation: 'pulse 2s infinite'
        }}>
          🎥
        </div>
        <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
          Joining Room...
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
          Setting up your video and audio
        </div>
        <button
          onClick={() => router.back()}
          style={{
            marginTop: '40px',
            padding: '12px 32px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '25px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      background: '#0a0a0f',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        background: showControls ? 'rgba(0,0,0,0.8)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.3s',
        zIndex: 30,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleLeaveRoom}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Leave
          </button>
          <div>
            <div style={{ fontWeight: 600 }}>{roomName}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {formatDuration(callDuration)} • {participants.length + 1} participants
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
            style={{
              background: showParticipants ? '#FF6B35' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            👥 {participants.length + 1}
          </button>
          <button
            onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}
            style={{
              background: showChat ? '#FF6B35' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            💬
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video grid */}
        <div style={{
          flex: 1,
          padding: '12px',
          display: 'grid',
          gap: '8px',
          ...getGridStyle()
        }}>
          {/* Current user tile */}
          <div style={{
            background: '#1a1a2e',
            borderRadius: '12px',
            position: 'relative',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: activeSpeaker === currentUser?.id ? '3px solid #FF6B35' : '1px solid #333'
          }}>
            {isVideoOff ? (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {currentUser?.display_name?.[0]?.toUpperCase() || '👤'}
              </div>
            ) : (
              <div style={{ fontSize: '48px' }}>📹</div>
            )}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: 'rgba(0,0,0,0.7)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {isMuted && <span>🔇</span>}
              <span>You</span>
            </div>
          </div>

          {/* Other participants */}
          {participants.map(p => (
            <div
              key={p.id}
              style={{
                background: '#1a1a2e',
                borderRadius: '12px',
                position: 'relative',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: activeSpeaker === p.id ? '3px solid #FF6B35' : '1px solid #333',
                transition: 'border 0.2s'
              }}
            >
              {p.isVideoOff ? (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px'
                }}>
                  {p.display_name?.[0]?.toUpperCase() || '👤'}
                </div>
              ) : (
                <div style={{ fontSize: '48px' }}>📹</div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'rgba(0,0,0,0.7)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {p.isMuted && <span>🔇</span>}
                {p.isSpeaking && <span style={{ color: '#30D158' }}>🔊</span>}
                <span>{p.display_name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div style={{
            width: '320px',
            background: '#12121a',
            borderLeft: '1px solid #333',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #333',
              fontWeight: 600
            }}>
              Chat
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px'
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  No messages yet
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: '#FF6B35' }}>
                        {msg.sender_name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#666' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#ddd' }}>{msg.content}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{
              padding: '12px',
              borderTop: '1px solid #333',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: '#1a1a2e',
                  border: '1px solid #333',
                  borderRadius: '20px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={sendChatMessage}
                style={{
                  background: '#FF6B35',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Participants sidebar */}
        {showParticipants && (
          <div style={{
            width: '280px',
            background: '#12121a',
            borderLeft: '1px solid #333',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #333',
              fontWeight: 600
            }}>
              Participants ({participants.length + 1})
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {/* Current user */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255,107,53,0.1)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {currentUser?.display_name?.[0]?.toUpperCase() || '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>You</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Host</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {isMuted && <span style={{ fontSize: '16px' }}>🔇</span>}
                  {isVideoOff && <span style={{ fontSize: '16px' }}>📷</span>}
                </div>
              </div>

              {/* Other participants */}
              {participants.map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '4px'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {p.display_name?.[0]?.toUpperCase() || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.display_name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {p.isMuted && <span style={{ fontSize: '16px' }}>🔇</span>}
                    {p.isSpeaking && <span style={{ fontSize: '16px', color: '#30D158' }}>🔊</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              padding: '12px',
              borderTop: '1px solid #333'
            }}>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                📋 Copy Invite Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{
        padding: '16px 24px 24px',
        background: showControls ? 'rgba(0,0,0,0.8)' : 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        transition: 'background 0.3s'
      }}>
        {/* Mute */}
        <button
          onClick={toggleMute}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isMuted ? '#FF3B30' : 'rgba(255,255,255,0.15)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transition: 'background 0.2s'
          }}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        {/* Video */}
        <button
          onClick={toggleVideo}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isVideoOff ? '#FF3B30' : 'rgba(255,255,255,0.15)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transition: 'background 0.2s'
          }}
        >
          {isVideoOff ? '📷' : '📹'}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isScreenSharing ? '#30D158' : 'rgba(255,255,255,0.15)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            transition: 'background 0.2s'
          }}
        >
          🖥️
        </button>

        {/* Leave */}
        <button
          onClick={handleLeaveRoom}
          style={{
            width: '70px',
            height: '56px',
            borderRadius: '28px',
            background: '#FF3B30',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: '#fff',
            fontWeight: 600,
            gap: '6px',
            boxShadow: '0 4px 16px rgba(255,59,48,0.4)'
          }}
        >
          📵
        </button>
      </div>
    </div>
  );
}

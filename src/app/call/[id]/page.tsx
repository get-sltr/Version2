'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

type CallerProfile = {
  id: string;
  display_name: string | null;
  photo_url: string | null;
};

export default function VideoCallPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const otherUserId = params.id as string;
  const roomUrl = searchParams.get('room');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [caller, setCaller] = useState<CallerProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load caller profile
  useEffect(() => {
    const loadCaller = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url')
        .eq('id', otherUserId)
        .single();

      if (data) {
        setCaller(data);
      }
    };
    loadCaller();
  }, [otherUserId]);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-hide controls after inactivity
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    };

    resetControlsTimeout();

    const handleTouch = () => resetControlsTimeout();
    window.addEventListener('touchstart', handleTouch);
    window.addEventListener('mousemove', handleTouch);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousemove', handleTouch);
    };
  }, []);

  // Simulate connection after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = useCallback(() => {
    // Send message to Daily iframe to leave
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'leave-meeting' }, '*');
    }
    router.back();
  }, [router]);

  // Handle messages from Daily iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === 'left-meeting' || event.data?.action === 'participant-left') {
        handleEndCall();
      }
      if (event.data?.action === 'joined-meeting') {
        setIsConnecting(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleEndCall]);

  // Toggle functions - these send postMessage to Daily iframe
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'toggle-audio' }, '*');
    }
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'toggle-video' }, '*');
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const flipCamera = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ action: 'cycle-camera' }, '*');
    }
  };

  if (!roomUrl) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          boxShadow: '0 8px 32px rgba(255,107,53,0.3)'
        }}>
          📹
        </div>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>No video room specified</div>
        <button
          onClick={() => router.back()}
          style={{
            padding: '14px 32px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '25px',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        background: '#000',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => setShowControls(true)}
    >
      {/* Daily.co iframe - full screen, hide all native controls */}
      <iframe
        ref={iframeRef}
        src={`${roomUrl}?showLeaveButton=false&showFullscreenButton=false&showLocalVideo=false&showParticipantsBar=false&activeSpeakerMode=false&cssFile=none`}
        title="Video Call"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#000'
        }}
      />

      {/* Connecting overlay */}
      {isConnecting && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          {/* Caller avatar with pulse animation */}
          <div style={{
            position: 'relative',
            marginBottom: '24px'
          }}>
            <div style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '50%',
              background: 'rgba(255,107,53,0.2)',
              animation: 'pulse 2s infinite'
            }} />
            <div style={{
              position: 'absolute',
              inset: '-40px',
              borderRadius: '50%',
              background: 'rgba(255,107,53,0.1)',
              animation: 'pulse 2s infinite 0.5s'
            }} />
            {caller?.photo_url ? (
              <img
                src={caller.photo_url}
                alt=""
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid rgba(255,107,53,0.5)',
                  position: 'relative',
                  zIndex: 1
                }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                border: '4px solid rgba(255,255,255,0.2)',
                position: 'relative',
                zIndex: 1
              }}>
                {caller?.display_name?.[0]?.toUpperCase() || '👤'}
              </div>
            )}
          </div>

          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            {caller?.display_name || 'Connecting...'}
          </div>
          <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>
            Connecting video call...
          </div>

          {/* Connecting dots animation */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#FF6B35',
                  animation: `bounce 1.4s infinite ease-in-out both`,
                  animationDelay: `${i * 0.16}s`
                }}
              />
            ))}
          </div>

          {/* End call button during connecting */}
          <button
            onClick={handleEndCall}
            style={{
              position: 'absolute',
              bottom: '60px',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#FF3B30',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: '0 8px 24px rgba(255,59,48,0.4)'
            }}
          >
            📵
          </button>
        </div>
      )}

      {/* FaceTime-style header overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '50px 20px 20px',
        background: showControls ? 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)' : 'transparent',
        zIndex: 20,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: showControls ? 'auto' : 'none'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            {caller?.display_name || 'Video Call'}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)',
            marginTop: '4px',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)'
          }}>
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>

      {/* Minimize button (top left) */}
      <button
        onClick={() => router.back()}
        style={{
          position: 'absolute',
          top: '50px',
          left: '20px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 25,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none'
        }}
      >
        ↙️
      </button>

      {/* Flip camera button (top right) */}
      <button
        onClick={flipCamera}
        style={{
          position: 'absolute',
          top: '50px',
          right: '20px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 25,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none'
        }}
      >
        🔄
      </button>

      {/* FaceTime-style bottom controls */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '30px 20px 50px',
        background: showControls ? 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)' : 'transparent',
        zIndex: 20,
        opacity: showControls ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: showControls ? 'auto' : 'none'
      }}>
        {/* Main controls row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* Mute button */}
          <button
            onClick={toggleMute}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: isMuted ? '#FF3B30' : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>

          {/* End call button - larger and red */}
          <button
            onClick={handleEndCall}
            style={{
              width: '75px',
              height: '75px',
              borderRadius: '50%',
              background: '#FF3B30',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              boxShadow: '0 4px 20px rgba(255,59,48,0.5)',
              transition: 'transform 0.2s'
            }}
          >
            📵
          </button>

          {/* Video button */}
          <button
            onClick={toggleVideo}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: isVideoOff ? '#FF3B30' : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            {isVideoOff ? '📷' : '📹'}
          </button>
        </div>

        {/* Secondary controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '32px',
          marginTop: '20px'
        }}>
          {/* Speaker */}
          <button
            onClick={toggleSpeaker}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isSpeakerOn ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {isSpeakerOn ? '🔊' : '🔈'}
            </div>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>Speaker</span>
          </button>

          {/* Effects placeholder */}
          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              ✨
            </div>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>Effects</span>
          </button>

          {/* Message */}
          <button
            onClick={() => router.push(`/messages/${otherUserId}`)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              💬
            </div>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>Message</span>
          </button>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

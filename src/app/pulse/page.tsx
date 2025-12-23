'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';

export default function PulseSplashPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    // Check if device is desktop/laptop
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,107,53,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.3,
        animation: 'gridMove 20s linear infinite'
      }} />

      {/* Back Button */}
      <button
        onClick={() => router.push('/map')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255,107,53,0.1)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          color: '#FF6B35',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
      >
        ←
      </button>

      {/* ECG Heartbeat Logo */}
      <div style={{
        position: 'relative',
        marginBottom: '60px',
        animation: 'fadeIn 1s ease-out'
      }}>
        {/* Pulsing Glow Effect */}
        <div style={{
          position: 'absolute',
          inset: '-40px',
          background: 'radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
          filter: 'blur(30px)'
        }} />
        
        {/* ECG Heartbeat SVG */}
        <svg width="300" height="120" viewBox="0 0 300 120" style={{ position: 'relative', zIndex: 1 }}>
          {/* Heartbeat Line */}
          <path
            d="M 0 60 L 70 60 L 80 20 L 90 100 L 100 60 L 120 60 L 130 50 L 140 70 L 150 60 L 300 60"
            stroke="#FF6B35"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255,107,53,0.8))',
              animation: 'drawLine 3s ease-in-out infinite'
            }}
          />
          {/* Animated Pulse Point */}
          <circle
            cx="0"
            cy="60"
            r="6"
            fill="#FF6B35"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255,107,53,1))',
              animation: 'movePulse 3s linear infinite'
            }}
          />
        </svg>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '64px',
        fontWeight: 800,
        marginBottom: '16px',
        background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 50%, #FF6B35 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '200% auto',
        animation: 'shimmer 3s linear infinite',
        letterSpacing: '-2px'
      }}>
        THE PULSE
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '20px',
        color: colors.textSecondary,
        marginBottom: '48px',
        textAlign: 'center',
        maxWidth: '500px',
        lineHeight: 1.6
      }}>
        Connect with up to 400 people in real-time video conferences. 
        Voice, video, and messaging - all in one beat.
      </p>

      {/* Device Recommendation */}
      {!isDesktop && (
        <div style={{
          background: 'rgba(128, 128, 128, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '500px',
          animation: 'slideUp 0.5s ease-out',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '32px' }}>💻</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: colors.accent }}>
              Best on Desktop
            </div>
            <div style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: 1.5 }}>
              For the best experience with multiple video streams, we recommend using a laptop or desktop computer.
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '48px',
        maxWidth: '800px',
        width: '100%'
      }}>
        {[
          { icon: '🎥', title: 'HD Video', desc: 'Crystal clear video quality' },
          { icon: '🎤', title: 'Voice Rooms', desc: 'Spatial audio for natural conversations' },
          { icon: '💬', title: 'Live Messaging', desc: 'Text messaging alongside video' },
          { icon: '🖥️', title: 'Screen Share', desc: 'Share your screen with everyone' }
        ].map((feature, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(128, 128, 128, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              transition: 'all 0.3s',
              animation: `slideUp 0.5s ease-out ${i * 0.1}s backwards`,
              cursor: 'default',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '1px solid #FF6B35';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{feature.icon}</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: colors.text }}>
              {feature.title}
            </div>
            <div style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: 1.4 }}>
              {feature.desc}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => router.push('/pulse/lobby')}
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          border: 'none',
          borderRadius: '16px',
          padding: '20px 48px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(255,107,53,0.4)',
          transition: 'all 0.3s',
          animation: 'slideUp 0.8s ease-out',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 48px rgba(255,107,53,0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,53,0.4)';
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>Enter The Pulse</span>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'shimmerBtn 2s infinite'
        }} />
      </button>

      {/* Stats */}
      <div style={{
        marginTop: '60px',
        display: 'flex',
        gap: '48px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {[
          { number: '400', label: 'Max Participants' },
          { number: '24/7', label: 'Always Open' },
          { number: 'HD', label: 'Video Quality' }
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#FF6B35',
              marginBottom: '8px'
            }}>
              {stat.number}
            </div>
            <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        @keyframes shimmerBtn {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        @keyframes drawLine {
          0%, 100% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          50% {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        @keyframes movePulse {
          0% {
            cx: 0;
          }
          100% {
            cx: 300;
          }
        }
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  );
}

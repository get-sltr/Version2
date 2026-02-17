'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { AnimatedLogo } from '@/components/AnimatedLogo';

// Particle configuration
const PARTICLE_COUNT = 80;
const WHIRLPOOL_DURATION = 4000; // ms
const FLASH_DELAY = WHIRLPOOL_DURATION - 200;
const REVEAL_DELAY = WHIRLPOOL_DURATION + 300;

interface Particle {
  id: number;
  startX: number;
  startY: number;
  size: number;
  delay: number;
  duration: number;
  brightness: number;
}

export default function LandingPage() {
  const [phase, setPhase] = useState<'whirlpool' | 'flash' | 'reveal'>('whirlpool');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate particles once
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 70; // Start from edges
      return {
        id: i,
        startX: 50 + Math.cos(angle) * distance,
        startY: 50 + Math.sin(angle) * distance,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 1.5,
        brightness: 0.5 + Math.random() * 0.5,
      };
    });
  }, []);

  useEffect(() => {
    const flashTimer = setTimeout(() => setPhase('flash'), FLASH_DELAY);
    const revealTimer = setTimeout(() => setPhase('reveal'), REVEAL_DELAY);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => setVideoLoaded(true);
      video.addEventListener('canplay', handleCanPlay);
      // Force play — muted videos can autoplay without user gesture
      video.muted = true;
      video.play().catch(() => {});
      const fallback = setTimeout(() => setVideoLoaded(true), 2000);
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        clearTimeout(fallback);
      };
    }
  }, []);

  const handleSkip = () => {
    if (phase !== 'reveal') setPhase('reveal');
  };

  return (
    <div className="landing-container" onClick={handleSkip}>
      {/* Video Background - hidden during whirlpool */}
      <div className={`video-wrapper ${phase === 'reveal' ? 'visible' : ''}`}>
        <video
          ref={videoRef}
          className={`bg-video ${videoLoaded ? 'loaded' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="deny"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          preload="auto"
        >
          <source src="/Videos/PrimalLanding.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" />
      </div>

      {/* Flash Overlay */}
      <div className={`flash-overlay ${phase === 'flash' ? 'active' : ''}`} />

      {/* Whirlpool Particle Animation */}
      <div className={`whirlpool-stage ${phase !== 'whirlpool' ? 'hidden' : ''}`}>
        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="sparkle"
            style={{
              '--start-x': `${p.startX}%`,
              '--start-y': `${p.startY}%`,
              '--size': `${p.size}px`,
              '--delay': `${p.delay}s`,
              '--duration': `${p.duration}s`,
              '--brightness': p.brightness,
            } as React.CSSProperties}
          />
        ))}

        {/* Center glow that builds up */}
        <div className="center-glow" />

        {/* Logo silhouette that fades in */}
        <div className="forming-logo">
          <AnimatedLogo size="large" href={undefined} showText={false} />
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Primal',
          url: 'https://primalgay.com',
          description: 'Dating app built for gay and bisexual men. Real connections, built-in video calls, group rooms, and zero bots.',
          applicationCategory: 'SocialNetworkingApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          creator: {
            '@type': 'Organization',
            name: 'SLTR Digital LLC',
            url: 'https://primalgay.com',
          },
        }) }}
      />

      {/* Main Content */}
      <main className={`main-content ${phase === 'reveal' ? 'visible' : ''}`}>
        <h1 className="sr-only">Primal — Dating App for Gay & Bisexual Men</h1>
        <div className="logo-composition">
          <AnimatedLogo size="large" href={undefined} showText={true} />
        </div>
        <div className="cta-container">
          <Link href="/signup" className="cta-btn cta-btn-primary">
            <span className="btn-shine" />
            Get Started
          </Link>
          <Link href="/login" className="cta-btn cta-btn-secondary">
            <span className="btn-shine" />
            Sign In
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className={`landing-footer ${phase === 'reveal' ? 'visible' : ''}`}>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/about">About</Link>
        </div>
        <div className="footer-brand">
          <span className="company-name">PRIMAL MEN</span>
          <span className="company-tagline">YOUR BURNING DESIRE, UNLEASHED.</span>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; overflow: hidden; }

        .landing-container {
          position: fixed;
          inset: 0;
          background: #000;
          font-family: 'Audiowide', sans-serif;
          overflow: hidden;
          cursor: pointer;
        }

        /* ===========================================
           VIDEO BACKGROUND
           =========================================== */
        .video-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0;
          transition: opacity 1s ease;
        }

        .video-wrapper.visible { opacity: 1; }

        .bg-video {
          position: absolute;
          top: 50%;
          left: 50%;
          min-width: 100%;
          min-height: 100%;
          width: auto;
          height: auto;
          transform: translate(-50%, -50%);
          object-fit: cover;
          opacity: 0;
          transition: opacity 1s ease;
        }

        .bg-video.loaded { opacity: 1; }

        /* Hide ALL native video controls and play button */
        .bg-video::-webkit-media-controls {
          display: none !important;
          -webkit-appearance: none;
        }
        .bg-video::-webkit-media-controls-start-playback-button {
          display: none !important;
          -webkit-appearance: none;
        }
        .bg-video::-webkit-media-controls-panel {
          display: none !important;
        }
        .bg-video::-webkit-media-controls-play-button {
          display: none !important;
        }
        .bg-video::-webkit-media-controls-overlay-play-button {
          display: none !important;
        }
        .bg-video::-internal-media-controls-overlay-cast-button {
          display: none !important;
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(5, 5, 8, 0.6) 0%,
            rgba(5, 5, 8, 0.3) 30%,
            rgba(5, 5, 8, 0.4) 70%,
            rgba(5, 5, 8, 0.8) 100%
          );
          pointer-events: none;
        }

        /* ===========================================
           FLASH OVERLAY
           =========================================== */
        .flash-overlay {
          position: fixed;
          inset: 0;
          background: white;
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
        }

        .flash-overlay.active {
          animation: flash-burst 0.8s ease-out forwards;
        }

        @keyframes flash-burst {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* ===========================================
           WHIRLPOOL PARTICLE ANIMATION
           =========================================== */
        .whirlpool-stage {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 100;
          transition: opacity 0.5s ease;
        }

        .whirlpool-stage.hidden {
          opacity: 0;
          pointer-events: none;
        }

        /* Individual sparkle particles */
        .sparkle {
          position: absolute;
          left: var(--start-x);
          top: var(--start-y);
          width: var(--size);
          height: var(--size);
          background: radial-gradient(circle,
            rgba(255, 255, 255, 1) 0%,
            rgba(200, 220, 255, 0.8) 30%,
            transparent 70%
          );
          border-radius: 50%;
          filter: blur(0.5px);
          opacity: 0;
          animation: whirlpool-spiral var(--duration) cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: var(--delay);
          box-shadow:
            0 0 calc(var(--size) * 2) rgba(255, 255, 255, calc(var(--brightness))),
            0 0 calc(var(--size) * 4) rgba(200, 220, 255, calc(var(--brightness) * 0.5));
        }

        @keyframes whirlpool-spiral {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(0deg) scale(0.5);
          }
          10% {
            opacity: 1;
          }
          30% {
            transform: translate(
              calc(-50% + (50% - var(--start-x)) * 0.3),
              calc(-50% + (50% - var(--start-y)) * 0.3)
            ) rotate(180deg) scale(0.8);
          }
          60% {
            transform: translate(
              calc(-50% + (50% - var(--start-x)) * 0.7),
              calc(-50% + (50% - var(--start-y)) * 0.7)
            ) rotate(400deg) scale(1);
          }
          85% {
            opacity: 1;
            transform: translate(
              calc(-50% + (50% - var(--start-x)) * 0.95),
              calc(-50% + (50% - var(--start-y)) * 0.95)
            ) rotate(600deg) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + (50% - var(--start-x))),
              calc(-50% + (50% - var(--start-y)))
            ) rotate(720deg) scale(0);
          }
        }

        /* Center glow that builds up as particles converge */
        .center-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150px;
          height: 150px;
          background: radial-gradient(circle,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(200, 220, 255, 0.4) 30%,
            rgba(255, 107, 53, 0.2) 50%,
            transparent 70%
          );
          filter: blur(20px);
          opacity: 0;
          animation: center-glow-build 4s ease-in forwards;
        }

        @keyframes center-glow-build {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          50% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.6); }
          80% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          95% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        }

        /* Logo silhouette forming */
        .forming-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          opacity: 0;
          animation: logo-form 4s ease-out forwards;
        }

        .forming-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))
                 drop-shadow(0 0 60px rgba(200, 220, 255, 0.6));
        }

        @keyframes logo-form {
          0%, 60% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          80% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          90% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
        }

        /* ===========================================
           MAIN CONTENT
           =========================================== */
        .main-content {
          position: relative;
          z-index: 50;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .main-content.visible {
          opacity: 1;
          transform: scale(1);
        }

        /* ===========================================
           LOGO COMPOSITION
           =========================================== */
        .logo-composition {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transform: scale(1.3);
        }

        /* Stack logo vertically on landing page */
        .logo-composition > div {
          flex-direction: column !important;
          align-items: center !important;
        }

        /* ===========================================
           CTA BUTTONS
           =========================================== */
        .cta-container {
          display: flex;
          gap: 16px;
          margin-top: 40px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s;
        }

        .main-content.visible .cta-container {
          opacity: 1;
          transform: translateY(0);
        }

        .cta-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 54px;
          padding: 0 36px;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.1) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          font-family: 'Audiowide', sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .btn-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255, 255, 255, 0.2) 40%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.2) 60%,
            transparent 80%
          );
          animation: btn-shine-sweep 4s ease-in-out infinite;
        }

        @keyframes btn-shine-sweep {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent);
          border-radius: 16px 16px 0 0;
          pointer-events: none;
        }

        .cta-btn:hover {
          transform: translateY(-3px);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            0 8px 30px rgba(200, 220, 255, 0.3),
            0 0 50px rgba(200, 220, 255, 0.15);
          border-color: rgba(200, 220, 255, 0.4);
        }

        .cta-btn-primary {
          background: linear-gradient(
            135deg,
            rgba(255, 107, 53, 0.25) 0%,
            rgba(255, 107, 53, 0.15) 50%,
            rgba(255, 107, 53, 0.25) 100%
          );
          border-color: rgba(255, 107, 53, 0.5);
          color: #FF6B35;
          box-shadow:
            inset 0 1px 0 rgba(255, 200, 150, 0.3),
            0 4px 20px rgba(255, 107, 53, 0.2);
        }

        .cta-btn-primary:hover {
          background: linear-gradient(
            135deg,
            rgba(255, 107, 53, 0.35) 0%,
            rgba(255, 107, 53, 0.25) 50%,
            rgba(255, 107, 53, 0.35) 100%
          );
          border-color: rgba(255, 107, 53, 0.7);
          color: #fff;
          box-shadow:
            inset 0 1px 0 rgba(255, 200, 150, 0.4),
            0 8px 40px rgba(255, 107, 53, 0.4),
            0 0 60px rgba(255, 107, 53, 0.2);
        }

        .cta-btn-secondary {
          background: linear-gradient(
            135deg,
            rgba(200, 220, 255, 0.1) 0%,
            rgba(200, 220, 255, 0.05) 50%,
            rgba(200, 220, 255, 0.1) 100%
          );
        }

        .cta-btn-secondary:hover {
          background: linear-gradient(
            135deg,
            rgba(200, 220, 255, 0.2) 0%,
            rgba(200, 220, 255, 0.1) 50%,
            rgba(200, 220, 255, 0.2) 100%
          );
          color: #fff;
        }

        /* ===========================================
           FOOTER
           =========================================== */
        .landing-footer {
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          opacity: 0;
          transition: opacity 0.8s ease 1.2s;
          z-index: 60;
        }

        .landing-footer.visible { opacity: 1; }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.35);
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 12px 8px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
        }

        .footer-links a:hover {
          color: #FF6B35;
          text-shadow: 0 0 15px rgba(255, 107, 53, 0.5);
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .company-name {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.3);
          text-shadow: 0 0 10px rgba(200, 220, 255, 0.3);
        }

        .company-tagline {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.2em;
          background: linear-gradient(90deg,
            rgba(255, 107, 53, 0.6) 0%,
            rgba(255, 200, 150, 1) 25%,
            rgba(255, 107, 53, 0.6) 50%,
            rgba(255, 200, 150, 1) 75%,
            rgba(255, 107, 53, 0.6) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: tagline-shimmer 3s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.4));
        }

        @keyframes tagline-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* ===========================================
           RESPONSIVE
           =========================================== */
        @media (max-width: 700px) {
          .logo-composition {
            transform: scale(1);
          }

          .cta-container {
            flex-direction: column;
            width: 100%;
            padding: 0 24px;
          }

          .cta-btn {
            width: 100%;
          }

          .forming-logo {
            transform: translate(-50%, -50%) scale(0.8);
          }
        }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .sparkle,
          .center-glow,
          .forming-logo,
          .btn-shine {
            animation: none;
          }

          .flash-overlay.active {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}


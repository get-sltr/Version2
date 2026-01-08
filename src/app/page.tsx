'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

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
        >
          <source src="/Videos/landingvid.mp4" type="video/mp4" />
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

        {/* Star silhouette that fades in */}
        <div className="forming-star">
          <FormingStarSVG />
        </div>
      </div>

      {/* Main Content */}
      <main className={`main-content ${phase === 'reveal' ? 'visible' : ''}`}>
        <div className="logo-composition">
          <div className="star-section">
            <div className="beam-container">
              <div className="beam beam-1" />
              <div className="beam beam-2" />
              <div className="beam beam-3" />
              <div className="beam beam-4" />
              <div className="beam beam-5" />
              <div className="beam beam-6" />
            </div>
            <div className="glow-ring ring-1" />
            <div className="glow-ring ring-2" />
            <div className="glow-ring ring-3" />
            <div className="star-crystalline">
              <div className="orange-glow" />
              <div className="black-base" />
              <div className="inner-glow" />
              <div className="glass-shine" />
              <CrystallineStarSVG />
            </div>
          </div>
          <div className="connector" />
          <div className="text-section">
            <h1 className="logo-text">
              <span className="glass-letter">S</span>
              <span className="glass-letter">L</span>
              <span className="glass-letter">T</span>
              <span className="glass-letter">R</span>
            </h1>
            <p className="tagline">Rules Don&apos;t Apply</p>
          </div>
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
          <span className="company-name">SLTR DIGITAL LLC</span>
          <span className="company-tagline">INTELLIGENT | INNOVATIVE | INTUITIVE</span>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; overflow: hidden; }

        .landing-container {
          position: fixed;
          inset: 0;
          background: #000;
          font-family: 'Orbitron', sans-serif;
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

        /* Star silhouette forming */
        .forming-star {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 150px;
          opacity: 0;
          animation: star-form 4s ease-out forwards;
        }

        .forming-star svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))
                 drop-shadow(0 0 60px rgba(200, 220, 255, 0.6));
        }

        @keyframes star-form {
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
          gap: 20px;
          position: relative;
        }

        .star-section {
          position: relative;
          width: 140px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .beam-container {
          position: absolute;
          top: 45%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);
          animation: beam-rotate 12s linear infinite;
          opacity: 0;
          transition: opacity 1s ease 0.5s;
        }

        .main-content.visible .beam-container { opacity: 1; }

        .beam {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          background: linear-gradient(to bottom, rgba(200, 220, 255, 0.9), transparent 100%);
          transform-origin: top center;
        }

        .beam-1 { height: 90px; transform: translate(-50%, 0) rotate(0deg); }
        .beam-2 { height: 75px; transform: translate(-50%, 0) rotate(60deg); }
        .beam-3 { height: 85px; transform: translate(-50%, 0) rotate(120deg); }
        .beam-4 { height: 70px; transform: translate(-50%, 0) rotate(180deg); }
        .beam-5 { height: 88px; transform: translate(-50%, 0) rotate(240deg); }
        .beam-6 { height: 78px; transform: translate(-50%, 0) rotate(300deg); }

        @keyframes beam-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .glow-ring {
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(200, 220, 255, 0.2);
          border-radius: 50%;
          animation: ring-expand 1.8s ease-in-out infinite;
          opacity: 0;
          transition: opacity 1s ease 0.8s;
        }

        .main-content.visible .glow-ring { opacity: 1; }

        .ring-1 { width: 60px; height: 60px; }
        .ring-2 { width: 85px; height: 85px; animation-delay: 0.2s; }
        .ring-3 { width: 110px; height: 110px; animation-delay: 0.4s; }

        @keyframes ring-expand {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.15); }
        }

        .star-crystalline {
          position: relative;
          width: 100px;
          height: 150px;
          z-index: 10;
        }

        .star-crystalline svg {
          width: 100%;
          height: 100%;
          animation: crystalline-pulse 1.8s ease-in-out infinite;
          filter: drop-shadow(0 0 25px rgba(200, 220, 255, 0.6));
        }

        .glass-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 150%;
          height: 100%;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255, 255, 255, 0.15) 35%,
            rgba(255, 255, 255, 0.4) 40%,
            rgba(255, 255, 255, 0.15) 45%,
            transparent 60%
          );
          animation: glass-sweep 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 20;
        }

        @keyframes glass-sweep {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }

        .orange-glow {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70px;
          height: 70px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.5) 0%, rgba(255, 107, 53, 0.15) 50%, transparent 70%);
          filter: blur(15px);
          z-index: -1;
          animation: orange-pulse 1.8s ease-in-out infinite;
        }

        .black-base {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 12px;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
          filter: blur(6px);
        }

        .inner-glow {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200, 220, 255, 0.6) 40%, transparent 70%);
          animation: inner-beat 1.8s ease-in-out infinite;
          z-index: 5;
        }

        @keyframes crystalline-pulse {
          0%, 100% { filter: drop-shadow(0 0 25px rgba(200, 220, 255, 0.5)); }
          50% {
            filter: drop-shadow(0 0 40px rgba(200, 220, 255, 0.9))
                   drop-shadow(0 0 60px rgba(180, 200, 255, 0.5))
                   drop-shadow(0 0 90px rgba(160, 180, 255, 0.3));
          }
        }

        @keyframes orange-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.25); }
        }

        @keyframes inner-beat {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
        }

        .connector {
          width: 40px;
          height: 2px;
          background: linear-gradient(to right, rgba(200, 220, 255, 0.8), rgba(200, 220, 255, 0.4));
          animation: connector-glow 1.8s ease-in-out infinite;
          opacity: 0;
          transform: scaleX(0);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
          margin-bottom: 40px;
        }

        .main-content.visible .connector {
          opacity: 1;
          transform: scaleX(1);
        }

        @keyframes connector-glow {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 10px rgba(200, 220, 255, 0.3); }
          50% { opacity: 1; box-shadow: 0 0 25px rgba(200, 220, 255, 0.7); }
        }

        .text-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .logo-text {
          display: flex;
          gap: 4px;
          font-size: clamp(2.5rem, 10vw, 4rem);
          font-weight: 900;
          letter-spacing: 0.15em;
          margin: 0;
        }

        .glass-letter {
          position: relative;
          color: transparent;
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #c8dcff 40%,
            #ffffff 50%,
            #a8c4ff 60%,
            #ffffff 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(200, 220, 255, 0.5));
          animation: letter-glow 1.8s ease-in-out infinite;
        }

        .glass-letter:nth-child(1) { animation-delay: 0s; }
        .glass-letter:nth-child(2) { animation-delay: 0.1s; }
        .glass-letter:nth-child(3) { animation-delay: 0.2s; }
        .glass-letter:nth-child(4) { animation-delay: 0.3s; }

        @keyframes letter-glow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(200, 220, 255, 0.4)); }
          50% {
            filter: drop-shadow(0 0 30px rgba(200, 220, 255, 0.8))
                   drop-shadow(0 0 50px rgba(200, 220, 255, 0.4));
          }
        }

        .tagline {
          font-size: 0.7rem;
          letter-spacing: 0.35em;
          color: #FF6B35;
          text-transform: uppercase;
          margin-top: 8px;
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
          opacity: 0;
          transition: opacity 0.8s ease 0.6s;
        }

        .main-content.visible .tagline { opacity: 1; }

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
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 600;
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
          font-size: 11px;
          color: rgba(255, 255, 255, 0.35);
          text-decoration: none;
          transition: all 0.3s ease;
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
          font-weight: 600;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.3);
          text-shadow: 0 0 10px rgba(200, 220, 255, 0.3);
        }

        .company-tagline {
          font-size: 9px;
          font-weight: 600;
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
            flex-direction: column;
            gap: 10px;
          }

          .connector {
            width: 2px;
            height: 30px;
            margin-bottom: 0;
            background: linear-gradient(to bottom, rgba(200, 220, 255, 0.8), rgba(200, 220, 255, 0.4));
          }

          .text-section {
            align-items: center;
            margin-bottom: 0;
          }

          .star-section {
            width: 120px;
            height: 170px;
          }

          .star-crystalline {
            width: 85px;
            height: 125px;
          }

          .logo-text {
            font-size: 2.2rem;
          }

          .tagline {
            text-align: center;
          }

          .cta-container {
            flex-direction: column;
            width: 100%;
            padding: 0 24px;
          }

          .cta-btn {
            width: 100%;
          }

          .beam-1 { height: 70px; }
          .beam-2 { height: 58px; }
          .beam-3 { height: 65px; }
          .beam-4 { height: 55px; }
          .beam-5 { height: 68px; }
          .beam-6 { height: 60px; }

          .ring-1 { width: 45px; height: 45px; }
          .ring-2 { width: 65px; height: 65px; }
          .ring-3 { width: 85px; height: 85px; }

          .forming-star {
            width: 80px;
            height: 120px;
          }
        }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .sparkle,
          .center-glow,
          .forming-star,
          .beam-container,
          .star-crystalline svg,
          .orange-glow,
          .inner-glow,
          .glow-ring,
          .glass-shine,
          .btn-shine,
          .glass-letter {
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

function FormingStarSVG() {
  return (
    <svg viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="forming-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#c8dcff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <polygon
        points="50,0 53,48 85,22 58,54 100,58 58,62 85,92 53,70 50,150 47,70 15,92 42,62 0,58 42,54 15,22 47,48"
        fill="url(#forming-grad)"
      />
    </svg>
  );
}

function CrystallineStarSVG() {
  return (
    <svg viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="crystalline-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#e8f0ff" />
          <stop offset="50%" stopColor="#c8dcff" />
          <stop offset="70%" stopColor="#e8f0ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <polygon
        points="50,0 53,48 85,22 58,54 100,58 58,62 85,92 53,70 50,150 47,70 15,92 42,62 0,58 42,54 15,22 47,48"
        fill="url(#crystalline-grad)"
      />
    </svg>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [phase, setPhase] = useState<'stars' | 'flash' | 'logo'>('stars');

  useEffect(() => {
    // Stars fly and stack: 3s
    // Flash: 3.2s
    // Logo reveal: 3.8s
    const flashTimer = setTimeout(() => setPhase('flash'), 3200);
    const logoTimer = setTimeout(() => setPhase('logo'), 3800);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(logoTimer);
    };
  }, []);

  // Skip animation on tap
  const handleSkip = () => {
    if (phase !== 'logo') {
      setPhase('logo');
    }
  };

  return (
    <div className="landing-container" onClick={handleSkip}>
      {/* Ambient background */}
      <div className="ambient" />

      {/* Flying Stars - Paramount Formation */}
      <div className={`stars-stage ${phase !== 'stars' ? 'hidden' : ''}`}>
        {/* Star 1 - White - leads the formation */}
        <div className="star star-1">
          <StarSVG color1="#ffffff" color2="#e8e8e8" />
        </div>
        {/* Star 2 - Orange - follows */}
        <div className="star star-2">
          <StarSVG color1="#FF8C42" color2="#FF6B35" />
        </div>
        {/* Star 3 - Black - follows */}
        <div className="star star-3">
          <StarSVG color1="#3a3a3a" color2="#1a1a1a" />
        </div>
        {/* Star 4 - Gold - trails */}
        <div className="star star-4">
          <StarSVG color1="#FFE55C" color2="#FFD700" />
        </div>
      </div>

      {/* White Flash */}
      <div className={`flash-overlay ${phase === 'flash' ? 'active' : ''}`} />

      {/* Logo Reveal */}
      <div className={`logo-stage ${phase === 'logo' ? 'visible' : ''}`}>
        <div className="logo-star">
          <StarSVG color1="#ffffff" color2="#c8dcff" />
          <div className="star-glow" />
        </div>
        <h1 className="logo-text">SLTR</h1>
        <p className="tagline">RULES DON&apos;T APPLY</p>

        <div className="cta-buttons">
          <Link href="/signup" className="cta-primary">Get Started</Link>
          <Link href="/login" className="cta-secondary">Sign In</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className={`landing-footer ${phase === 'logo' ? 'visible' : ''}`}>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/guidelines">Guidelines</Link>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing-container {
          position: fixed;
          inset: 0;
          background: #050508;
          overflow: hidden;
          font-family: 'Orbitron', sans-serif;
          cursor: pointer;
        }

        /* Ambient glow */
        .ambient {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 40%, rgba(200, 220, 255, 0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ============================================
           STARS FLYING IN FORMATION
           ============================================ */
        .stars-stage {
          position: absolute;
          inset: 0;
          transition: opacity 0.3s ease;
        }

        .stars-stage.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .star {
          position: absolute;
          width: 50px;
          height: 75px;
          opacity: 0;
          filter: drop-shadow(0 0 20px currentColor);
        }

        .star svg {
          width: 100%;
          height: 100%;
        }

        /* Formation flight - arc from left to center */
        .star-1 {
          color: rgba(255, 255, 255, 0.8);
          animation: fly-star1 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }

        .star-2 {
          color: rgba(255, 107, 53, 0.8);
          animation: fly-star2 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          animation-delay: 0.12s;
        }

        .star-3 {
          color: rgba(100, 100, 100, 0.6);
          animation: fly-star3 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          animation-delay: 0.24s;
        }

        .star-4 {
          color: rgba(255, 215, 0, 0.8);
          animation: fly-star4 3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          animation-delay: 0.36s;
        }

        /* Star 1 - highest arc */
        @keyframes fly-star1 {
          0% {
            opacity: 0;
            transform: translate(-15vw, 50vh) scale(0.4);
          }
          8% { opacity: 1; }
          30% {
            transform: translate(10vw, 15vh) scale(0.6);
          }
          60% {
            transform: translate(35vw, 5vh) scale(0.8);
          }
          85% {
            transform: translate(calc(50vw - 25px), calc(50vh - 40px)) scale(1);
          }
          100% {
            opacity: 1;
            transform: translate(calc(50vw - 25px), calc(50vh - 40px)) scale(1.1);
          }
        }

        /* Star 2 - mid-high arc */
        @keyframes fly-star2 {
          0% {
            opacity: 0;
            transform: translate(-15vw, 55vh) scale(0.4);
          }
          8% { opacity: 1; }
          30% {
            transform: translate(8vw, 22vh) scale(0.6);
          }
          60% {
            transform: translate(32vw, 12vh) scale(0.8);
          }
          85% {
            transform: translate(calc(50vw - 25px), calc(50vh - 40px)) scale(1);
          }
          100% {
            opacity: 1;
            transform: translate(calc(50vw - 25px), calc(50vh - 40px)) scale(1.1);
          }
        }

        /* Star 3 - mid-low arc */
        @keyframes fly-star3 {
          0% {
            opacity: 0;
            transform: translate(-15vw, 60vh) scale(0.4);
          }
          8% { opacity: 1; }
          30% {
            transform: translate(5vw, 30vh) scale(0.6);
          }
          60% {
            transform: translate(28vw, 22vh) scale(0.8);
          }
          85% {
            transform: translate(calc(50vw - 25px), calc(50vh - 40px)) scale(1);
          }
          100% {
            opacity: 1;
            transform: translate(calc(50vw - 25px), calc(50vh - 40px)) scale(1.1);
          }
        }

        /* Star 4 - lowest arc */
        @keyframes fly-star4 {
          0% {
            opacity: 0;
            transform: translate(-15vw, 65vh) scale(0.4);
          }
          8% { opacity: 1; }
          30% {
            transform: translate(2vw, 40vh) scale(0.6);
          }
          60% {
            transform: translate(24vw, 32vh) scale(0.8);
          }
          85% {
            transform: translate(calc(50vw - 25px), calc(50vh - 40px)) scale(1);
          }
          100% {
            opacity: 1;
            transform: translate(calc(50vw - 25px), calc(50vh - 40px)) scale(1.1);
          }
        }

        /* ============================================
           WHITE FLASH
           ============================================ */
        .flash-overlay {
          position: fixed;
          inset: 0;
          background: white;
          opacity: 0;
          pointer-events: none;
          z-index: 100;
        }

        .flash-overlay.active {
          animation: flash-burst 0.6s ease-out forwards;
        }

        @keyframes flash-burst {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* ============================================
           LOGO REVEAL
           ============================================ */
        .logo-stage {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 50;
        }

        .logo-stage.visible {
          opacity: 1;
          transform: scale(1);
        }

        .logo-star {
          position: relative;
          width: 120px;
          height: 180px;
          margin-bottom: 30px;
          animation: star-pulse 2s ease-in-out infinite;
        }

        .logo-star svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 30px rgba(200, 220, 255, 0.6));
        }

        .star-glow {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.4) 0%, transparent 70%);
          filter: blur(15px);
          animation: glow-pulse 2s ease-in-out infinite;
        }

        @keyframes star-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(200, 220, 255, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 50px rgba(200, 220, 255, 0.8))
                   drop-shadow(0 0 80px rgba(200, 220, 255, 0.4));
          }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
        }

        .logo-text {
          font-size: clamp(48px, 15vw, 100px);
          font-weight: 900;
          letter-spacing: 0.3em;
          color: #fff;
          text-shadow:
            0 0 30px rgba(200, 220, 255, 0.5),
            0 0 60px rgba(200, 220, 255, 0.3);
          margin-bottom: 15px;
          animation: text-glow 2s ease-in-out infinite;
        }

        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 30px rgba(200, 220, 255, 0.4); }
          50% { text-shadow: 0 0 50px rgba(200, 220, 255, 0.7), 0 0 80px rgba(200, 220, 255, 0.4); }
        }

        .tagline {
          font-size: 12px;
          letter-spacing: 0.4em;
          color: #FF6B35;
          margin-bottom: 50px;
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
        }

        /* CTA Buttons */
        .cta-buttons {
          display: flex;
          gap: 16px;
        }

        .cta-primary, .cta-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 52px;
          padding: 0 32px;
          border-radius: 14px;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(20px);
        }

        .cta-primary {
          background: rgba(255, 107, 53, 0.2);
          border: 1px solid rgba(255, 107, 53, 0.5);
          color: #FF6B35;
        }

        .cta-primary:hover {
          background: rgba(255, 107, 53, 0.3);
          border-color: #FF6B35;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(255, 107, 53, 0.3);
        }

        .cta-secondary {
          background: rgba(40, 40, 50, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
        }

        .cta-secondary:hover {
          background: rgba(255, 107, 53, 0.1);
          border-color: rgba(255, 107, 53, 0.3);
          color: #FF6B35;
          transform: translateY(-2px);
        }

        /* Footer */
        .landing-footer {
          position: fixed;
          bottom: 24px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 24px;
          opacity: 0;
          transition: opacity 0.8s ease 0.5s;
          z-index: 60;
        }

        .landing-footer.visible {
          opacity: 1;
        }

        .landing-footer a {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.3);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .landing-footer a:hover {
          color: #FF6B35;
        }

        /* Mobile */
        @media (max-width: 600px) {
          .star {
            width: 35px;
            height: 52px;
          }

          .logo-star {
            width: 80px;
            height: 120px;
          }

          .cta-buttons {
            flex-direction: column;
            width: 100%;
            padding: 0 24px;
          }

          .cta-primary, .cta-secondary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

// Star SVG Component
function StarSVG({ color1, color2 }: { color1: string; color2: string }) {
  const id = `grad-${color1.replace('#', '')}`;
  return (
    <svg viewBox="0 0 100 150">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="50%" stopColor={color2} />
          <stop offset="100%" stopColor={color1} />
        </linearGradient>
      </defs>
      <polygon
        points="50,0 53,48 85,22 58,54 100,58 58,62 85,92 53,70 50,150 47,70 15,92 42,62 0,58 42,54 15,22 47,48"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

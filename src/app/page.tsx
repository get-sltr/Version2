'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Show content after brief delay for smooth entrance
    const contentTimer = setTimeout(() => setShowContent(true), 300);

    // Handle video load state
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => setIsLoaded(true);
      video.addEventListener('canplay', handleCanPlay);

      // Fallback: show content even if video takes too long
      const fallbackTimer = setTimeout(() => setIsLoaded(true), 2000);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        clearTimeout(fallbackTimer);
        clearTimeout(contentTimer);
      };
    }

    return () => clearTimeout(contentTimer);
  }, []);

  return (
    <div className="landing-container">
      {/* Video Background */}
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className={`bg-video ${isLoaded ? 'loaded' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          poster="/images/landing-poster.jpg"
        >
          <source src="/Videos/landingvid.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay */}
        <div className="video-overlay" />
      </div>

      {/* Main Content */}
      <main className={`content ${showContent ? 'visible' : ''}`}>
        {/* Logo Star */}
        <div className="logo-star">
          <StarSVG />
          <div className="star-glow" />
        </div>

        {/* Brand */}
        <h1 className="brand">SLTR</h1>
        <p className="tagline">RULES DON&apos;T APPLY</p>

        {/* CTA Buttons */}
        <div className="cta-group">
          <Link href="/signup" className="btn btn-primary">
            Get Started
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Sign In
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className={`footer ${showContent ? 'visible' : ''}`}>
        <Link href="/privacy">Privacy</Link>
        <span className="dot">·</span>
        <Link href="/terms">Terms</Link>
        <span className="dot">·</span>
        <Link href="/about">About</Link>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          overflow: hidden;
        }

        .landing-container {
          position: fixed;
          inset: 0;
          background: #000;
          font-family: 'Orbitron', sans-serif;
          overflow: hidden;
        }

        /* ============================================
           VIDEO BACKGROUND
           ============================================ */
        .video-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

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
          transition: opacity 1.5s ease;
        }

        .bg-video.loaded {
          opacity: 1;
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.4) 0%,
            rgba(0, 0, 0, 0.2) 30%,
            rgba(0, 0, 0, 0.3) 70%,
            rgba(0, 0, 0, 0.7) 100%
          );
          pointer-events: none;
        }

        /* ============================================
           MAIN CONTENT
           ============================================ */
        .content {
          position: relative;
          z-index: 10;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .content.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ============================================
           LOGO STAR
           ============================================ */
        .logo-star {
          position: relative;
          width: 100px;
          height: 150px;
          margin-bottom: 24px;
          animation: float 4s ease-in-out infinite;
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
          width: 50px;
          height: 50px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.5) 0%, transparent 70%);
          filter: blur(12px);
          animation: glow-pulse 2s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
        }

        /* ============================================
           BRAND TEXT
           ============================================ */
        .brand {
          font-size: clamp(56px, 18vw, 120px);
          font-weight: 900;
          letter-spacing: 0.25em;
          color: #fff;
          text-shadow:
            0 0 40px rgba(200, 220, 255, 0.4),
            0 4px 20px rgba(0, 0, 0, 0.5);
          margin-bottom: 8px;
          animation: text-breathe 3s ease-in-out infinite;
        }

        @keyframes text-breathe {
          0%, 100% {
            text-shadow: 0 0 40px rgba(200, 220, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.5);
          }
          50% {
            text-shadow: 0 0 60px rgba(200, 220, 255, 0.5), 0 0 100px rgba(200, 220, 255, 0.2), 0 4px 20px rgba(0, 0, 0, 0.5);
          }
        }

        .tagline {
          font-size: clamp(10px, 3vw, 14px);
          letter-spacing: 0.5em;
          color: #FF6B35;
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
          margin-bottom: 48px;
        }

        /* ============================================
           CTA BUTTONS
           ============================================ */
        .cta-group {
          display: flex;
          gap: 16px;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 54px;
          padding: 0 36px;
          border-radius: 16px;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .btn-primary {
          background: rgba(255, 107, 53, 0.25);
          border: 1.5px solid rgba(255, 107, 53, 0.6);
          color: #FF6B35;
          box-shadow: 0 4px 24px rgba(255, 107, 53, 0.15);
        }

        .btn-primary:hover {
          background: rgba(255, 107, 53, 0.4);
          border-color: #FF6B35;
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(255, 107, 53, 0.35);
        }

        .btn-primary:active {
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
          color: #fff;
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:active {
          transform: translateY(-1px);
        }

        /* ============================================
           FOOTER
           ============================================ */
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
          opacity: 0;
          transition: opacity 0.8s ease 0.3s;
          z-index: 20;
        }

        .footer.visible {
          opacity: 1;
        }

        .footer a {
          font-size: 11px;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer a:hover {
          color: #FF6B35;
        }

        .footer .dot {
          color: rgba(255, 255, 255, 0.2);
          font-size: 10px;
        }

        /* ============================================
           MOBILE RESPONSIVE
           ============================================ */
        @media (max-width: 600px) {
          .logo-star {
            width: 70px;
            height: 105px;
            margin-bottom: 20px;
          }

          .tagline {
            margin-bottom: 36px;
          }

          .cta-group {
            flex-direction: column;
            width: 100%;
            max-width: 280px;
          }

          .btn {
            width: 100%;
            height: 52px;
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .logo-star,
          .star-glow,
          .brand {
            animation: none;
          }

          .bg-video {
            transition: none;
          }

          .content,
          .footer {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

// Star SVG Component
function StarSVG() {
  return (
    <svg viewBox="0 0 100 150" aria-hidden="true">
      <defs>
        <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#c8dcff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <polygon
        points="50,0 53,48 85,22 58,54 100,58 58,62 85,92 53,70 50,150 47,70 15,92 42,62 0,58 42,54 15,22 47,48"
        fill="url(#star-grad)"
      />
    </svg>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { AgeGate } from '@/components/AgeGate';

const IS_NATIVE = typeof window !== 'undefined' && Capacitor.isNativePlatform();

export default function LandingPage() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => setVideoLoaded(true);
      video.addEventListener('canplay', handleCanPlay);
      video.muted = true;
      video.play().catch(() => {});
      // Longer fallback on native — WKWebView may be slower to load video
      const fallback = setTimeout(() => setVideoLoaded(true), IS_NATIVE ? 5000 : 2000);
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        clearTimeout(fallback);
      };
    }
  }, []);

  return (
    <AgeGate>
    <div className="landing-container">
      {/* Video Background */}
      <div className="video-wrapper">
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

      {/* Main Content — visible immediately */}
      <main className="main-content visible">
        <h1 className="sr-only">Gay &amp; Bisexual Men Dating App for Connections – Primal</h1>
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
      <footer className="landing-footer visible">
        <div className="footer-links">
          <Link href="/blog">Blog</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/complaints">Complaints</Link>
          <Link href="/about">About</Link>
        </div>
        <div className="footer-brand">
          <span className="company-name">PRIMAL MEN</span>
          <span className="company-tagline">YOUR BURNING DESIRE, UNLEASHED.</span>
        </div>
      </footer>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; overflow: hidden; }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .landing-container {
          position: fixed;
          inset: 0;
          background: #000;
          font-family: var(--font-orbitron, 'Audiowide', sans-serif);
          overflow: hidden;
        }

        /* ===========================================
           VIDEO BACKGROUND
           =========================================== */
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
          transition: opacity 1s ease;
        }

        .bg-video.loaded { opacity: 1; }

        /* Hide ALL native video controls */
        .bg-video::-webkit-media-controls,
        .bg-video::-webkit-media-controls-start-playback-button,
        .bg-video::-webkit-media-controls-panel,
        .bg-video::-webkit-media-controls-play-button,
        .bg-video::-webkit-media-controls-overlay-play-button,
        .bg-video::-internal-media-controls-overlay-cast-button {
          display: none !important;
          -webkit-appearance: none;
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
          opacity: 1;
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
          font-family: var(--font-orbitron, 'Audiowide', sans-serif);
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
          z-index: 60;
        }

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
        }

        @media (prefers-reduced-motion: reduce) {
          .btn-shine {
            animation: none;
          }
        }
      `}</style>
    </div>
    </AgeGate>
  );
}

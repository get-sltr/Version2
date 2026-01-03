'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { MatrixRain } from '../components/landing/MatrixRain';
import { CapsuleButton } from '../components/landing/CapsuleButton';
import { LightBulbFlicker } from '../components/landing/LightBulbFlicker';
import { RevealContainer } from '../components/landing/RevealText';

export default function LandingPage() {
  const [showRain, setShowRain] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [lightsActive, setLightsActive] = useState(false);
  const [sltrLetters, setSltrLetters] = useState<string[]>([]);

  const handleRevealComplete = useCallback(() => {
    setShowRain(false);
    setSltrLetters(['s', 'l', 't', 'r']);

    setTimeout(() => {
      setLightsActive(true);
      setTimeout(() => {
        setIsRevealed(true);
      }, 400);
    }, 300);
  }, []);

  const handleButtonClick = () => {
    setLightsActive(false);
    setTimeout(() => setLightsActive(true), 50);
  };

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#FFFFFF',
        minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background Image - 002.webp */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
        }}
      >
        <Image
          src="/002.webp"
          alt="Background"
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: 'center top',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        />
      </div>

      {/* Light Bulb Flicker Effect */}
      <LightBulbFlicker isActive={lightsActive} intensity={0.9} />

      {/* Matrix Rain Effect */}
      <AnimatePresence>
        {showRain && (
          <MatrixRain onRevealComplete={handleRevealComplete} targetText="sltr" />
        )}
      </AnimatePresence>


      {/* Hero Section */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
          padding: '120px 24px 80px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* sltr letters */}
          <motion.h1
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(64px, 18vw, 200px)',
              fontWeight: 700,
              letterSpacing: '0.2em',
              lineHeight: 0.9,
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.05em',
            }}
          >
            {sltrLetters.map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: -50, scale: 1.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: index * 0.15,
                }}
                style={{
                  display: 'inline-block',
                  color: '#FFFFFF',
                  textShadow: `
                    0 0 20px rgba(255, 107, 53, 0.8),
                    0 0 40px rgba(255, 107, 53, 0.5),
                    0 0 60px rgba(255, 107, 53, 0.3),
                    0 0 100px rgba(255, 107, 53, 0.2)
                  `,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>

          {/* Tagline */}
          <RevealContainer isRevealed={isRevealed} delay={0.2}>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#FF6B35',
                marginBottom: '40px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                textShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
              }}
            >
              Rules Don't Apply
            </p>
          </RevealContainer>

          {/* Subtitle */}
          <RevealContainer isRevealed={isRevealed} delay={0.4}>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: '400px',
                margin: '0 auto 48px',
                lineHeight: 1.8,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Built for connection. Designed without compromise.
            </p>
          </RevealContainer>

          {/* CTA Buttons - Capsule Style */}
          <RevealContainer isRevealed={isRevealed} delay={0.6}>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <CapsuleButton href="/signup" variant="primary" size="large" onClick={handleButtonClick}>
                Join SLTR
              </CapsuleButton>
              <CapsuleButton href="/login" variant="secondary" size="large" onClick={handleButtonClick}>
                Log in
              </CapsuleButton>
            </div>
          </RevealContainer>
        </div>

        {/* Scroll Indicator - More Glowing */}
        <RevealContainer isRevealed={isRevealed} delay={1}>
          <motion.div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <motion.span
              animate={{
                opacity: [0.5, 1, 0.5],
                textShadow: [
                  '0 0 10px rgba(255, 107, 53, 0.3)',
                  '0 0 20px rgba(255, 107, 53, 0.8)',
                  '0 0 10px rgba(255, 107, 53, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                fontSize: '10px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
                color: '#FF6B35',
              }}
            >
              Scroll
            </motion.span>
            <motion.div
              animate={{
                y: [0, 10, 0],
                boxShadow: [
                  '0 0 10px rgba(255, 107, 53, 0.3)',
                  '0 0 25px rgba(255, 107, 53, 0.8)',
                  '0 0 10px rgba(255, 107, 53, 0.3)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '2px',
                height: '50px',
                backgroundColor: '#FF6B35',
                borderRadius: '2px',
              }}
            />
          </motion.div>
        </RevealContainer>
      </section>

      {/* Content Sections */}
      <section
        style={{
          padding: '160px 24px',
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '48px',
            }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 10px #FF6B35', '0 0 25px #FF6B35', '0 0 10px #FF6B35'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '48px', height: '2px', backgroundColor: '#FF6B35' }}
            />
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#FF6B35',
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              The Problem
            </span>
          </motion.div>

          <div style={{ fontSize: '18px', lineHeight: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ marginBottom: '32px', color: '#FFFFFF' }}
            >
              The apps we grew up with didn't start broken.{' '}
              <span style={{ color: '#FF6B35', fontWeight: 600 }}>They became broken.</span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ marginBottom: '32px' }}
            >
              What began as spaces for connection slowly turned into subscription traps.
              Features that once felt basic are now locked behind paywalls.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              And some platforms quietly decide who belongs.{' '}
              <span style={{ color: '#FF6B35', fontWeight: 600 }}>
                That's a club with a dress code.
              </span>
            </motion.p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section
        style={{
          padding: '120px 24px',
          backgroundColor: '#FF6B35',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
        >
          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(24px, 4vw, 40px)',
              fontWeight: 500,
              color: '#000000',
              lineHeight: 1.4,
            }}
          >
            "sltr exists because that didn't sit right with me."
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section
        style={{
          padding: '160px 24px',
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '64px',
            }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 10px #FF6B35', '0 0 25px #FF6B35', '0 0 10px #FF6B35'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '48px', height: '2px', backgroundColor: '#FF6B35' }}
            />
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#FF6B35',
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              What SLTR Is
            </span>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              { icon: '◎', title: 'For Everyone', desc: 'No judgment. No gatekeeping. Express yourself honestly.' },
              { icon: '▶', title: 'Built-in Video', desc: 'One tap. See who\'s on the other end.' },
              { icon: '⬡', title: 'Group Rooms', desc: 'Host hundreds. Shared presence. Shared moments.' },
              { icon: '◈', title: 'Your Privacy', desc: 'Your terms. No invasive verification.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{
                  y: -5,
                  boxShadow: '0 20px 60px rgba(255, 107, 53, 0.2), 0 0 30px rgba(255, 107, 53, 0.1)',
                }}
                style={{
                  padding: '32px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255, 107, 53, 0.1)',
                  borderRadius: '16px',
                  cursor: 'default',
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: ['0 0 15px rgba(255, 107, 53, 0.3)', '0 0 30px rgba(255, 107, 53, 0.6)', '0 0 15px rgba(255, 107, 53, 0.3)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 107, 53, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    fontSize: '20px',
                    color: '#FF6B35',
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    marginBottom: '12px',
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.7, fontSize: '14px' }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          padding: '200px 24px',
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 100px rgba(255, 107, 53, 0.2)',
              '0 0 150px rgba(255, 107, 53, 0.4)',
              '0 0 100px rgba(255, 107, 53, 0.2)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(36px, 7vw, 72px)',
              fontWeight: 600,
              marginBottom: '24px',
              lineHeight: 1.1,
            }}
          >
            Ready to{' '}
            <span style={{
              color: '#FF6B35',
              textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
            }}>connect</span>?
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '48px',
              maxWidth: '400px',
              margin: '0 auto 48px',
              lineHeight: 1.8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Join sltr and experience what connection should feel like.
          </p>
          <CapsuleButton href="/signup" variant="primary" size="large" onClick={handleButtonClick}>
            Join SLTR
          </CapsuleButton>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '48px 24px',
          borderTop: '1px solid rgba(255, 107, 53, 0.1)',
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#000000',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          {['Privacy', 'Terms', 'Guidelines', 'Cookies', 'Security', 'DMCA'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {item}
            </Link>
          ))}
        </div>
        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.3)',
            textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          © 2025 SLTR Digital LLC
        </p>
      </footer>
    </div>
  );
}

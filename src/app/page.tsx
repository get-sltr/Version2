"use client"

import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingPage() {
  const { darkMode, toggleDarkMode, colors } = useTheme();

  return (
    <main style={{
      backgroundColor: colors.background,
      color: colors.text,
      minHeight: '100vh',
      overflowX: 'hidden',
      fontFamily: "'Space Mono', monospace"
    }}>

      {/* Header - Mobile Optimized */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        background: darkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          flexShrink: 0
        }}>
          <img
            src="/icons/icon-192x192.png"
            alt="SLTR"
            style={{
              height: '40px',
              width: 'auto'
            }}
          />
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            style={{
              background: 'none',
              border: `1px solid ${colors.border}`,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: colors.text,
              flexShrink: 0
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀' : '☾'}
          </button>
          <Link href="/login" style={{
            fontSize: '13px',
            color: colors.text,
            textDecoration: 'none',
            fontWeight: 500,
            opacity: 0.7,
            fontFamily: "'Space Mono', monospace",
            whiteSpace: 'nowrap'
          }}>
            Log in
          </Link>
          {/* Lit Orange Button */}
          <Link href="/signup" style={{
            position: 'relative',
            fontSize: '13px',
            color: '#fff',
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 50%, #FF6B35 100%)',
            padding: '12px 24px',
            textDecoration: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            fontFamily: "'Space Mono', monospace",
            boxShadow: '0 4px 20px rgba(255,107,53,0.4), 0 0 40px rgba(255,107,53,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,107,53,0.6)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
              borderRadius: '7px 7px 0 0',
              pointerEvents: 'none'
            }} />
            <span style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: '#FF6B35',
              boxShadow: '0 0 15px rgba(255,107,53,1), 0 0 30px rgba(255,107,53,0.6)',
              pointerEvents: 'none'
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>Sign up</span>
          </Link>
        </div>
      </header>

      {/* Hero Section - Mobile Optimized */}
      <section style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '100px 24px 60px',
        overflow: 'hidden'
      }}>
        {/* Faded background image */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/images/4.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: darkMode ? 0.15 : 0.1,
          pointerEvents: 'none'
        }} />
        {/* Gradient overlay for text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode
            ? 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.9) 100%)',
          pointerEvents: 'none'
        }} />
        {/* Gradient orb */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${darkMode ? 'rgba(255,107,53,0.25)' : 'rgba(255,107,53,0.15)'} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />

        <p style={{
          fontSize: '11px',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: colors.accent,
          marginBottom: '20px',
          fontWeight: 600,
          fontFamily: "'Space Mono', monospace",
          textShadow: darkMode ? '0 0 20px rgba(255,107,53,0.5)' : 'none'
        }}>
          Rules Don't Apply
        </p>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(48px, 12vw, 120px)',
          fontWeight: 300,
          letterSpacing: '0.2em',
          textAlign: 'center',
          lineHeight: 1,
          marginBottom: '28px',
          color: colors.text,
          position: 'relative',
          zIndex: 1
        }}>
          S L T R
        </h1>

        <p style={{
          fontSize: '15px',
          color: colors.textSecondary,
          maxWidth: '340px',
          textAlign: 'center',
          lineHeight: 1.7,
          fontFamily: "'Space Mono', monospace",
          padding: '0 20px'
        }}>
          Built for connection. Designed without compromise.
        </p>

        {/* CTA Button in Hero */}
        <Link href="/signup" style={{
          position: 'relative',
          marginTop: '40px',
          fontSize: '14px',
          color: '#fff',
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 50%, #FF6B35 100%)',
          padding: '16px 40px',
          textDecoration: 'none',
          fontWeight: 700,
          borderRadius: '10px',
          fontFamily: "'Space Mono', monospace",
          boxShadow: '0 8px 30px rgba(255,107,53,0.5), 0 0 60px rgba(255,107,53,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
          border: '1px solid rgba(255,133,85,0.6)',
          overflow: 'hidden',
          textTransform: 'uppercase',
          letterSpacing: '0.15em'
        }}>
          <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            borderRadius: '9px 9px 0 0',
            pointerEvents: 'none'
          }} />
          <span style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#FF6B35',
            boxShadow: '0 0 20px rgba(255,107,53,1), 0 0 40px rgba(255,107,53,0.7), 0 0 60px rgba(255,107,53,0.4)',
            pointerEvents: 'none'
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>Get Started</span>
        </Link>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.35
        }}>
          <span style={{
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: "'Space Mono', monospace"
          }}>
            Scroll
          </span>
          <div style={{
            width: '1px',
            height: '30px',
            background: `linear-gradient(to bottom, ${colors.text}, transparent)`
          }} />
        </div>
      </section>

      {/* The Problem Section */}
      <section style={{
        padding: '80px 24px',
        background: colors.surface
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ width: '32px', height: '2px', background: colors.accent }} />
            <span style={{
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.accent,
              fontFamily: "'Space Mono', monospace",
              fontWeight: 600
            }}>
              The Problem
            </span>
          </div>

          <div style={{ fontSize: '17px', lineHeight: 1.8, color: colors.text }}>
            <p style={{ marginBottom: '24px' }}>
              The apps we grew up with didn't start broken. <span style={{ fontWeight: 600 }}>They became broken.</span>
            </p>

            <p style={{ marginBottom: '24px', color: colors.textSecondary }}>
              What began as spaces for connection slowly turned into subscription traps. Features that once felt basic are now locked behind paywalls.
            </p>

            <p style={{ marginBottom: '24px', color: colors.textSecondary }}>
              Then came the bots. The fake profiles. The endless spam. You open an app hoping to connect with real people and end up dodging scams.
            </p>

            <p style={{ color: colors.textSecondary }}>
              And some platforms quietly decide who belongs. <span style={{ color: colors.accent, fontWeight: 600 }}>That's a club with a dress code.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section style={{
        padding: '60px 24px',
        background: colors.accent,
        position: 'relative'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(24px, 6vw, 40px)',
            fontWeight: 400,
            color: '#000',
            textAlign: 'center',
            lineHeight: 1.4,
            fontStyle: 'italic'
          }}>
            "SLTR exists because that didn't sit right with me."
          </p>
        </div>
      </section>

      {/* Core Value Section */}
      <section style={{
        padding: '80px 24px',
        background: colors.background
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ width: '32px', height: '2px', background: colors.accent }} />
            <span style={{
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.accent,
              fontFamily: "'Space Mono', monospace",
              fontWeight: 600
            }}>
              The One Thing
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(40px, 10vw, 72px)',
            fontWeight: 400,
            marginBottom: '32px',
            lineHeight: 1,
            color: colors.accent
          }}>
            Connection.
          </h2>

          <div style={{ fontSize: '16px', lineHeight: 1.8, color: colors.textSecondary }}>
            <p style={{ marginBottom: '20px' }}>
              Not matches. Not metrics. Not engagement tricks.
            </p>

            <p style={{ marginBottom: '20px' }}>
              Everything in SLTR is built from that mindset. If it doesn't create real connection, it doesn't belong here.
            </p>

            <p>
              Profiles express who you are. Conversations stay in one place. Video lives inside the platform. <span style={{ color: colors.text, fontWeight: 500 }}>Connection is the point.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '80px 20px',
        background: colors.surface
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px'
          }}>
            <div style={{ width: '32px', height: '2px', background: colors.accent }} />
            <span style={{
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.accent,
              fontFamily: "'Space Mono', monospace",
              fontWeight: 600
            }}>
              What SLTR Is
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: '24px 20px',
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: darkMode ? 'rgba(255,107,53,0.2)' : 'rgba(255,107,53,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '18px',
                color: colors.accent,
                boxShadow: darkMode ? '0 0 20px rgba(255,107,53,0.2)' : 'none'
              }}>
                ◎
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '8px',
                fontFamily: "'Space Mono', monospace"
              }}>
                For Everyone
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.6, fontSize: '13px' }}>
                No judgment. Express yourself honestly.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '24px 20px',
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: darkMode ? 'rgba(255,107,53,0.2)' : 'rgba(255,107,53,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '18px',
                color: colors.accent,
                boxShadow: darkMode ? '0 0 20px rgba(255,107,53,0.2)' : 'none'
              }}>
                ▶
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '8px',
                fontFamily: "'Space Mono', monospace"
              }}>
                Built-in Video
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.6, fontSize: '13px' }}>
                One tap. See who's on the other end.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '24px 20px',
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: darkMode ? 'rgba(255,107,53,0.2)' : 'rgba(255,107,53,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '18px',
                color: colors.accent,
                boxShadow: darkMode ? '0 0 20px rgba(255,107,53,0.2)' : 'none'
              }}>
                ⬡
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '8px',
                fontFamily: "'Space Mono', monospace"
              }}>
                Group Rooms
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.6, fontSize: '13px' }}>
                Host hundreds. One place. Shared presence.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: '24px 20px',
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: darkMode ? 'rgba(255,107,53,0.2)' : 'rgba(255,107,53,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '18px',
                color: colors.accent,
                boxShadow: darkMode ? '0 0 20px rgba(255,107,53,0.2)' : 'none'
              }}>
                ◈
              </div>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '8px',
                fontFamily: "'Space Mono', monospace"
              }}>
                Your Privacy
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.6, fontSize: '13px' }}>
                Your terms. No invasive checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Section */}
      <section style={{
        padding: '80px 24px',
        background: colors.background
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ width: '32px', height: '2px', background: colors.accent }} />
            <span style={{
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.accent,
              fontFamily: "'Space Mono', monospace",
              fontWeight: 600
            }}>
              I Know The Pain
            </span>
          </div>

          <div style={{ fontSize: '16px', lineHeight: 1.8, color: colors.textSecondary }}>
            <p style={{ marginBottom: '20px' }}>
              I'm not building this from the outside. <span style={{ color: colors.text, fontWeight: 500 }}>I'm a user too.</span>
            </p>

            <p style={{ marginBottom: '20px' }}>
              I know what it's like to be ready to connect and hit a paywall. I know the frustration of hopping between apps.
            </p>

            <p style={{ marginBottom: '28px' }}>
              SLTR was built to remove those barriers.
            </p>

            <div style={{
              padding: '28px',
              background: darkMode ? 'rgba(255,107,53,0.1)' : 'rgba(255,107,53,0.05)',
              borderLeft: `3px solid ${colors.accent}`,
              borderRadius: '0 12px 12px 0',
              boxShadow: darkMode ? '0 0 30px rgba(255,107,53,0.1)' : 'none'
            }}>
              <p style={{ marginBottom: '16px', color: colors.text, fontSize: '15px' }}>
                No corporate board. No investors demanding growth at your expense. Just someone who decided to build what should have existed.
              </p>
              <p style={{
                color: colors.accent,
                fontWeight: 600,
                fontSize: '20px',
                fontFamily: "'Cormorant Garamond', serif"
              }}>
                Rules don't apply when they stop serving people.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 24px',
        background: colors.surface,
        position: 'relative',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${darkMode ? 'rgba(255,107,53,0.15)' : 'rgba(255,107,53,0.08)'} 0%, transparent 60%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 8vw, 56px)',
            fontWeight: 400,
            marginBottom: '16px',
            lineHeight: 1.2,
            color: colors.text
          }}>
            Ready to <span style={{ color: colors.accent }}>connect</span>?
          </h2>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            marginBottom: '36px',
            fontFamily: "'Space Mono', monospace",
            maxWidth: '320px',
            margin: '0 auto 36px'
          }}>
            Join SLTR and experience what connection should feel like.
          </p>
          {/* Lit Orange CTA Button */}
          <Link
            href="/signup"
            style={{
              position: 'relative',
              display: 'inline-block',
              padding: '18px 48px',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 50%, #FF6B35 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '10px',
              fontFamily: "'Space Mono', monospace",
              boxShadow: '0 8px 30px rgba(255,107,53,0.5), 0 0 60px rgba(255,107,53,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,133,85,0.6)',
              overflow: 'hidden'
            }}
          >
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
              borderRadius: '9px 9px 0 0',
              pointerEvents: 'none'
            }} />
            <span style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: '#FF6B35',
              boxShadow: '0 0 20px rgba(255,107,53,1), 0 0 40px rgba(255,107,53,0.7), 0 0 60px rgba(255,107,53,0.4)',
              pointerEvents: 'none'
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>Join SLTR</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        borderTop: `1px solid ${colors.border}`,
        textAlign: 'center',
        background: colors.background
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '16px'
        }}>
          <Link href="/privacy" style={{ fontSize: '11px', color: colors.textMuted, textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ fontSize: '11px', color: colors.textMuted, textDecoration: 'none' }}>Terms</Link>
          <Link href="/guidelines" style={{ fontSize: '11px', color: colors.textMuted, textDecoration: 'none' }}>Guidelines</Link>
          <Link href="/cookies" style={{ fontSize: '11px', color: colors.textMuted, textDecoration: 'none' }}>Cookies</Link>
          <Link href="/security" style={{ fontSize: '11px', color: colors.textMuted, textDecoration: 'none' }}>Security</Link>
          <Link href="/dmca" style={{ fontSize: '11px', color: colors.textMuted, textDecoration: 'none' }}>DMCA</Link>
        </div>
        <p style={{ fontSize: '11px', color: colors.textMuted }}>
          © 2025 SLTR Digital LLC
        </p>
      </footer>

    </main>
  )
}

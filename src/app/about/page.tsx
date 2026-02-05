"use client"

import Link from 'next/link';
import { useTheme } from '../../contexts/ThemeContext';

export default function AboutPage() {
  const { colors } = useTheme();

  return (
    <main style={{
      backgroundColor: colors.background,
      color: colors.text,
      minHeight: '100vh',
      overflowX: 'hidden',
      fontFamily: "'Space Mono', monospace"
    }}>

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 30px',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100
      }}>
        <Link href="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '0.3em',
          textDecoration: 'none',
          color: colors.text
        }}>
          P R I M A L
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/login" style={{
            fontSize: '13px',
            color: colors.text,
            textDecoration: 'none',
            fontWeight: 500,
            opacity: 0.8,
            fontFamily: "'Space Mono', monospace"
          }}>
            Log in
          </Link>
          <Link href="/signup" style={{
            fontSize: '13px',
            color: '#fff',
            background: colors.accent,
            padding: '10px 20px',
            textDecoration: 'none',
            fontWeight: 600,
            borderRadius: '4px',
            fontFamily: "'Space Mono', monospace"
          }}>
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '120px 24px 80px'
      }}>
        {/* Gradient orb */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        <p style={{
          fontSize: '12px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: colors.accent,
          marginBottom: '24px',
          fontWeight: 500,
          fontFamily: "'Space Mono', monospace"
        }}>
          Rules Don't Apply
        </p>

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(48px, 10vw, 100px)',
          fontWeight: 300,
          letterSpacing: '0.05em',
          textAlign: 'center',
          lineHeight: 1,
          marginBottom: '32px',
          color: colors.text
        }}>
          About <span style={{ color: colors.accent }}>Primal</span>
        </h1>

        <p style={{
          fontSize: '16px',
          color: colors.textSecondary,
          maxWidth: '500px',
          textAlign: 'center',
          lineHeight: 1.6,
          fontFamily: "'Space Mono', monospace"
        }}>
          Built for connection. Designed without compromise.
        </p>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: 0.4
        }}>
          <span style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: "'Space Mono', monospace"
          }}>
            Scroll
          </span>
          <div style={{
            width: '1px',
            height: '40px',
            background: `linear-gradient(to bottom, ${colors.text}, transparent)`
          }} />
        </div>
      </section>

      {/* The Problem Section */}
      <section style={{
        padding: '120px 24px',
        background: colors.surface
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px'
          }}>
            <div style={{ width: '48px', height: '2px', background: colors.accent }} />
            <span style={{
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.accent,
              fontFamily: "'Space Mono', monospace"
            }}>
              The Problem
            </span>
          </div>

          <div style={{ fontSize: '20px', lineHeight: 1.9, color: colors.text }}>
            <p style={{ marginBottom: '32px' }}>
              The apps we grew up with didn't start broken. <span style={{ fontWeight: 600 }}>They became broken.</span>
            </p>

            <p style={{ marginBottom: '32px', color: colors.textSecondary }}>
              What began as spaces for connection slowly turned into subscription traps. Features that once felt basic are now locked behind paywalls. Prices climb year after year.
            </p>

            <p style={{ marginBottom: '32px', color: colors.textSecondary }}>
              Then came the bots. The fake profiles. The endless spam. You open an app hoping to connect with real people and end up dodging promotions, scams, and accounts that aren't even human.
            </p>

            <p style={{ color: colors.textSecondary }}>
              And some platforms quietly decide who belongs. If you don't fit a certain look or mold, you feel it immediately. That isn't community. <span style={{ color: colors.accent, fontWeight: 600 }}>That's a club with a dress code.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section style={{
        padding: '100px 24px',
        background: colors.accent,
        position: 'relative'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 400,
            color: '#000',
            textAlign: 'center',
            lineHeight: 1.4,
            fontStyle: 'italic'
          }}>
            "Primal exists because that didn't sit right with me."
          </p>
        </div>
      </section>

      {/* Core Value Section */}
      <section style={{
        padding: '120px 24px',
        background: colors.background
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px'
          }}>
            <div style={{ width: '48px', height: '2px', background: colors.accent }} />
            <span style={{
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.accent,
              fontFamily: "'Space Mono', monospace"
            }}>
              The One Thing That Matters
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 400,
            marginBottom: '48px',
            lineHeight: 1.2,
            color: colors.accent
          }}>
            Connection.
          </h2>

          <div style={{ fontSize: '18px', lineHeight: 1.9, color: colors.textSecondary }}>
            <p style={{ marginBottom: '28px' }}>
              Not matches. Not metrics. Not engagement tricks.
            </p>

            <p style={{ marginBottom: '28px' }}>
              Everything in Primal is built from that mindset. If something doesn't create a real connection, it doesn't belong here.
            </p>

            <p>
              Profiles are designed to express who you actually are. Conversations don't get fragmented across apps. Video lives inside the platform. <span style={{ color: colors.text, fontWeight: 500 }}>Nothing is disconnected because connection is the point.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '120px 24px',
        background: colors.surface
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '64px'
          }}>
            <div style={{ width: '48px', height: '2px', background: colors.accent }} />
            <span style={{
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.accent,
              fontFamily: "'Space Mono', monospace"
            }}>
              What Primal Is
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: '40px',
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,107,53,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                fontSize: '20px',
                color: colors.accent
              }}>
                ◎
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '12px',
                fontFamily: "'Space Mono', monospace"
              }}>
                For Everyone
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.7, fontSize: '14px' }}>
                No judgment. No assumptions. Tools and indicators so you can express yourself clearly and honestly, without being boxed in.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '40px',
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,107,53,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                fontSize: '20px',
                color: colors.accent
              }}>
                ▶
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '12px',
                fontFamily: "'Space Mono', monospace"
              }}>
                Built-in Video
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.7, fontSize: '14px' }}>
                High-quality video calling. No WhatsApp. No FaceTime. No jumping between apps. One tap, and you see who's on the other end.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '40px',
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,107,53,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                fontSize: '20px',
                color: colors.accent
              }}>
                ⬡
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '12px',
                fontFamily: "'Space Mono', monospace"
              }}>
                Group Rooms
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.7, fontSize: '14px' }}>
                Host hundreds of people from around the world. No Zoom links. No Telegram threads. One place. Shared presence.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: '40px',
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,107,53,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                fontSize: '20px',
                color: colors.accent
              }}>
                ◈
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '12px',
                fontFamily: "'Space Mono', monospace"
              }}>
                Your Privacy
              </h3>
              <p style={{ color: colors.textSecondary, lineHeight: 1.7, fontSize: '14px' }}>
                No invasive ID checks or facial recognition. Primal gives you the tools to do your own due diligence, on your own terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Section */}
      <section style={{
        padding: '120px 24px',
        background: colors.background
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '48px'
          }}>
            <div style={{ width: '48px', height: '2px', background: colors.accent }} />
            <span style={{
              fontSize: '11px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.accent,
              fontFamily: "'Space Mono', monospace"
            }}>
              I Know The Pain
            </span>
          </div>

          <div style={{ fontSize: '18px', lineHeight: 1.9, color: colors.textSecondary }}>
            <p style={{ marginBottom: '28px' }}>
              I'm not building this from the outside. <span style={{ color: colors.text, fontWeight: 500 }}>I'm a user too.</span>
            </p>

            <p style={{ marginBottom: '28px' }}>
              I know what it's like to be ready to connect and hit a paywall. I know the error codes. I know the frustration of hopping between apps just to do something simple.
            </p>

            <p style={{ marginBottom: '40px' }}>
              Primal was built to remove those barriers. One place. No excuses.
            </p>

            <div style={{
              padding: '40px',
              background: 'rgba(255,107,53,0.08)',
              borderLeft: `3px solid ${colors.accent}`,
              borderRadius: '0 8px 8px 0'
            }}>
              <p style={{ marginBottom: '20px', color: colors.text }}>
                There's no corporate board here. No investors demanding growth at your expense. Just someone who uses these apps every day and decided to build what should have existed all along.
              </p>
              <p style={{
                color: colors.text,
                fontWeight: 600,
                fontSize: '22px',
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
        padding: '140px 24px',
        background: colors.surface,
        position: 'relative',
        textAlign: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 60%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 400,
            marginBottom: '20px',
            lineHeight: 1.2,
            color: colors.text
          }}>
            Ready to <span style={{ color: colors.accent }}>connect</span>?
          </h2>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            marginBottom: '40px',
            fontFamily: "'Space Mono', monospace"
          }}>
            Join Primal and experience what connection should feel like.
          </p>
          <Link
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '18px 48px',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              background: colors.accent,
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontFamily: "'Space Mono', monospace"
            }}
          >
            Join Primal
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 24px',
        borderTop: `1px solid ${colors.border}`,
        textAlign: 'center',
        background: colors.background
      }}>
        <p style={{ fontSize: '11px', color: colors.textMuted }}>
          © 2025 Primal
        </p>
      </footer>

    </main>
  )
}

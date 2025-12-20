"use client"

import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="bg-white text-black min-h-screen px-6 md:px-12 lg:px-24 py-20">

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 30px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100
      }}>
        <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 700, letterSpacing: '0.3em', textDecoration: 'none', color: '#000' }}>s l t r</Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: '13px', color: '#000', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
          <Link href="/signup" style={{ fontSize: '13px', color: '#fff', background: '#000', padding: '10px 20px', textDecoration: 'none', fontWeight: 600, borderRadius: '4px' }}>Sign up</Link>
        </div>
      </header>

      {/* Title Section */}
      <section className="max-w-3xl mx-auto text-center mb-24 pt-16">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-6">
          About SLTR
        </h1>
        <p className="text-sm uppercase tracking-widest text-neutral-500">
          Rules Don't Apply
        </p>
      </section>

      {/* Body */}
      <section className="max-w-3xl mx-auto space-y-16 text-lg leading-relaxed">

        <p>
          The apps we grew up with didn't start broken. They became broken.
        </p>

        <p>
          What began as spaces for connection slowly turned into subscription traps.
          Features that once felt basic are now locked behind paywalls. Prices climb
          year after year. Billion-dollar companies squeezing the same users who built them.
        </p>

        <p>
          Then came the bots. The fake profiles. The endless spam. You open an app hoping
          to connect with real people and end up dodging promotions, scams, and accounts
          that aren't even human.
        </p>

        <p>
          And some platforms quietly decide who belongs. If you don't fit a certain look
          or mold, you feel it immediately. That isn't community. That's a club with a dress code.
        </p>

        <div className="border-l-4 border-orange-500 pl-6 italic">
          SLTR exists because that didn't sit right with me.
        </div>

        {/* Core Value */}
        <h2 className="text-2xl font-serif mt-24">
          The One Thing That Matters
        </h2>

        <p>
          When I created SLTR, I started with one core value:
          <span className="text-orange-500 font-medium"> connection</span>.
        </p>

        <p>
          Not matches. Not metrics. Not engagement tricks.
          <br />
          Connection.
        </p>

        <p>
          Everything in SLTR is built from that mindset. If something doesn't create
          a real connection, it doesn't belong here.
        </p>

        <p>
          Profiles are designed to express who you actually are. Conversations don't
          get fragmented across apps. Video lives inside the platform instead of sending
          you elsewhere. Nothing is disconnected because connection is the point.
        </p>

        {/* What SLTR Is */}
        <h2 className="text-2xl font-serif mt-24">
          What SLTR Is
        </h2>

        <p>
          SLTR is for everyone. No judgment. No assumptions.
        </p>

        <p>
          I built tools and indicators so you can express yourself clearly and honestly,
          without being boxed into someone else's idea of who you should be.
        </p>

        <p>
          SLTR includes high-quality, built-in video calling. No WhatsApp. No FaceTime.
          No jumping between apps. One tap, and you see who's on the other end.
        </p>

        <p>
          I'm not interested in invasive ID checks or facial recognition. Instead,
          SLTR gives you the tools to do your own due diligence, on your own terms.
        </p>

        {/* Beyond One-on-One */}
        <h2 className="text-2xl font-serif mt-24">
          Beyond One-on-One
        </h2>

        <p>
          Connection doesn't always happen in private chats.
        </p>

        <p>
          SLTR includes group rooms that can host hundreds of people from around the
          world. No Zoom links. No Telegram threads. One place. Shared presence.
        </p>

        {/* Pain */}
        <h2 className="text-2xl font-serif mt-24">
          I Know the Pain
        </h2>

        <p>
          I'm not building this from the outside. I'm a user too.
        </p>

        <p>
          I know what it's like to be ready to connect and hit a paywall. I know the
          error codes. I know the frustration of hopping between apps just to do
          something simple.
        </p>

        <p>
          SLTR was built to remove those barriers.
          <br />
          One place. No excuses.
        </p>

        {/* Rules */}
        <h2 className="text-2xl font-serif mt-24">
          Rules Don't Apply
        </h2>

        <p>
          This is personal.
        </p>

        <p>
          There's no corporate board here. No investors demanding growth at your expense.
          Just someone who uses these apps every day and decided to build what should
          have existed all along.
        </p>

        <p className="font-medium">
          Rules don't apply when they stop serving people.
        </p>

        {/* CTA */}
        <div className="text-center pt-16 pb-8">
          <Link
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '18px 48px',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              background: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Join SLTR
          </Link>
        </div>

      </section>

      {/* Footer */}
      <footer className="mt-32 text-center text-sm text-neutral-500">
        © 2025 SLTR Digital LLC
      </footer>

    </main>
  )
}

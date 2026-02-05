'use client';

export default function HelpAndSupportPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Help & Support</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Crisis Resources */}
        <Section title="CRISIS RESOURCES">
          <HelplineCard
            emoji="🏳️‍🌈"
            title="The Trevor Project"
            description="24/7 crisis support for LGBTQ+ youth"
            phone="1-866-488-7386"
            text="Text START to 678-678"
            website="thetrevorproject.org"
          />
          <HelplineCard
            emoji="🏳️‍⚧️"
            title="Trans Lifeline"
            description="Peer support hotline run by trans people"
            phone="1-877-565-8860"
            website="translifeline.org"
          />
          <HelplineCard
            emoji="💬"
            title="Crisis Text Line"
            description="Free 24/7 text support for any crisis"
            text="Text HOME to 741741"
            website="crisistextline.org"
          />
          <HelplineCard
            emoji="☎️"
            title="988 Suicide & Crisis Lifeline"
            description="24/7 support for anyone in crisis"
            phone="988"
            text="Text 988"
            website="988lifeline.org"
          />
        </Section>

        {/* Substance Use Support */}
        <Section title="SUBSTANCE USE SUPPORT">
          <HelplineCard
            emoji="💊"
            title="SAMHSA National Helpline"
            description="Treatment referral and information"
            phone="1-800-662-4357"
            website="samhsa.gov"
          />
          <HelplineCard
            emoji="🩺"
            title="Never Use Alone"
            description="Overdose prevention hotline"
            phone="1-800-484-3731"
            website="neverusealone.com"
          />
          <HelplineCard
            emoji="🤝"
            title="Narcotics Anonymous"
            description="Peer support for recovery"
            phone="1-818-773-9999"
            website="na.org"
          />
        </Section>

        {/* Sexual Health */}
        <Section title="SEXUAL HEALTH">
          <HelplineCard
            emoji="🏥"
            title="LA LGBT Center"
            description="Healthcare, mental health, and support services"
            phone="1-323-993-7400"
            website="lalgbtcenter.org"
          />
          <HelplineCard
            emoji="🧪"
            title="AIDS Healthcare Foundation (AHF)"
            description="Free HIV testing, PrEP, and treatment"
            phone="1-323-860-5200"
            website="aidshealth.org"
          />
          <HelplineCard
            emoji="🩺"
            title="SF AIDS Foundation"
            description="PrEP, testing, and sexual health resources"
            phone="1-415-487-3000"
            website="sfaf.org"
          />
          <HelplineCard
            emoji="📱"
            title="Planned Parenthood"
            description="Sexual and reproductive health care"
            phone="1-800-230-7526"
            website="plannedparenthood.org"
          />
        </Section>

        {/* Mental Health */}
        <Section title="MENTAL HEALTH">
          <HelplineCard
            emoji="🧠"
            title="NAMI Helpline"
            description="National Alliance on Mental Illness"
            phone="1-800-950-6264"
            text="Text NAMI to 741741"
            website="nami.org"
          />
          <HelplineCard
            emoji="🌈"
            title="LGBT National Hotline"
            description="Peer counseling and local resources"
            phone="1-888-843-4564"
            website="lgbthotline.org"
          />
        </Section>

        {/* Safety */}
        <Section title="SAFETY & VIOLENCE">
          <HelplineCard
            emoji="🚨"
            title="National Domestic Violence Hotline"
            description="24/7 support for abuse survivors"
            phone="1-800-799-7233"
            text="Text START to 88788"
            website="thehotline.org"
          />
          <HelplineCard
            emoji="⚖️"
            title="RAINN Sexual Assault Hotline"
            description="Confidential support from trained staff"
            phone="1-800-656-4673"
            website="rainn.org"
          />
        </Section>

        {/* App Support */}
        <Section title="APP SUPPORT">
          <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '20px', marginBottom: '15px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Contact Primal Support</div>
            <div style={{ fontSize: '14px', color: '#888', lineHeight: 1.6, marginBottom: '15px' }}>
              For account issues, bug reports, or feedback
            </div>
            <a href="mailto:support@primalgay.com" style={{ color: '#FF6B35', textDecoration: 'none', fontSize: '15px' }}>
              support@primalgay.com
            </a>
          </div>
        </Section>

        {/* Emergency Notice */}
        <div style={{ background: '#ff3b30', borderRadius: '12px', padding: '20px', marginTop: '30px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>⚠️ Emergency</div>
          <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
            If you or someone you know is in immediate danger, please call 911 or go to your nearest emergency room.
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '30px' }} aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h2
        id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        style={{ fontSize: '13px', fontWeight: 600, color: '#A3A3A3', marginBottom: '15px', letterSpacing: '0.5px' }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function HelplineCard({ emoji, title, description, phone, text, website }: {
  emoji: string;
  title: string;
  description: string;
  phone?: string;
  text?: string;
  website?: string;
}) {
  return (
    <article style={{ background: '#1c1c1e', borderRadius: '12px', padding: '20px', marginBottom: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '12px' }}>
        <div style={{ fontSize: '32px', lineHeight: 1 }} aria-hidden="true">{emoji}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', margin: 0 }}>{title}</h3>
          <p style={{ fontSize: '14px', color: '#A3A3A3', lineHeight: 1.5, margin: 0 }}>{description}</p>
        </div>
      </div>
      <div style={{ paddingLeft: '47px' }}>
        {phone && (
          <a
            href={`tel:${phone.replace(/[^0-9]/g, '')}`}
            style={{ display: 'block', color: '#FF6B35', textDecoration: 'underline', textUnderlineOffset: '3px', fontSize: '15px', marginBottom: '8px', fontWeight: 500 }}
            aria-label={`Call ${title} at ${phone}`}
          >
            <span aria-hidden="true">📞</span> {phone}
          </a>
        )}
        {text && (
          <p style={{ color: '#FF6B35', fontSize: '15px', marginBottom: '8px', fontWeight: 500, margin: '0 0 8px 0' }}>
            <span aria-hidden="true">💬</span> {text}
          </p>
        )}
        {website && (
          <a
            href={`https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#A3A3A3', textDecoration: 'underline', textUnderlineOffset: '3px', fontSize: '13px' }}
            aria-label={`Visit ${title} website (opens in new tab)`}
          >
            <span aria-hidden="true">🌐</span> {website}
          </a>
        )}
      </div>
    </article>
  );
}

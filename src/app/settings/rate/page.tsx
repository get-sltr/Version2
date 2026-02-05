'use client';

import { useState } from 'react';

export default function RatePrimalPage() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    // In production, this would send to analytics/review platform
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Rate Primal</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        {!submitted ? (
          <>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⭐</div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Enjoying Primal?</h2>
            <p style={{ fontSize: '15px', color: '#888', marginBottom: '40px', lineHeight: 1.6 }}>
              Your feedback helps us create the best experience for the community
            </p>

            {/* Star Rating */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '48px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    filter: star <= rating ? 'none' : 'grayscale(100%) opacity(0.3)'
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>

            {rating > 0 && (
              <button
                onClick={handleSubmit}
                style={{
                  background: '#FF6B35',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 40px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '40px'
                }}
              >
                Submit Rating
              </button>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Thank You!</h2>
            <p style={{ fontSize: '15px', color: '#888', marginBottom: '40px', lineHeight: 1.6 }}>
              Your {rating}-star rating has been submitted
            </p>
            <a
              href="/settings"
              style={{
                display: 'inline-block',
                background: '#1c1c1e',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 40px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Back to Settings
            </a>
          </>
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: '60px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>
            What Users Are Saying
          </h3>

          <ReviewCard
            stars={5}
            username="Alex M."
            date="Dec 2025"
            review="Thank god it's better than Grindr! Actually focuses on real connections."
          />

          <ReviewCard
            stars={5}
            username="Jordan K."
            date="Dec 2025"
            review="Can't believe it's only $4.99 and you get all these options. Worth every penny!"
          />

          <ReviewCard
            stars={5}
            username="Marcus T."
            date="Nov 2025"
            review="The privacy features are incredible. Finally an app that respects boundaries."
          />

          <ReviewCard
            stars={5}
            username="Dev P."
            date="Nov 2025"
            review="Clean interface, no spam, real people. This is what dating apps should be."
          />

          <ReviewCard
            stars={5}
            username="Chris L."
            date="Nov 2025"
            review="Love the position filters and distance controls. Makes finding compatible people so much easier!"
          />
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ stars, username, date, review }: {
  stars: number;
  username: string;
  date: string;
  review: string;
}) {
  return (
    <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '20px', marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{username}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>{date}</div>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          {Array(stars).fill('⭐').map((star, i) => (
            <span key={i} style={{ fontSize: '16px' }}>{star}</span>
          ))}
        </div>
      </div>
      <p style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.6, margin: 0 }}>
        {review}
      </p>
    </div>
  );
}

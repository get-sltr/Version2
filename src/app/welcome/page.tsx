'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCheck, IconCrown } from '@/components/Icons';

export default function WelcomePage() {
  const router = useRouter();

  const promoFeatures = [
    'Unlimited profile views',
    'See who viewed your profile',
    'No ads ever',
    'Advanced filters',
    'Priority in search results',
    'Read receipts on messages',
    'Incognito browsing mode',
    'Travel mode - appear anywhere',
  ];

  const handleSkip = () => {
    router.push('/profile/edit');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background gradient */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at top, rgba(255, 107, 53, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
        }}
      >
        {/* Header */}
        <header style={{ textAlign: 'center', paddingTop: '20px' }}>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#FFFFFF',
            }}
          >
            sltr
          </span>
        </header>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 0',
            maxWidth: '500px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '24px' }}
          >
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              Welcome to SLTR!
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px' }}>
              Your account is ready. Before you go...
            </p>
          </motion.div>

          {/* Promo Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              width: '100%',
              background: 'linear-gradient(145deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 107, 53, 0.05) 100%)',
              border: '2px solid #FF6B35',
              borderRadius: '20px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Limited Time Badge */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#FF6B35',
                color: '#000',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                animation: 'pulse 2s infinite',
              }}
            >
              Limited Time
            </div>

            {/* Crown Icon */}
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
              }}
            >
              <IconCrown size={28} />
            </div>

            {/* Promo Title */}
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              Upgrade to SLTR+
            </h2>

            {/* Price */}
            <div style={{ marginBottom: '20px' }}>
              <span
                style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textDecoration: 'line-through',
                  marginRight: '10px',
                }}
              >
                $9.99/mo
              </span>
              <span
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: '#FF6B35',
                }}
              >
                $4.99
              </span>
              <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>/mo</span>
            </div>

            {/* Savings Badge */}
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(76, 175, 80, 0.2)',
                border: '1px solid #4CAF50',
                color: '#4CAF50',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '24px',
              }}
            >
              Save 50% — That's $60/year!
            </div>

            {/* Features List */}
            <div style={{ marginBottom: '24px' }}>
              {promoFeatures.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: index < promoFeatures.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      background: 'rgba(255, 107, 53, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconCheck size={12} style={{ color: '#FF6B35' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.a
              href="https://checkout.stripe.com/c/pay/cs_live_b1unIQSp5E4DRHvjoF7AJB0oONGs5dF94XM2a2BrTxan5FcHeyFvnTQRBL#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSd2cGd2ZndsdXFsamtQa2x0cGBrYHZ2QGtkZ2lgYSc%2FY2RpdmApJ2R1bE5gfCc%2FJ3VuWmlsc2BaMDRXfFNgSDZEcDAxUj1mdD1CNnxUSHNpT10yMVRvTHVGT0RrdjN2Qj1zNF1nRlB1Un9ccEhfdWNxfU9IcmZ%2FUGx2a1RoUD08dWtASEZybnJPZ11zVnxtYWc1NWxyMF1KVVFBJyknY3dqaFZgd3Ngdyc%2FcXdwYCknZ2RmbmJ3anBrYUZqaWp3Jz8nJmE8MDU1NScpJ2lkfGpwcVF8dWAnPydocGlxbFpscWBoJyknYGtkZ2lgVWlkZmBtamlhYHd2Jz9xd3BgeCUl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'block',
                width: '100%',
                padding: '18px',
                fontSize: '16px',
                fontWeight: 700,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                color: '#000000',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: '0 0 40px rgba(255, 107, 53, 0.5)',
              }}
            >
              Claim Your 50% Off
            </motion.a>

            {/* Guarantee */}
            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '12px',
              }}
            >
              Cancel anytime. No commitment required.
            </p>
          </motion.div>

          {/* Skip Link */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            onClick={handleSkip}
            style={{
              marginTop: '24px',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '12px 24px',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
            }}
          >
            Maybe later, continue with free account
          </motion.button>
        </main>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)' }}>
            This offer is only available for new accounts
          </p>
        </footer>
      </div>

      {/* Pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

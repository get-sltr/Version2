'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconInfinity,
  IconTelescope,
  IconGhost,
  IconShield,
  IconGrid,
  IconChat,
  IconEye,
  IconSparkles,
  IconTimer,
  IconLightning,
  IconUndo,
  IconGlobe,
  IconTyping,
  IconAlbums,
  IconDoubleCheck,
  IconBookmark,
  IconVideo,
  IconBadge,
  IconEyeOff,
  IconPin,
  IconHeadset,
  IconLocation,
  IconAirplane,
  IconUnlock,
  IconBack,
} from '@/components/Icons';

export default function PremiumPage() {
  const router = useRouter();

  const highlightedFeatures = [
    { icon: IconInfinity, title: 'UNLIMITED', desc: 'Full grid access' },
    { icon: IconTelescope, title: 'DISCOVER', desc: 'See who viewed you' },
    { icon: IconGhost, title: 'INCOGNITO', desc: 'Browse discreetly' },
    { icon: IconShield, title: 'AD-FREE', desc: 'No interruptions' },
  ];

  const allFeatures = [
    { icon: IconGrid, text: 'Unlimited profiles' },
    { icon: IconChat, text: 'Unlimited messaging' },
    { icon: IconEye, text: 'See who viewed you' },
    { icon: IconGhost, text: 'Incognito mode' },
    { icon: IconSparkles, text: 'For You matches' },
    { icon: IconTimer, text: 'Expiring photos' },
    { icon: IconLightning, text: 'Right Now - 100' },
    { icon: IconUndo, text: 'Unsend messages' },
    { icon: IconGlobe, text: 'Message translate' },
    { icon: IconTyping, text: 'Typing status' },
    { icon: IconAlbums, text: 'Multiple albums' },
    { icon: IconEye, text: 'View shared albums' },
    { icon: IconTimer, text: 'Expiring albums' },
    { icon: IconShield, text: 'No 3rd party ads' },
    { icon: IconDoubleCheck, text: 'Read receipts' },
    { icon: IconBookmark, text: 'Saved phrases' },
    { icon: IconVideo, text: 'Premium Video' },
    { icon: IconBadge, text: 'Pro Badge' },
    { icon: IconEyeOff, text: 'Hide photos' },
    { icon: IconPin, text: 'Pin conversations' },
    { icon: IconHeadset, text: 'Priority support' },
    { icon: IconLocation, text: 'Add places' },
    { icon: IconAirplane, text: 'Travel mode' },
    { icon: IconUnlock, text: 'Unblock users' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.6,
        }}
      >
        <source src="/Videos/premiumpage.mp4" type="video/mp4" />
      </video>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: '10px',
            color: '#FF6B35',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconBack size={24} />
        </motion.button>
        <h1 style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#fff',
          margin: 0,
        }}>
          ALL FEATURES
        </h1>
        <div style={{ width: '40px' }} />
      </motion.header>

      <div style={{
        maxWidth: '520px',
        margin: '0 auto',
        padding: '24px 20px 120px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Free Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <div style={{
            padding: '14px 48px',
            background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(52, 199, 89, 0.05) 100%)',
            border: '1px solid rgba(52, 199, 89, 0.4)',
            borderRadius: '40px',
            backdropFilter: 'blur(10px)',
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #34C759 0%, #86EFAC 50%, #FFFFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              100% FREE
            </span>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6,
            maxWidth: '360px',
            margin: '0 auto',
          }}>
            Primal is free while we grow. We may add paid features in the future, but for now it's just the product: no ads, no algorithmic manipulation, no dark patterns, and no tricks.
          </p>
        </motion.div>

        {/* Highlighted Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          {highlightedFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              style={{
                position: 'relative',
                padding: '24px 16px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '10%',
                right: '10%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
              }} />
              <div style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                <feature.icon size={28} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', color: '#fff', marginBottom: '4px' }}>
                {feature.title}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.5px' }}>
                {feature.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* All Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginBottom: '40px' }}
        >
          <h3 style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            EVERYTHING INCLUDED — FREE
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
          }}>
            {allFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.02, duration: 0.3 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ color: 'rgba(52, 199, 89, 0.7)', flexShrink: 0 }}>
                  <feature.icon size={16} />
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.3px' }}>
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.3) 0%, rgba(52, 199, 89, 0.15) 100%)',
            border: '1px solid rgba(52, 199, 89, 0.5)',
            borderRadius: '16px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(15px)',
          }}
        >
          START EXPLORING
        </motion.button>
      </div>
    </div>
  );
}

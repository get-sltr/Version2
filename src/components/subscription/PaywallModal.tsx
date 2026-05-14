'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { IconClose, IconCrown, IconCheck } from '@/components/Icons';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: () => void;
}

const features = [
  'Unlimited profiles',
  'See who viewed you',
  'Incognito mode',
  'Read receipts',
  'No ads',
  'Priority support',
  'Travel mode',
  'Premium video calls',
];

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '80vh',
              background: '#111',
              borderRadius: '20px 20px 0 0',
              padding: '24px 20px 40px',
              zIndex: 9999,
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconCrown size={24} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Primal Pro</span>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}
              >
                <IconClose size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {features.map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IconCheck size={16} />
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                onClose();
                router.push('/premium');
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              UPGRADE NOW
            </button>

            <p style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              marginTop: '12px',
              lineHeight: 1.5,
            }}>
              Starting at $12.99/month. Cancel anytime.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

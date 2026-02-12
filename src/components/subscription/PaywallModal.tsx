'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  isNativePlatform,
} from '@/lib/revenuecat';
import { IconClose, IconCrown, IconCheck } from '@/components/Icons';

interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
  offeringIdentifier: string;
}

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

export function PaywallModal({ isOpen, onClose, onPurchaseComplete }: PaywallModalProps) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const native = isNativePlatform();

  useEffect(() => {
    if (isOpen && native) {
      loadOfferings();
    }
  }, [isOpen, native]);

  // Don't render on web
  if (!native) {
    return null;
  }

  const loadOfferings = async () => {
    setLoading(true);
    setError(null);

    try {
      const offerings = await getOfferings();

      if (offerings?.current?.availablePackages) {
        const availablePackages = offerings.current.availablePackages;
        setPackages(availablePackages);

        // Select the best value package by default (usually monthly or 3-month)
        const defaultPackage =
          offerings.current.threeMonth ||
          offerings.current.monthly ||
          availablePackages[0];

        if (defaultPackage) {
          setSelectedPackage(defaultPackage);
        }
      } else {
        setError('No subscription plans available');
      }
    } catch (err) {
      console.error('Failed to load offerings:', err);
      setError('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setPurchasing(true);
    setError(null);

    try {
      const result = await purchasePackage(selectedPackage);

      if (result.success) {
        onPurchaseComplete?.();
        onClose();
      } else if (result.error && result.error !== 'Purchase cancelled') {
        setError(result.error);
      }
    } catch (err) {
      setError('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);

    try {
      const result = await restorePurchases();

      if (result.success && result.customerInfo) {
        const hasPremium = result.customerInfo.entitlements.active['Primal Pro']?.isActive;

        if (hasPremium) {
          onPurchaseComplete?.();
          onClose();
        } else {
          setError('No previous purchases found');
        }
      } else {
        setError(result.error || 'Failed to restore purchases');
      }
    } catch (err) {
      setError('Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  const getPackageLabel = (pkg: PurchasesPackage): string => {
    switch (pkg.packageType) {
      case 'WEEKLY':
        return 'Weekly';
      case 'MONTHLY':
        return '1 Month';
      case 'THREE_MONTH':
        return '3 Months';
      case 'SIX_MONTH':
        return '6 Months';
      case 'ANNUAL':
        return 'Annual';
      case 'LIFETIME':
        return "Founder's Circle";
      default:
        return pkg.product.title;
    }
  };

  const getSavingsText = (pkg: PurchasesPackage): string | null => {
    // Calculate savings compared to weekly if available
    const weeklyPkg = packages.find((p) => p.packageType === 'WEEKLY');
    if (!weeklyPkg || pkg.packageType === 'WEEKLY') return null;

    const weeklyPrice = weeklyPkg.product.price;
    let weeks = 1;

    switch (pkg.packageType) {
      case 'MONTHLY':
        weeks = 4;
        break;
      case 'THREE_MONTH':
        weeks = 13;
        break;
      case 'SIX_MONTH':
        weeks = 26;
        break;
      case 'ANNUAL':
        weeks = 52;
        break;
      default:
        return null;
    }

    const fullPrice = weeklyPrice * weeks;
    const savings = Math.round(((fullPrice - pkg.product.price) / fullPrice) * 100);

    return savings > 0 ? `Save ${savings}%` : null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              paddingBottom: '40px',
              overflowY: 'auto',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              <IconClose size={20} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 30px rgba(255, 107, 53, 0.4)',
                }}
              >
                <IconCrown size={32} />
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 0 8px',
                }}
              >
                Upgrade to Pro
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                }}
              >
                Unlock all premium features
              </p>
            </div>

            {/* Features */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {features.map((feature) => (
                <div
                  key={feature}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <IconCheck size={16} />
                  {feature}
                </div>
              ))}
            </div>

            {/* Loading state */}
            {loading && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Loading plans...
              </div>
            )}

            {/* Package selection */}
            {!loading && packages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {packages.map((pkg) => {
                  const isSelected = selectedPackage?.identifier === pkg.identifier;
                  const savings = getSavingsText(pkg);

                  return (
                    <button
                      key={pkg.identifier}
                      onClick={() => setSelectedPackage(pkg)}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 140, 90, 0.1) 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected ? '2px solid #FF6B35' : '2px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ textAlign: 'left' }}>
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#fff',
                          }}
                        >
                          {getPackageLabel(pkg)}
                        </div>
                        {savings && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#FF6B35',
                              marginTop: '4px',
                            }}
                          >
                            {savings}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {pkg.product.priceString}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '12px',
                  marginBottom: '16px',
                  background: 'rgba(244, 67, 54, 0.1)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  borderRadius: '8px',
                  color: '#f44336',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            {/* Purchase button */}
            {!loading && packages.length > 0 && (
              <button
                onClick={handlePurchase}
                disabled={!selectedPackage || purchasing}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: purchasing
                    ? 'rgba(255, 107, 53, 0.5)'
                    : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: purchasing ? 'wait' : 'pointer',
                  marginBottom: '12px',
                  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.3)',
                }}
              >
                {purchasing ? 'Processing...' : 'Subscribe Now'}
              </button>
            )}

            {/* Restore purchases */}
            <button
              onClick={handleRestore}
              disabled={restoring}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: restoring ? 'wait' : 'pointer',
              }}
            >
              {restoring ? 'Restoring...' : 'Restore Purchases'}
            </button>

            {/* Legal disclosure — Apple Schedule 2 required language */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '16px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.4)',
                lineHeight: 1.6,
              }}
            >
              <span style={{ display: 'block', marginBottom: '8px' }}>
                Payment will be charged to your Apple ID account at confirmation of purchase.
                Subscription automatically renews unless auto-renew is turned off at least
                24 hours before the end of the current period. Your account will be charged
                for renewal within 24 hours prior to the end of the current period.
                You can manage and cancel your subscriptions by going to your App Store
                account settings after purchase.
              </span>
              <a href="/terms" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'underline' }}>
                Terms of Service
              </a>
              {' | '}
              <a href="/privacy" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'underline' }}>
                Privacy Policy
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PaywallModal;

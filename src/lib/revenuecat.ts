/**
 * RevenueCat Integration for Primal
 *
 * Handles in-app purchases and subscription management for iOS/Android.
 * On web, this module gracefully degrades to returning free access.
 */

import { Capacitor } from '@capacitor/core';

// Type definitions for RevenueCat
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

interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  availablePackages: PurchasesPackage[];
  weekly?: PurchasesPackage;
  monthly?: PurchasesPackage;
  threeMonth?: PurchasesPackage;
  sixMonth?: PurchasesPackage;
  annual?: PurchasesPackage;
  lifetime?: PurchasesPackage;
}

interface PurchasesOfferings {
  current: PurchasesOffering | null;
  all: Record<string, PurchasesOffering>;
}

interface CustomerInfo {
  entitlements: {
    active: Record<string, {
      identifier: string;
      isActive: boolean;
      willRenew: boolean;
      periodType: string;
      latestPurchaseDate: string;
      originalPurchaseDate: string;
      expirationDate: string | null;
      productIdentifier: string;
      isSandbox: boolean;
      ownershipType: string;
    }>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate: string | null;
  originalAppUserId: string;
  managementURL: string | null;
}

// The entitlement identifier configured in RevenueCat
const PREMIUM_ENTITLEMENT = 'Primal Pro';

// Dynamically import RevenueCat only on native platforms
let Purchases: any = null;

/**
 * Initialize RevenueCat with the user's Supabase ID
 * Should be called after user authentication
 */
export async function initializeRevenueCat(userId?: string): Promise<boolean> {
  // Skip on web - web users get free access
  if (!Capacitor.isNativePlatform()) {
    console.log('[RevenueCat] Skipping initialization - web platform');
    return true;
  }

  try {
    // Dynamic import of RevenueCat for native platforms
    console.log('[RevenueCat] Importing Purchases module...');
    const { Purchases: PurchasesModule } = await import('@revenuecat/purchases-capacitor');
    Purchases = PurchasesModule;
    console.log('[RevenueCat] Purchases module loaded');

    const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
    console.log('[RevenueCat] API key present:', !!apiKey, apiKey ? `(${apiKey.substring(0, 10)}...)` : '');

    if (!apiKey) {
      console.error('[RevenueCat] API key not configured');
      return false;
    }

    console.log('[RevenueCat] Calling configure...');
    await Purchases.configure({
      apiKey,
      appUserID: userId || null, // null lets RevenueCat generate anonymous ID
    });

    console.log('[RevenueCat] Initialized successfully', userId ? `for user ${userId}` : 'anonymously');
    return true;
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);
    return false;
  }
}

/**
 * Log in a user to RevenueCat (after Supabase authentication)
 * This associates their purchases with their Supabase user ID
 */
export async function loginRevenueCat(userId: string): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform() || !Purchases) {
    return null;
  }

  try {
    const { customerInfo } = await Purchases.logIn({ appUserID: userId });
    console.log('[RevenueCat] Logged in user:', userId);
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Login failed:', error);
    return null;
  }
}

/**
 * Log out user from RevenueCat (on Supabase sign out)
 */
export async function logoutRevenueCat(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !Purchases) {
    return;
  }

  try {
    await Purchases.logOut();
    console.log('[RevenueCat] Logged out');
  } catch (error) {
    console.error('[RevenueCat] Logout failed:', error);
  }
}

/**
 * Get available subscription offerings
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  console.log('[RevenueCat] getOfferings called, isNative:', Capacitor.isNativePlatform(), 'Purchases:', !!Purchases);

  if (!Capacitor.isNativePlatform()) {
    console.log('[RevenueCat] Not native platform, returning null');
    return null;
  }

  if (!Purchases) {
    console.log('[RevenueCat] Purchases not initialized, attempting init...');
    const success = await initializeRevenueCat();
    if (!success || !Purchases) {
      console.error('[RevenueCat] Failed to initialize on demand');
      return null;
    }
  }

  try {
    console.log('[RevenueCat] Fetching offerings...');
    const { offerings } = await Purchases.getOfferings();
    console.log('[RevenueCat] Offerings result:', JSON.stringify(offerings, null, 2));
    console.log('[RevenueCat] Current offering:', offerings?.current);
    return offerings;
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(packageToPurchase: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (!Capacitor.isNativePlatform() || !Purchases) {
    return { success: false, error: 'Purchases not available on web' };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });

    const isPremium = checkEntitlementFromInfo(customerInfo, PREMIUM_ENTITLEMENT);
    console.log('[RevenueCat] Purchase complete, premium:', isPremium);

    return { success: true, customerInfo };
  } catch (error: any) {
    // Check if user cancelled
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }

    console.error('[RevenueCat] Purchase failed:', error);
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Restore previous purchases (for new device or reinstall)
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (!Capacitor.isNativePlatform() || !Purchases) {
    return { success: true }; // Web users always have access
  }

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const isPremium = checkEntitlementFromInfo(customerInfo, PREMIUM_ENTITLEMENT);

    console.log('[RevenueCat] Restore complete, premium:', isPremium);
    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('[RevenueCat] Restore failed:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Check if user has a specific entitlement
 */
export async function checkEntitlement(entitlementId: string = PREMIUM_ENTITLEMENT): Promise<boolean> {
  // Web users always have premium access
  if (!Capacitor.isNativePlatform()) {
    return true;
  }

  if (!Purchases) {
    return false;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return checkEntitlementFromInfo(customerInfo, entitlementId);
  } catch (error) {
    console.error('[RevenueCat] Failed to check entitlement:', error);
    return false;
  }
}

/**
 * Get customer info (subscription status)
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Capacitor.isNativePlatform() || !Purchases) {
    return null;
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);
    return null;
  }
}

/**
 * Check if premium entitlement is active from CustomerInfo
 */
function checkEntitlementFromInfo(customerInfo: CustomerInfo, entitlementId: string): boolean {
  const entitlement = customerInfo.entitlements.active[entitlementId];
  return entitlement?.isActive ?? false;
}

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the platform (web, ios, android)
 */
export function getPlatform(): 'web' | 'ios' | 'android' {
  return Capacitor.getPlatform() as 'web' | 'ios' | 'android';
}

export default {
  initializeRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  checkEntitlement,
  getCustomerInfo,
  isNativePlatform,
  getPlatform,
};

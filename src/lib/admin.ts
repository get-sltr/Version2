/**
 * Admin Authorization System
 *
 * Handles admin roles and permissions for the SLTR platform.
 * Founder has ultimate authority over all platform operations.
 */

import { createClient } from '@supabase/supabase-js';

// Admin roles with hierarchy
export type AdminRole = 'founder' | 'admin' | 'moderator' | 'support';

// Role hierarchy (higher number = more power)
const ROLE_HIERARCHY: Record<AdminRole, number> = {
  founder: 100,    // Ultimate authority - can do anything
  admin: 80,       // Full admin access
  moderator: 50,   // Can moderate content/users
  support: 20,     // Can view and help users
};

// Founder email - has ultimate platform authority
export const FOUNDER_EMAIL = 'kminn121@gmail.com';

// Admin emails and their roles
// Add more admins here as needed
const ADMIN_ROLES: Record<string, AdminRole> = {
  [FOUNDER_EMAIL]: 'founder',
  // Add more admins:
  // 'admin@example.com': 'admin',
  // 'mod@example.com': 'moderator',
};

/**
 * Check if an email is the founder
 */
export function isFounder(email: string | null | undefined): boolean {
  return email?.toLowerCase() === FOUNDER_EMAIL.toLowerCase();
}

/**
 * Get the admin role for an email
 */
export function getAdminRole(email: string | null | undefined): AdminRole | null {
  if (!email) return null;
  return ADMIN_ROLES[email.toLowerCase()] || null;
}

/**
 * Check if user has admin access (any admin role)
 */
export function isAdmin(email: string | null | undefined): boolean {
  return getAdminRole(email) !== null;
}

/**
 * Check if user has at least the required role level
 */
export function hasRole(email: string | null | undefined, requiredRole: AdminRole): boolean {
  const userRole = getAdminRole(email);
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Admin permissions
 */
export const AdminPermissions = {
  // View permissions
  VIEW_DASHBOARD: ['support', 'moderator', 'admin', 'founder'] as AdminRole[],
  VIEW_USERS: ['support', 'moderator', 'admin', 'founder'] as AdminRole[],
  VIEW_PAYMENTS: ['admin', 'founder'] as AdminRole[],
  VIEW_ERRORS: ['admin', 'founder'] as AdminRole[],
  VIEW_ANALYTICS: ['moderator', 'admin', 'founder'] as AdminRole[],

  // Action permissions
  EDIT_USER: ['moderator', 'admin', 'founder'] as AdminRole[],
  BAN_USER: ['moderator', 'admin', 'founder'] as AdminRole[],
  DELETE_USER: ['admin', 'founder'] as AdminRole[],
  REFUND_PAYMENT: ['admin', 'founder'] as AdminRole[],
  MANAGE_ADMINS: ['founder'] as AdminRole[],

  // System permissions
  SYSTEM_SETTINGS: ['founder'] as AdminRole[],
  DATABASE_ACCESS: ['founder'] as AdminRole[],
  OVERRIDE_ALL: ['founder'] as AdminRole[],
};

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  email: string | null | undefined,
  permission: keyof typeof AdminPermissions
): boolean {
  const role = getAdminRole(email);
  if (!role) return false;

  // Founder can do anything
  if (role === 'founder') return true;

  return AdminPermissions[permission].includes(role);
}

/**
 * Get Supabase admin client (uses service role key)
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin credentials not configured');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Admin user info for display
 */
export interface AdminUser {
  email: string;
  role: AdminRole;
  displayName: string;
}

/**
 * Get all admin users (for founder view)
 */
export function getAllAdmins(): AdminUser[] {
  return Object.entries(ADMIN_ROLES).map(([email, role]) => ({
    email,
    role,
    displayName: email === FOUNDER_EMAIL ? 'Founder' : email.split('@')[0],
  }));
}

/**
 * Format role for display
 */
export function formatRole(role: AdminRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: AdminRole): string {
  switch (role) {
    case 'founder':
      return '#FFD700'; // Gold
    case 'admin':
      return '#FF6B35'; // Orange
    case 'moderator':
      return '#4CAF50'; // Green
    case 'support':
      return '#2196F3'; // Blue
    default:
      return '#888888';
  }
}

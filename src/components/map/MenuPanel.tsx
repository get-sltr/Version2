// =============================================================================
// MenuPanel - Slide-out menu with glass cards
// =============================================================================

'use client';

import Link from 'next/link';
import type { MenuPanelProps } from '@/types/map';
import styles from './Map.module.css';

// Icons
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const GroupsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3 21V18C3 15.79 4.79 14 7 14H11C13.21 14 15 15.79 15 18V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M17 14C19.21 14 21 15.79 21 18V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C15.3 3 18.19 4.78 19.75 7.43"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 3V8H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FiltersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ClusterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const CruisingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 1V4M12 20V23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M1 12H4M20 12H23M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const BlogIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M4 4H20V18H6L4 20V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 13H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TermsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M6 2H14L20 8V22H6V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 13H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PrivacyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6V12C4 17.52 7.48 22.74 12 24C16.52 22.74 20 17.52 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GuidelinesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

export function MenuPanel({
  isOpen,
  onClose,
  onRefresh,
  onFiltersOpen,
  clusterEnabled,
  onClusterToggle,
}: MenuPanelProps) {
  return (
    <div className={`${styles.menuPanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.menuHeader}>
        <span className={styles.menuTitle}>Menu</span>
        <button
          className={styles.menuClose}
          onClick={onClose}
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
      </div>

      <div className={styles.menuItems}>
        <Link href="/cruising" className={styles.menuItem}>
          <span className={styles.menuItemIcon}>
            <CruisingIcon />
          </span>
          Cruising Updates
        </Link>

        <Link href="/groups" className={styles.menuItem}>
          <span className={styles.menuItemIcon}>
            <GroupsIcon />
          </span>
          Groups
        </Link>

        <button
          className={styles.menuItem}
          onClick={() => {
            onRefresh();
            onClose();
          }}
        >
          <span className={styles.menuItemIcon}>
            <RefreshIcon />
          </span>
          Refresh Map
        </button>

        <button
          className={styles.menuItem}
          onClick={() => {
            onFiltersOpen();
            onClose();
          }}
        >
          <span className={styles.menuItemIcon}>
            <FiltersIcon />
          </span>
          Filters
        </button>

        <button className={styles.menuItem} onClick={onClusterToggle}>
          <span className={styles.menuItemIcon}>
            <ClusterIcon />
          </span>
          Clustering
          <div
            className={`${styles.menuToggle} ${clusterEnabled ? styles.active : ''}`}
            role="switch"
            aria-checked={clusterEnabled}
          />
        </button>

        <Link href="/settings" className={styles.menuItem}>
          <span className={styles.menuItemIcon}>
            <SettingsIcon />
          </span>
          Settings
        </Link>

        <Link href="/blog" className={styles.menuItem}>
          <span className={styles.menuItemIcon}>
            <BlogIcon />
          </span>
          Blog
        </Link>

        <Link href="/terms" className={styles.menuItem}>
          <span className={styles.menuItemIcon}>
            <TermsIcon />
          </span>
          Terms of Service
        </Link>

        <Link href="/privacy" className={styles.menuItem}>
          <span className={styles.menuItemIcon}>
            <PrivacyIcon />
          </span>
          Privacy Policy
        </Link>

        <Link href="/guidelines" className={styles.menuItem}>
          <span className={styles.menuItemIcon}>
            <GuidelinesIcon />
          </span>
          Community Guidelines
        </Link>
      </div>
    </div>
  );
}

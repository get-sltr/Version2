// =============================================================================
// Map Feature Type Definitions
// =============================================================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapCenter extends Coordinates {
  zoom?: number;
}

// Profile as displayed on the map
export interface MapProfile {
  id: string;
  name: string;
  age: number | null;
  position: string;
  lat: number;
  lng: number;
  image: string | null;
  distance: number | null; // in feet
  online: boolean;
}

// Current user's profile (for "You" pin)
export interface CurrentUserProfile {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  image: string | null;
}

// Group event on the map
export interface MapGroup {
  id: string;
  name: string;
  host: string;
  hostId: string;
  hostImage: string | null;
  type: string;
  category: string | null;
  attendees: number;
  maxAttendees: number;
  time: string | null;
  location: string | null;
  description: string | null;
  lat: number;
  lng: number;
}

// View mode toggle
export type MapViewMode = 'users' | 'groups';

// Drawer state
export interface DrawerState {
  isOpen: boolean;
  selectedProfile: MapProfile | null;
  selectedGroup: MapGroup | null;
}

// Filter settings from localStorage
export interface MapFilterSettings {
  positionFilters: string[];
  minAge: number;
  maxAge: number;
  maxDistance: number; // in miles
}

// Viewport change event from MapboxMap
export interface ViewportChangeEvent {
  visible: MapProfile[];
}

// Cruising update
export interface CruisingUpdate {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

// Props interfaces for components
export interface ProfileDrawerProps {
  profile: MapProfile;
  onClose: () => void;
  isOpen: boolean;
}

export interface GroupDrawerProps {
  group: MapGroup;
  onClose: () => void;
  isOpen: boolean;
}

export interface MapHeaderProps {
  onMenuOpen: () => void;
}

export interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onFiltersOpen: () => void;
  clusterEnabled: boolean;
  onClusterToggle: () => void;
}

export interface CruisingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (text: string) => Promise<void>;
}

export interface CruisingFABProps {
  onClick: () => void;
}

export interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  messageCount?: number;
  viewCount?: number;
  tapCount?: number;
}

export type NavTab = 'explore' | 'taps' | 'pro' | 'messages' | 'views';

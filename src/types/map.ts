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

// Props interfaces for components
export interface ProfileDrawerProps {
  profile: MapProfile;
  onClose: () => void;
  accentColor?: string;
}

export interface GroupDrawerProps {
  group: MapGroup;
  onClose: () => void;
  accentColor?: string;
}

export interface VisibleProfilesBarProps {
  profiles: MapProfile[];
  onSelectProfile: (profile: MapProfile) => void;
}

export interface MapControlsProps {
  viewMode: MapViewMode;
  onRefresh: () => void;
}

export interface MapHeaderProps {
  userImage: string | null;
}

export interface MapToggleTabsProps {
  viewMode: MapViewMode;
  onChangeMode: (mode: MapViewMode) => void;
  userCount: number;
  groupCount: number;
}

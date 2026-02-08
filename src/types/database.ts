/**
 * TypeScript interfaces for Primal database models
 * These types match the Supabase database schema
 * Generated: 2025-12-15
 */

// ============================================================================
// ENUM TYPES
// ============================================================================

/** Position options for user profiles */
export type Position =
  | 'top'
  | 'vers-top'
  | 'versatile'
  | 'vers-bottom'
  | 'bottom'
  | 'side';

/** Tribe options for community affiliation */
export type Tribe =
  | 'bear'
  | 'twink'
  | 'jock'
  | 'otter'
  | 'daddy'
  | 'leather'
  | 'poz'
  | 'discreet'
  | 'clean-cut'
  | 'geek'
  | 'military'
  | 'rugged'
  | 'pup'
  | 'trans'
  | 'queer';

/** Group event types */
export type GroupType =
  | 'Hangout'
  | 'Party'
  | 'Sports'
  | 'Casual'
  | 'Dinner'
  | 'Drinks'
  | 'Gaming'
  | 'Other';

/** Group category for map markers */
export type GroupCategory =
  | 'bar'
  | 'restaurant'
  | 'hangout'
  | 'gym'
  | 'cafe'
  | 'outdoors'
  | 'private';

/** Message types */
export type MessageType = 'text' | 'image' | 'tap' | 'system' | 'album_share';

/** Tap types for user interactions */
export type TapType = 'flame' | 'wave' | 'wink' | 'looking';

/** Notification types */
export type NotificationType =
  | 'tap'
  | 'message'
  | 'view'
  | 'favorite'
  | 'album_share'
  | 'group_invite'
  | 'group_join'
  | 'system';

/** Report reason types */
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'fake_profile'
  | 'underage'
  | 'scam'
  | 'hate_speech'
  | 'other';

/** Group member status */
export type GroupMemberStatus = 'pending' | 'approved' | 'rejected' | 'left';

/** Group member role */
export type GroupMemberRole = 'member' | 'admin' | 'host';

/** Report status */
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

// ============================================================================
// MAIN ENTITY INTERFACES
// ============================================================================

/**
 * User Profile - Main user data
 */
export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  age: number | null;
  position: Position | null;
  tribes: Tribe[];
  tags: string[];
  bio: string | null;
  photo_url: string | null;
  photo_urls: string[];
  height: string | null;
  weight: string | null;
  body_type: string | null;
  ethnicity: string | null;
  relationship_status: string | null;
  looking_for: string[];
  hiv_status: string | null;
  last_tested: string | null;

  // Location
  lat: number | null;
  lng: number | null;
  city: string | null;
  country: string | null;

  // Travel mode
  travel_mode: boolean;
  travel_lat: number | null;
  travel_lng: number | null;
  travel_city: string | null;

  // Status flags
  is_online: boolean;
  is_incognito: boolean;
  dth_active_until: string | null;
  is_verified: boolean;
  is_premium: boolean;
  premium_until: string | null;

  // Timestamps
  last_seen: string | null;
  last_location_update: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Profile for display in lists/grids (subset of full profile)
 */
export interface ProfilePreview {
  id: string;
  display_name: string | null;
  age: number | null;
  position: Position | null;
  photo_url: string | null;
  is_online: boolean;
  dth_active_until: string | null;
  lat?: number | null;
  lng?: number | null;
  distance?: number | null; // Calculated in meters or feet
}

/**
 * Profile for map display
 */
export interface MapProfile {
  id: string;
  name: string;
  age: number | null;
  position: string;
  lat: number;
  lng: number;
  image: string | null;
  distance: number | null;
}

/**
 * User settings/preferences
 */
export interface UserSettings {
  user_id: string;

  // Display preferences
  show_age: boolean;
  show_distance: boolean;
  distance_unit: 'miles' | 'km';

  // Filter preferences
  min_age_filter: number;
  max_age_filter: number;
  max_distance: number;
  position_filters: Position[];
  tribe_filters: Tribe[];
  show_online_only: boolean;

  // Privacy settings
  incognito_mode: boolean;
  hide_from_explore: boolean;
  block_screenshots: boolean;

  // Notification settings
  push_notifications: boolean;
  email_notifications: boolean;
  push_messages: boolean;
  push_taps: boolean;
  push_favorites: boolean;
  push_views: boolean;
  email_weekly_digest: boolean;

  // Content preferences
  show_nsfw: boolean;
  long_session_visible: boolean;
  is_hosting: boolean;

  created_at: string;
  updated_at: string;
}

/**
 * Saved phrase for quick messaging
 */
export interface SavedPhrase {
  id: string;
  user_id: string;
  phrase: string;
  sort_order: number;
  created_at: string;
}

/**
 * Group event
 */
export interface Group {
  id: string;
  name: string;
  type: GroupType;
  category: GroupCategory | null;
  host_id: string;
  description: string | null;

  // Location
  location: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;

  // Schedule
  event_date: string | null;
  event_time: string | null;

  // Capacity
  attendees: number;
  max_attendees: number;
  min_age: number | null;
  max_age: number | null;

  // Settings
  tags: string[];
  is_private: boolean;
  requires_approval: boolean;

  // Status
  is_active: boolean;
  cancelled_at: string | null;

  created_at: string;
  updated_at: string | null;
}

/**
 * Group with host info for display
 */
export interface GroupWithHost extends Group {
  host: ProfilePreview;
}

/**
 * Group for map display
 */
export interface MapGroup {
  id: string;
  name: string;
  type: GroupType;
  category: GroupCategory | null;
  host: string;
  hostId: string;
  hostImage: string | null;
  attendees: number;
  maxAttendees: number;
  time: string | null;
  location: string | null;
  description: string | null;
  lat: number;
  lng: number;
}

/**
 * Group member record
 */
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
  joined_at: string;
}

/**
 * Message between users
 */
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  type: MessageType;

  // Media
  media_url: string | null;
  media_type: string | null;

  // Album share
  shared_album_id: string | null;

  // Status
  read_at: string | null;
  deleted_by_sender: boolean;
  deleted_by_recipient: boolean;

  created_at: string;
}

/**
 * Conversation thread preview
 */
export interface ConversationPreview {
  other_user_id: string;
  other_user_name: string | null;
  other_user_photo: string | null;
  last_message: string | null;
  last_message_time: string;
  last_message_type: MessageType;
  unread_count: number;
  is_online: boolean;
}

/**
 * Tap/interaction record
 */
export interface Tap {
  id: string;
  sender_id: string;
  recipient_id: string;
  tap_type: TapType;
  viewed_at: string | null;
  created_at: string;
}

/**
 * Tap with user info for display
 */
export interface TapWithUser extends Tap {
  user: ProfilePreview;
}

/**
 * Favorite/saved profile
 */
export interface Favorite {
  id: string;
  user_id: string;
  favorited_user_id: string;
  note: string | null;
  created_at: string;
}

/**
 * Favorite with profile info
 */
export interface FavoriteWithProfile extends Favorite {
  profile: ProfilePreview;
}

/**
 * User block record
 */
export interface BlockedUser {
  id: string;
  user_id: string;
  blocked_user_id: string;
  reason: string | null;
  created_at: string;
}

/**
 * Profile view record
 */
export interface ProfileView {
  id: string;
  viewer_id: string;
  viewed_id: string;
  created_at: string;
}

/**
 * Profile view with viewer info
 */
export interface ProfileViewWithUser extends ProfileView {
  viewer: ProfilePreview;
}

/**
 * Notification record
 */
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;

  // Related entities
  from_user_id: string | null;
  message_id: string | null;
  tap_id: string | null;
  group_id: string | null;

  // Content
  title: string | null;
  body: string | null;
  data: Record<string, unknown>;

  // Status
  read_at: string | null;
  clicked_at: string | null;

  created_at: string;
}

/**
 * Notification with from_user info
 */
export interface NotificationWithUser extends Notification {
  from_user: ProfilePreview | null;
}

/**
 * Photo album
 */
export interface Album {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  cover_photo_url: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Album photo
 */
export interface AlbumPhoto {
  id: string;
  user_id: string;
  album_id: string | null;
  storage_path: string;
  public_url: string;
  caption: string | null;
  is_private: boolean;
  is_nsfw: boolean;
  sort_order: number;
  created_at: string;
}

/**
 * Album share record
 */
export interface AlbumShare {
  id: string;
  album_id: string;
  owner_id: string;
  shared_with_id: string;
  expires_at: string | null;
  viewed_at: string | null;
  created_at: string;
}

/**
 * Report record
 */
export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_message_id: string | null;
  reported_group_id: string | null;

  reason: ReportReason;
  description: string | null;

  // Admin handling
  status: ReportStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  resolution_notes: string | null;

  created_at: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string>;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ProfileFilters {
  online?: boolean;
  dth?: boolean;
  minAge?: number;
  maxAge?: number;
  positions?: Position[];
  tribes?: Tribe[];
  hasPhoto?: boolean;
  maxDistance?: number;
}

export interface GroupFilters {
  type?: GroupType;
  category?: GroupCategory;
  minAttendees?: number;
  maxAttendees?: number;
  date?: string;
  hasSpace?: boolean;
}

export interface NotificationFilters {
  type?: NotificationType;
  unreadOnly?: boolean;
}

// ============================================================================
// SUPABASE DATABASE TYPES
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserSettings, 'user_id'>>;
      };
      saved_phrases: {
        Row: SavedPhrase;
        Insert: Omit<SavedPhrase, 'id' | 'created_at'>;
        Update: Partial<Omit<SavedPhrase, 'id' | 'user_id' | 'created_at'>>;
      };
      groups: {
        Row: Group;
        Insert: Omit<Group, 'id' | 'created_at' | 'updated_at' | 'attendees'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          attendees?: number;
        };
        Update: Partial<Omit<Group, 'id' | 'created_at'>>;
      };
      group_members: {
        Row: GroupMember;
        Insert: Omit<GroupMember, 'id' | 'joined_at'> & {
          joined_at?: string;
        };
        Update: Partial<Pick<GroupMember, 'role'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'deleted_by_sender' | 'deleted_by_recipient'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Pick<Message, 'read_at' | 'deleted_by_sender' | 'deleted_by_recipient'>>;
      };
      taps: {
        Row: Tap;
        Insert: Omit<Tap, 'id' | 'created_at' | 'viewed_at'>;
        Update: Partial<Pick<Tap, 'viewed_at'>>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'>;
        Update: Partial<Pick<Favorite, 'note'>>;
      };
      blocks: {
        Row: BlockedUser;
        Insert: Omit<BlockedUser, 'id' | 'created_at'>;
        Update: never;
      };
      profile_views: {
        Row: ProfileView;
        Insert: Omit<ProfileView, 'id' | 'created_at'>;
        Update: never;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Pick<Notification, 'read_at' | 'clicked_at'>>;
      };
      profile_albums: {
        Row: Album;
        Insert: Omit<Album, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Album, 'id' | 'user_id' | 'created_at'>>;
      };
      profile_photos: {
        Row: AlbumPhoto;
        Insert: Omit<AlbumPhoto, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Pick<AlbumPhoto, 'caption' | 'is_private' | 'is_nsfw' | 'sort_order'>>;
      };
      album_shares: {
        Row: AlbumShare;
        Insert: Omit<AlbumShare, 'id' | 'created_at' | 'viewed_at'>;
        Update: Partial<Pick<AlbumShare, 'viewed_at'>>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, 'id' | 'created_at' | 'status' | 'reviewed_at' | 'reviewed_by' | 'resolution_notes'>;
        Update: Partial<Pick<Report, 'status' | 'reviewed_at' | 'reviewed_by' | 'resolution_notes'>>;
      };
    };
    Functions: {
      get_nearby_profiles: {
        Args: {
          user_lat: number;
          user_lng: number;
          max_distance_meters?: number;
          result_limit?: number;
        };
        Returns: ProfilePreview[];
      };
      get_conversation: {
        Args: {
          user_a: string;
          user_b: string;
          msg_limit?: number;
          before_id?: string;
        };
        Returns: Message[];
      };
      mark_messages_read: {
        Args: {
          reader_id: string;
          sender_user_id: string;
        };
        Returns: number;
      };
      is_blocked: {
        Args: {
          user_a: string;
          user_b: string;
        };
        Returns: boolean;
      };
    };
  };
}

// ============================================================================
// REALTIME SUBSCRIPTION TYPES
// ============================================================================

export interface RealtimeMessagePayload {
  new: Message;
  old: Message | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface RealtimeNotificationPayload {
  new: Notification;
  old: Notification | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface RealtimeTapPayload {
  new: Tap;
  old: Tap | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface TypingIndicatorPayload {
  userId: string;
  threadId: string;
  isTyping: boolean;
}


// ============================================================================
// MAP COMPONENT TYPES
// ============================================================================

/** Map component view modes */
export type MapViewMode = 'users' | 'groups';

/** Props for MapHeader component */
export interface MapHeaderProps {
  userImage?: string | null;
}

/** Props for MapToggleTabs component */
export interface MapToggleTabsProps {
  viewMode: MapViewMode;
  onChangeMode: (mode: MapViewMode) => void;
  userCount: number;
  groupCount: number;
}

/** Props for MapControls component */
export interface MapControlsProps {
  viewMode: MapViewMode;
  onRefresh: () => void;
}

/** Props for ProfileDrawer component */
export interface ProfileDrawerProps {
  profile: MapProfile;
  onClose: () => void;
}

/** Props for GroupDrawer component */
export interface GroupDrawerProps {
  group: MapGroup;
  onClose: () => void;
}

/** Props for VisibleProfilesBar component */
export interface VisibleProfilesBarProps {
  profiles: MapProfile[];
  onSelectProfile: (profile: MapProfile) => void;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/** Extract the row type from a table */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Extract the insert type from a table */
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Extract the update type from a table */
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

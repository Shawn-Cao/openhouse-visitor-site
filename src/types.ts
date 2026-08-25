export type BuyerTab = 'tour' | '3d-model' | 'gallery' | 'floorplan' | 'disclosures' | 'calculator' | 'schedule';

export interface SpatialPin {
  id: string;
  roomId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  authorName: string;
  authorType: 'buyer' | 'agent' | 'ai_assistant';
  avatar?: string;
  comment: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  category: 'question' | 'praise' | 'concern' | 'spec_inquiry';
  replies?: Array<{
    id: string;
    authorName: string;
    authorType: 'buyer' | 'agent' | 'ai_assistant';
    avatar?: string;
    text: string;
    timestamp: string;
  }>;
}

export interface RoomHotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  specDetails: string;
  category: 'appliance' | 'finish' | 'architectural' | 'smart_home';
  clicks: number;
}

export interface TourRoom {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  galleryImages?: string[];
  dimensions: string;
  ceilingHeight: string;
  keyFeatures: string[];
  hotspots: RoomHotspot[];
  pins: SpatialPin[];
  likesCount: number;
  isLiked?: boolean;
  communityRating: number; // e.g. 4.9 out of 5
  activeViewersCount: number;
}

export interface LiveChatMessage {
  id: string;
  authorName: string;
  authorType: 'buyer' | 'host' | 'ai_concierge';
  avatar?: string;
  roomId?: string;
  roomName?: string;
  text: string;
  timestamp: string;
  isPinned?: boolean;
  isHostAnnouncement?: boolean;
  likes: number;
}

export interface BuyerPoll {
  id: string;
  roomId?: string;
  question: string;
  description?: string;
  options: Array<{
    id: string;
    label: string;
    votes: number;
  }>;
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface LiveAttendee {
  id: string;
  name: string;
  avatar: string;
  currentRoomId: string;
  joinedAt: string;
  statusText?: string;
  isCoTouring?: boolean;
}

export interface PropertyListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSize: string;
  yearBuilt: number;
  propertyType: string;
  hoaDues: string;
  description: string;
  headline: string;
  heroImage: string;
  floorPlanUrl?: string;
  schools: Array<{
    name: string;
    rating: string;
    type: string;
    distance: string;
  }>;
  neighborhoodHighlights: string[];
  agent: {
    name: string;
    title: string;
    brokerage: string;
    phone: string;
    email: string;
    photo: string;
    licenseNo: string;
    isBroadcastingLive?: boolean;
  };
  openHouseEvent: {
    date: string;
    timeWindow: string;
    isActiveLive: boolean;
    streamTitle: string;
    streamHostNote: string;
    offerDeadline: string;
    totalAttendees: number;
  };
  rooms: TourRoom[];
}

export interface DisclosureDocument {
  id: string;
  title: string;
  category: 'legal' | 'inspection' | 'hoa' | 'architectural';
  fileSize: string;
  pageCount: number;
  lastUpdated: string;
  description: string;
  downloadUrl: string;
}

export interface ShowingRequest {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  financing: 'cash' | 'pre_approved' | 'needs_lender' | 'browsing';
  hasAgent: boolean;
  notes: string;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // percentage across stream
}


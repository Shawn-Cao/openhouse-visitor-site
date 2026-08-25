import React, { useState, useEffect } from 'react';
import { 
  PropertyListing, 
  TourRoom, 
  SpatialPin, 
  LiveChatMessage, 
  BuyerPoll, 
  LiveAttendee, 
  FloatingReaction,
  DisclosureDocument 
} from '../types';
import { LiveHostBroadcast } from './LiveHostBroadcast';
import { SpatialTourCanvas } from './SpatialTourCanvas';
import { LiveDiscussionFeed } from './LiveDiscussionFeed';
import { BuyerSocialWidgets } from './BuyerSocialWidgets';
import { GalleryView } from './GalleryView';
import { DisclosureVaultView } from './DisclosureVaultView';
import { MortgageCalculatorView } from './MortgageCalculatorView';
import { Home3DModelView } from './Home3DModelView';
import { ShowingAndOfferModal } from './ShowingAndOfferModal';
import { AIChatDrawer } from './AIChatDrawer';
import { 
  Sparkles, 
  MessageSquare, 
  Heart, 
  Users, 
  Calendar, 
  Clock, 
  Compass,
  ArrowRight,
  ShieldCheck,
  Box
} from 'lucide-react';

interface BuyerVirtualTourProps {
  listing: PropertyListing;
  activeView: 'tour' | '3d-model' | 'gallery' | 'disclosures' | 'calculator';
  onSelectView: (view: 'tour' | '3d-model' | 'gallery' | 'disclosures' | 'calculator') => void;
  isShowingModalOpen: boolean;
  onCloseShowingModal: () => void;
  onOpenShowingModal: () => void;
  isAIChatOpen: boolean;
  onCloseAIChat: () => void;
  onOpenAIChat: () => void;
  onOpenCoTourModal: () => void;
}

export const BuyerVirtualTour: React.FC<BuyerVirtualTourProps> = ({
  listing,
  activeView,
  onSelectView,
  isShowingModalOpen,
  onCloseShowingModal,
  onOpenShowingModal,
  isAIChatOpen,
  onCloseAIChat,
  onOpenAIChat,
  onOpenCoTourModal,
}) => {
  // Tour State
  const [rooms, setRooms] = useState<TourRoom[]>(listing.rooms);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const currentRoom = rooms[selectedRoomIndex] || rooms[0];

  // Chat and Social State
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [polls, setPolls] = useState<BuyerPoll[]>([]);
  const [attendees, setAttendees] = useState<LiveAttendee[]>([]);
  const [disclosures, setDisclosures] = useState<DisclosureDocument[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  // Load initial data
  useEffect(() => {
    import('../data/mockListing').then((data) => {
      setMessages(data.INITIAL_CHAT_MESSAGES);
      setPolls(data.INITIAL_POLLS);
      setAttendees(data.INITIAL_ATTENDEES);
      setDisclosures(data.INITIAL_DISCLOSURES);
    });
  }, []);

  // Handlers for Pins
  const handleAddPin = (roomId: string, newPinData: Omit<SpatialPin, 'id' | 'timestamp' | 'likes'>) => {
    const newPin: SpatialPin = {
      ...newPinData,
      id: `pin-${Date.now()}`,
      timestamp: 'Just now',
      likes: 1,
    };

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            pins: [newPin, ...room.pins],
          };
        }
        return room;
      })
    );

    // Also broadcast to the live chat feed
    const chatMsg: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      authorName: newPin.authorName,
      authorType: 'buyer',
      avatar: newPin.avatar,
      roomId: currentRoom.id,
      roomName: currentRoom.name,
      text: `📍 [Dropped Pin in ${currentRoom.name}]: "${newPin.comment}"`,
      timestamp: 'Just now',
      likes: 1,
    };
    setMessages((prev) => [chatMsg, ...prev]);
  };

  const handleToggleRoomLike = (roomId: string) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          const isLiked = !room.isLiked;
          return {
            ...room,
            isLiked,
            likesCount: isLiked ? room.likesCount + 1 : room.likesCount - 1,
          };
        }
        return room;
      })
    );
    handleSendReaction('❤️');
  };

  const handleLikePin = (roomId: string, pinId: string) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            pins: room.pins.map((pin) =>
              pin.id === pinId ? { ...pin, likes: pin.likes + 1 } : pin
            ),
          };
        }
        return room;
      })
    );
  };

  const handleReplyToPin = (
    roomId: string,
    pinId: string,
    replyText: string,
    authorName: string
  ) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            pins: room.pins.map((pin) => {
              if (pin.id === pinId) {
                const newReply = {
                  id: `rep-${Date.now()}`,
                  authorName,
                  authorType: 'buyer' as const,
                  text: replyText,
                  timestamp: 'Just now',
                };
                return {
                  ...pin,
                  replies: [...(pin.replies || []), newReply],
                };
              }
              return pin;
            }),
          };
        }
        return room;
      })
    );
  };

  // Handlers for Live Chat
  const handleSendMessage = (text: string, authorName: string, roomId?: string) => {
    const newMsg: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      authorName,
      authorType: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      roomId,
      roomName: currentRoom.name,
      text,
      timestamp: 'Just now',
      likes: 1,
    };
    setMessages((prev) => [newMsg, ...prev]);

    // Trigger floating heart or speech reaction
    handleSendReaction('💬');

    // Simulate AI Concierge reply if question mark
    if (text.includes('?') || text.toLowerCase().includes('how') || text.toLowerCase().includes('what')) {
      setTimeout(() => {
        const aiAnswer: LiveChatMessage = {
          id: `ai-${Date.now()}`,
          authorName: 'AI Property Concierge',
          authorType: 'ai_concierge',
          text: `✨ Great question, ${authorName}! Sarah Jenkins notes that this home's custom finishes and pre-inspections are verified. Full specs are in the Disclosures tab.`,
          timestamp: 'Just now',
          likes: 2,
        };
        setMessages((prev) => [aiAnswer, ...prev]);
      }, 1500);
    }
  };

  const handleLikeMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, likes: msg.likes + 1 } : msg))
    );
  };

  // Handlers for Polls
  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          return {
            ...poll,
            totalVotes: poll.userVotedOptionId ? poll.totalVotes : poll.totalVotes + 1,
            userVotedOptionId: optionId,
            options: poll.options.map((opt) => {
              if (opt.id === optionId) {
                return { ...opt, votes: opt.votes + 1 };
              }
              if (opt.id === poll.userVotedOptionId) {
                return { ...opt, votes: Math.max(0, opt.votes - 1) };
              }
              return opt;
            }),
          };
        }
        return poll;
      })
    );
  };

  // Floating Live Reaction Bursts
  const handleSendReaction = (emoji: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const x = Math.floor(Math.random() * 80) + 10;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  const handleJumpToRoom = (roomId: string) => {
    const idx = rooms.findIndex((r) => r.id === roomId);
    if (idx !== -1) {
      setSelectedRoomIndex(idx);
      onSelectView('tour');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-16">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        
        {/* VIEW 1: 3D TOUR & LIVE DISCUSSION */}
        {activeView === 'tour' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Live Host Stage Banner */}
            <LiveHostBroadcast
              listing={listing}
              activeAttendeesCount={attendees.length}
              currentRoomName={currentRoom.name}
              onAskQuestion={() => onOpenShowingModal()}
              onSendReaction={handleSendReaction}
              floatingReactions={floatingReactions}
            />

            {/* Tour & Social Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Spatial 3D Canvas & Room Viewer */}
              <div className="lg:col-span-8 space-y-5">
                <SpatialTourCanvas
                  currentRoom={currentRoom}
                  rooms={rooms}
                  selectedRoomIndex={selectedRoomIndex}
                  onSelectRoomIndex={setSelectedRoomIndex}
                  onAddPin={handleAddPin}
                  onToggleRoomLike={handleToggleRoomLike}
                  onLikePin={handleLikePin}
                  onReplyToPin={handleReplyToPin}
                  activeViewersCount={currentRoom.activeViewersCount}
                />

                {/* Social widgets: Polls, Co-tour, Live presence, Favorites */}
                <BuyerSocialWidgets
                  polls={polls}
                  onVotePoll={handleVotePoll}
                  attendees={attendees}
                  rooms={rooms}
                  onSelectRoom={handleJumpToRoom}
                />
              </div>

              {/* Right Column: Live Chat & Discussion Stream */}
              <div className="lg:col-span-4 space-y-4">
                <LiveDiscussionFeed
                  messages={messages}
                  currentRoom={currentRoom}
                  rooms={rooms}
                  onSendMessage={handleSendMessage}
                  onLikeMessage={handleLikeMessage}
                  onOpenAIChat={onOpenAIChat}
                />

                {/* Offer review reminder card */}
                <div className="bg-gradient-to-br from-stone-900 to-amber-950/40 border border-stone-800 rounded-3xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Offer Review Schedule</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Offers Due: {listing.openHouseEvent.offerDeadline}</h4>
                    <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                      All pre-inspections, title report, and HOA documents are certified clean and ready in the Disclosures tab.
                    </p>
                  </div>
                  <button
                    onClick={onOpenShowingModal}
                    className="w-full bg-stone-950 hover:bg-stone-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <span>Submit Offer or Schedule VIP Walkthrough</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: 3D MODEL & DOLLHOUSE DIGITAL TWIN */}
        {activeView === '3d-model' && (
          <Home3DModelView
            listing={listing}
            onSelectRoomTour={handleJumpToRoom}
            onBookShowing={onOpenShowingModal}
          />
        )}

        {/* VIEW 3: PHOTO GALLERY & SPECS */}
        {activeView === 'gallery' && (
          <GalleryView
            listing={listing}
            onSelectRoomTour={handleJumpToRoom}
          />
        )}

        {/* VIEW 3: DISCLOSURE & INSPECTION VAULT */}
        {activeView === 'disclosures' && (
          <DisclosureVaultView
            disclosures={disclosures}
            listing={listing}
          />
        )}

        {/* VIEW 4: MORTGAGE & PAYMENT CALCULATOR */}
        {activeView === 'calculator' && (
          <MortgageCalculatorView
            listing={listing}
            onBookPrivateShowing={onOpenShowingModal}
          />
        )}
      </main>

      {/* Modals & Slide-over Drawers */}
      <ShowingAndOfferModal
        isOpen={isShowingModalOpen}
        onClose={onCloseShowingModal}
        listing={listing}
      />

      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={onCloseAIChat}
        listing={listing}
        currentRoomName={currentRoom.name}
      />
    </div>
  );
};

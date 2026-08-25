import React, { useState, useEffect } from 'react';
import { PropertyListing, FloatingReaction } from '../types';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Heart, 
  Flame, 
  ThumbsUp, 
  Lightbulb, 
  Home, 
  MessageSquare, 
  Calendar, 
  Share2, 
  Users,
  Maximize2,
  Minimize2,
  HelpCircle,
  Clock
} from 'lucide-react';

interface LiveHostBroadcastProps {
  listing: PropertyListing;
  activeAttendeesCount: number;
  currentRoomName: string;
  onAskQuestion: () => void;
  onSendReaction: (emoji: string) => void;
  floatingReactions: FloatingReaction[];
}

export const LiveHostBroadcast: React.FC<LiveHostBroadcastProps> = ({
  listing,
  activeAttendeesCount,
  currentRoomName,
  onAskQuestion,
  onSendReaction,
  floatingReactions,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hostStatus, setHostStatus] = useState<string>(
    'Broadcasting live from 428 Crestview: Discussing Fleetwood Pocket Slider features and canyon views.'
  );

  // Rotate host talking points dynamically for real-time live feel
  useEffect(() => {
    const quotes = [
      `Now in the ${currentRoomName}: "Notice the custom LED backlighting and seamless indoor-outdoor transition."`,
      `"Our offer review deadline is set for Tuesday at 5:00 PM PST. Pre-inspections are verified clean!"`,
      `"If you have questions about the SubZero/Wolf suite or HOA, ask in the chat!"`,
      `"Taking a look at the outdoor zero-edge pool deck. Sunsets over this canyon are unmatched."`,
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % quotes.length;
      setHostStatus(quotes[idx]);
    }, 9000);
    return () => clearInterval(interval);
  }, [currentRoomName]);

  const reactionEmojis = [
    { emoji: '❤️', label: 'Love' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '👏', label: 'Applause' },
    { emoji: '💡', label: 'Smart Spec' },
    { emoji: '🏡', label: 'Dream Home' },
  ];

  return (
    <div className="relative bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-2xl p-3 sm:p-4 overflow-hidden shadow-xl">
      {/* Floating Reaction Animation Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingReactions.map((reaction) => (
          <span
            key={reaction.id}
            style={{ left: `${reaction.x}%` }}
            className="absolute bottom-4 text-2xl animate-float-up opacity-90 filter drop-shadow-md"
          >
            {reaction.emoji}
          </span>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        
        {/* Host Avatar & Live Video Stream Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={listing.agent.photo}
              alt={listing.agent.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-amber-400 shadow-lg ring-4 ring-amber-500/20"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full border border-stone-950 flex items-center gap-0.5 shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-stone-100 text-sm sm:text-base flex items-center gap-1.5">
                {listing.agent.name}
                <span className="text-[11px] font-normal text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.2 rounded-full">
                  Listing Host
                </span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                <Users className="w-3 h-3 text-emerald-400" />
                {activeAttendeesCount} Live Buyers
              </span>
            </div>

            <p className="text-xs text-stone-300 italic mt-0.5 truncate max-w-md sm:max-w-xl">
              {hostStatus}
            </p>
          </div>
        </div>

        {/* Live Controls & Reaction Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Reaction Buttons */}
          <div className="flex items-center gap-1 bg-stone-950/80 border border-stone-800 p-1 rounded-xl shadow-inner">
            {reactionEmojis.map((item) => (
              <button
                key={item.emoji}
                onClick={() => onSendReaction(item.emoji)}
                title={item.label}
                className="w-8 h-8 rounded-lg hover:bg-stone-800 text-base transition-transform active:scale-125 flex items-center justify-center cursor-pointer hover:shadow-sm"
              >
                {item.emoji}
              </button>
            ))}
          </div>

          {/* Audio toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-stone-100 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title={isMuted ? 'Unmute host broadcast' : 'Mute host broadcast'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Live Audio'}</span>
          </button>

          {/* Ask Host Question */}
          <button
            onClick={onAskQuestion}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-stone-950" />
            <span>Ask Host Live</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { PropertyListing } from '../types';
import { 
  Home, 
  Sparkles, 
  Calendar, 
  Heart, 
  Share2, 
  Users, 
  ShieldCheck, 
  Check, 
  Camera, 
  FileText, 
  Calculator,
  Compass,
  Radio,
  Clock,
  UserPlus,
  Box
} from 'lucide-react';

interface HeaderProps {
  listing: PropertyListing;
  activeView: 'tour' | '3d-model' | 'gallery' | 'disclosures' | 'calculator';
  onSelectView: (view: 'tour' | '3d-model' | 'gallery' | 'disclosures' | 'calculator') => void;
  activeAttendeesCount: number;
  totalSavedFavorites: number;
  isSavedFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenShowingModal: () => void;
  onOpenAIChat: () => void;
  onOpenCoTourModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  listing,
  activeView,
  onSelectView,
  activeAttendeesCount,
  totalSavedFavorites,
  isSavedFavorite,
  onToggleFavorite,
  onOpenShowingModal,
  onOpenAIChat,
  onOpenCoTourModal,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 text-stone-100">
      
      {/* Top Banner: Live Broadcast Status & Offer Countdown */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 px-4 py-1 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-950"></span>
          </span>
          <span className="font-bold tracking-tight">
            🔴 LIVE VIRTUAL OPEN HOUSE HOSTED BY {listing.agent.name.toUpperCase()} ({listing.agent.brokerage})
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            Offer Review Deadline: <strong className="underline">{listing.openHouseEvent.offerDeadline}</strong>
          </span>
          <span className="bg-stone-950 text-amber-300 px-2 py-0.2 rounded-md font-mono font-bold">
            {activeAttendeesCount} Buyers Touring Now
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Listing Title & Price */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Home className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg sm:text-xl text-white tracking-tight truncate">
                {listing.address}
              </h1>
              <span className="text-xs text-stone-400 hidden sm:inline">• {listing.city}, {listing.state}</span>
              <span className="text-[10px] bg-stone-900 border border-stone-700 text-stone-300 px-2 py-0.5 rounded font-mono">
                {listing.neighborhood}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-stone-300 mt-0.5">
              <span className="text-amber-400 font-bold font-mono text-sm sm:text-base">
                ${listing.price.toLocaleString()}
              </span>
              <span className="text-stone-600">|</span>
              <span><strong>{listing.beds}</strong> Beds</span>
              <span className="text-stone-600">|</span>
              <span><strong>{listing.baths}</strong> Baths</span>
              <span className="text-stone-600">|</span>
              <span><strong>{listing.sqft.toLocaleString()}</strong> SqFt</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Favorite / Save */}
          <button
            onClick={onToggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSavedFavorite
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-stone-900 text-stone-300 hover:text-white border-stone-800'
            }`}
            title="Save home to your wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isSavedFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isSavedFavorite ? 'Saved' : 'Save'}</span>
          </button>

          {/* Co-Tour Invite */}
          <button
            onClick={onOpenCoTourModal}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Invite family member or partner to co-tour"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Co-Tour</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Copy shareable link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-stone-400" />}
            <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>

          {/* Ask AI Concierge */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Concierge</span>
          </button>

          {/* Book Showing / Offer */}
          <button
            onClick={onOpenShowingModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-950" />
            <span>Book Showing / Offer</span>
          </button>
        </div>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-stone-900 pt-1 pb-1.5">
        {[
          { id: 'tour', label: '360 Walkthrough & Live Host', icon: Compass, badge: 'Live Stream' },
          { id: '3d-model', label: '3D Model & Dollhouse', icon: Box, badge: 'Interactive 3D' },
          { id: 'gallery', label: 'Photo Gallery & Specs', icon: Camera, badge: 'HD Photos' },
          { id: 'disclosures', label: 'Disclosures & Vault', icon: FileText, badge: 'Verified' },
          { id: 'calculator', label: 'Mortgage Estimator', icon: Calculator },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isActive ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-400 border border-stone-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};

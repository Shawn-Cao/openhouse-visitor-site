import React, { useState, useEffect } from 'react';
import { PropertyListing } from './types';
import { INITIAL_LISTING } from './data/mockListing';
import { Header } from './components/Header';
import { BuyerVirtualTour } from './components/BuyerVirtualTour';

const getViewFromLocation = (): 'tour' | '3d-model' | 'gallery' | 'disclosures' | 'calculator' => {
  if (typeof window === 'undefined') return 'tour';
  try {
    const params = new URLSearchParams(window.location.search);
    const viewParam = (params.get('view') || params.get('tab') || '').toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (viewParam === '3d-model' || viewParam === '3d' || viewParam === 'model' || hash.includes('3d') || hash.includes('model') || hash.includes('dollhouse')) {
      return '3d-model';
    }
    if (viewParam === 'gallery' || hash.includes('gallery') || hash.includes('photos') || hash.includes('specs')) {
      return 'gallery';
    }
    if (viewParam === 'disclosures' || hash.includes('disclosures') || hash.includes('inspections') || hash.includes('docs')) {
      return 'disclosures';
    }
    if (viewParam === 'calculator' || hash.includes('calculator') || hash.includes('mortgage') || hash.includes('finance')) {
      return 'calculator';
    }
    return 'tour';
  } catch (e) {
    return 'tour';
  }
};

export default function App() {
  const [activeView, setActiveView] = useState<'tour' | '3d-model' | 'gallery' | 'disclosures' | 'calculator'>(getViewFromLocation);
  const [listing, setListing] = useState<PropertyListing>(INITIAL_LISTING);
  const [isSavedFavorite, setIsSavedFavorite] = useState(false);
  const [isShowingModalOpen, setIsShowingModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<{ title: string; message: string } | null>(null);

  // Sync with browser URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setActiveView(getViewFromLocation());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleSelectView = (view: 'tour' | '3d-model' | 'gallery' | 'disclosures' | 'calculator') => {
    setActiveView(view);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      url.hash = view;
      window.history.pushState({ view }, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  const showNotification = (title: string, message: string) => {
    setLiveToast({ title, message });
    setTimeout(() => {
      setLiveToast(null);
    }, 4500);
  };

  const handleToggleFavorite = () => {
    const nextState = !isSavedFavorite;
    setIsSavedFavorite(nextState);
    if (nextState) {
      showNotification('❤️ Saved to Your Dream Homes', `${listing.address} is saved to your wishlist.`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-stone-950">
      
      {/* Buyer Header & Tab Bar */}
      <Header
        listing={listing}
        activeView={activeView}
        onSelectView={handleSelectView}
        activeAttendeesCount={listing.openHouseEvent.totalAttendees || 18}
        totalSavedFavorites={isSavedFavorite ? 1 : 0}
        isSavedFavorite={isSavedFavorite}
        onToggleFavorite={handleToggleFavorite}
        onOpenShowingModal={() => setIsShowingModalOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenCoTourModal={() => {
          showNotification(
            '🔗 Co-Tour Link Copied!',
            'Share this link with your co-buyer or spouse to tour in synchronized live view.'
          );
        }}
      />

      {/* Main Tour Experience Container */}
      <BuyerVirtualTour
        listing={listing}
        activeView={activeView}
        onSelectView={handleSelectView}
        isShowingModalOpen={isShowingModalOpen}
        onCloseShowingModal={() => setIsShowingModalOpen(false)}
        onOpenShowingModal={() => setIsShowingModalOpen(true)}
        isAIChatOpen={isAIChatOpen}
        onCloseAIChat={() => setIsAIChatOpen(false)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenCoTourModal={() => {
          showNotification(
            '🔗 Co-Tour Link Copied!',
            'Share this link with your co-buyer or spouse to tour in synchronized live view.'
          );
        }}
      />

      {/* Live Toast Notifications */}
      {liveToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm bg-stone-900 border-2 border-amber-500 text-stone-100 p-4 rounded-2xl shadow-2xl animate-fade-in flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-amber-300 truncate">{liveToast.title}</h4>
            <p className="text-[11px] text-stone-300 mt-0.5 leading-tight">{liveToast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

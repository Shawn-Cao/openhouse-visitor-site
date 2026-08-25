import React, { useState } from 'react';
import { TourRoom, SpatialPin, RoomHotspot } from '../types';
import { 
  MapPin, 
  MessageSquare, 
  Info, 
  Plus, 
  X, 
  Heart, 
  Star, 
  Eye, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Compass, 
  Sparkles,
  Send,
  ThumbsUp,
  ShieldCheck
} from 'lucide-react';

interface SpatialTourCanvasProps {
  currentRoom: TourRoom;
  rooms: TourRoom[];
  selectedRoomIndex: number;
  onSelectRoomIndex: (index: number) => void;
  onAddPin: (roomId: string, pin: Omit<SpatialPin, 'id' | 'timestamp' | 'likes'>) => void;
  onToggleRoomLike: (roomId: string) => void;
  onLikePin: (roomId: string, pinId: string) => void;
  onReplyToPin: (roomId: string, pinId: string, replyText: string, authorName: string) => void;
  activeViewersCount: number;
}

export const SpatialTourCanvas: React.FC<SpatialTourCanvasProps> = ({
  currentRoom,
  rooms,
  selectedRoomIndex,
  onSelectRoomIndex,
  onAddPin,
  onToggleRoomLike,
  onLikePin,
  onReplyToPin,
  activeViewersCount,
}) => {
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const [selectedPin, setSelectedPin] = useState<SpatialPin | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<RoomHotspot | null>(null);
  const [newPinCoords, setNewPinCoords] = useState<{ x: number; y: number } | null>(null);
  
  // Pin form fields
  const [newPinAuthor, setNewPinAuthor] = useState('');
  const [newPinComment, setNewPinComment] = useState('');
  const [newPinCategory, setNewPinCategory] = useState<'question' | 'praise' | 'concern' | 'spec_inquiry'>('question');

  // Pin reply input
  const [replyInput, setReplyInput] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinModeActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setNewPinCoords({ x, y });
    setSelectedPin(null);
    setSelectedHotspot(null);
  };

  const handleCreatePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinCoords || !newPinComment.trim()) return;

    onAddPin(currentRoom.id, {
      roomId: currentRoom.id,
      x: newPinCoords.x,
      y: newPinCoords.y,
      authorName: newPinAuthor.trim() || 'Visiting Homebuyer',
      authorType: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      comment: newPinComment.trim(),
      category: newPinCategory,
      replies: [
        {
          id: `rep-${Date.now()}`,
          authorName: 'AI Property Concierge',
          authorType: 'ai_assistant',
          text: `Thank you for your question about ${currentRoom.name}! The host and listing team have been alerted live.`,
          timestamp: 'Just now',
        },
      ],
    });

    setNewPinCoords(null);
    setNewPinComment('');
    setIsPinModeActive(false);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPin || !replyInput.trim()) return;
    onReplyToPin(
      currentRoom.id,
      selectedPin.id,
      replyInput.trim(),
      replyAuthor.trim() || 'Visiting Buyer'
    );
    setReplyInput('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Room Selection Carousel / Navigation Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2">
          {rooms.map((room, idx) => (
            <button
              key={room.id}
              onClick={() => {
                onSelectRoomIndex(idx);
                setSelectedPin(null);
                setSelectedHotspot(null);
                setNewPinCoords(null);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                selectedRoomIndex === idx
                  ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span>{room.name}</span>
              {room.pins.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedRoomIndex === idx ? 'bg-stone-950 text-amber-400' : 'bg-stone-800 text-amber-400'
                }`}>
                  {room.pins.length} 📍
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Social room stats */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => onToggleRoomLike(currentRoom.id)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              currentRoom.isLiked
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-stone-900 text-stone-300 hover:text-white border-stone-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${currentRoom.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{currentRoom.likesCount} Loves</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-stone-300 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentRoom.activeViewersCount} here now</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Spatial Viewport */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-stone-950 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl group select-none">
        
        {/* Room Photo & Interactive Click Area */}
        <div
          onClick={handleImageClick}
          className={`w-full h-full relative ${isPinModeActive ? 'cursor-crosshair' : 'cursor-default'}`}
        >
          <img
            src={currentRoom.imageUrl}
            alt={currentRoom.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.008]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/40 pointer-events-none" />

          {/* Spatial Pin Markers */}
          {currentRoom.pins.map((pin) => {
            const isSelected = selectedPin?.id === pin.id;
            const isQuestion = pin.category === 'question';
            const isPraise = pin.category === 'praise';

            return (
              <div
                key={pin.id}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin(pin);
                  setSelectedHotspot(null);
                  setNewPinCoords(null);
                }}
              >
                <button
                  className={`relative group/pin flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-xl transition-all transform hover:scale-125 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 border-white text-stone-950 ring-4 ring-amber-400/40 scale-110'
                      : isQuestion
                      ? 'bg-blue-600 border-white text-white'
                      : isPraise
                      ? 'bg-emerald-600 border-white text-white'
                      : 'bg-amber-500 border-white text-stone-950'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  
                  {/* Subtle pulsing indicator */}
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>

                  {/* Tooltip Hover Preview */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:flex flex-col items-center pointer-events-none z-30 w-52 text-center">
                    <div className="bg-stone-900/95 text-stone-100 text-xs px-3 py-2 rounded-xl border border-stone-700 shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-amber-300 truncate">{pin.authorName}</span>
                        <span className="text-[9px] text-stone-400">{pin.timestamp}</span>
                      </div>
                      <span className="text-[11px] text-stone-200 line-clamp-2 leading-tight">{pin.comment}</span>
                    </div>
                    <div className="w-2.5 h-2.5 bg-stone-900 border-r border-b border-stone-700 rotate-45 -mt-1"></div>
                  </div>
                </button>
              </div>
            );
          })}

          {/* Architectural Hotspots */}
          {currentRoom.hotspots.map((hs) => (
            <div
              key={hs.id}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotspot(hs);
                setSelectedPin(null);
                setNewPinCoords(null);
              }}
            >
              <button className="flex items-center gap-1.5 bg-stone-950/85 hover:bg-stone-900 text-stone-200 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg transition-all transform hover:scale-105 cursor-pointer">
                <Info className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">{hs.title}</span>
              </button>
            </div>
          ))}

          {/* Placement Marker for New Pin */}
          {newPinCoords && (
            <div
              style={{ left: `${newPinCoords.x}%`, top: `${newPinCoords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 animate-bounce"
            >
              <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-amber-400/50">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Room Overlay Details (Bottom of image) */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 flex items-end justify-between pointer-events-none z-10">
          <div className="pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-400 bg-stone-950/85 px-2.5 py-0.5 rounded-md border border-stone-800">
                {currentRoom.dimensions} • Ceiling: {currentRoom.ceilingHeight}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/50 flex items-center gap-1">
                <Star className="w-3 h-3 fill-emerald-400" />
                {currentRoom.communityRating} Rating
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-md">
              {currentRoom.name}
            </h2>
            <p className="text-xs text-stone-300 drop-shadow max-w-lg hidden sm:block mt-0.5">
              {currentRoom.description}
            </p>
          </div>

          {/* Pin Drop Action Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                setIsPinModeActive(!isPinModeActive);
                setSelectedPin(null);
                setSelectedHotspot(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xl cursor-pointer ${
                isPinModeActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
              }`}
            >
              {isPinModeActive ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel Pin Mode</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>+ Drop a Question / Comment Pin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pin mode helper tooltip */}
        {isPinModeActive && !newPinCoords && (
          <div className="absolute top-4 inset-x-0 mx-auto max-w-sm bg-stone-950/90 border border-amber-500/60 text-amber-300 text-xs px-4 py-2.5 rounded-2xl text-center shadow-2xl backdrop-blur-md z-30 animate-fade-in pointer-events-none font-semibold">
            🎯 Tap anywhere on the photo above to drop your comment pin!
          </div>
        )}
      </div>

      {/* Popovers / Details Cards for Selected Pin or Hotspot */}
      {newPinCoords && (
        <div className="bg-stone-900 border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-3 border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-stone-100">Drop Pin in {currentRoom.name}</span>
            </div>
            <button
              onClick={() => setNewPinCoords(null)}
              className="text-stone-400 hover:text-stone-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreatePinSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">Your Name / Handle</label>
                <input
                  type="text"
                  value={newPinAuthor}
                  onChange={(e) => setNewPinAuthor(e.target.value)}
                  placeholder="e.g. Alex (Buyer)"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Pin Category</label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'question', label: '❓ Question' },
                    { id: 'praise', label: '⭐️ Praise / Love' },
                    { id: 'spec_inquiry', label: '📐 Material Spec' },
                    { id: 'concern', label: '📝 Note' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setNewPinCategory(cat.id as any)}
                      className={`px-2 py-1.5 rounded-lg text-left text-[11px] transition-colors cursor-pointer ${
                        newPinCategory === cat.id
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-950 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-stone-400 mb-1">Your Question or Comment</label>
              <textarea
                rows={2}
                value={newPinComment}
                onChange={(e) => setNewPinComment(e.target.value)}
                placeholder="Ask about countertops, warranties, natural lighting, appliances..."
                className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNewPinCoords(null)}
                className="px-3 py-2 rounded-xl text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Pin to Room</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Pin Thread Drawer */}
      {selectedPin && !newPinCoords && (
        <div className="bg-stone-900 border border-stone-700 rounded-2xl p-4 sm:p-5 shadow-2xl animate-fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-stone-100">Pin Discussion Thread</span>
              <span className="text-[10px] text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                {currentRoom.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              className="text-stone-400 hover:text-stone-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-300">{selectedPin.authorName}</span>
                <span className="text-[10px] text-stone-500">{selectedPin.timestamp}</span>
              </div>
              <button
                onClick={() => onLikePin(currentRoom.id, selectedPin.id)}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{selectedPin.likes}</span>
              </button>
            </div>
            <p className="text-xs text-stone-200 leading-relaxed">{selectedPin.comment}</p>
          </div>

          {/* Replies */}
          {selectedPin.replies && selectedPin.replies.length > 0 && (
            <div className="space-y-2 pl-3 border-l-2 border-amber-500/50">
              {selectedPin.replies.map((reply) => (
                <div key={reply.id} className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {reply.authorName}
                    </span>
                    <span className="text-[9px] text-stone-500">{reply.timestamp}</span>
                  </div>
                  <p className="text-stone-300 text-xs leading-relaxed">{reply.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <form onSubmit={handleReplySubmit} className="flex gap-2 pt-2">
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Write a reply or follow-up question..."
              className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </form>
        </div>
      )}

      {/* Selected Architectural Hotspot Card */}
      {selectedHotspot && !newPinCoords && !selectedPin && (
        <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl animate-fade-in space-y-2">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-stone-100">Architectural & Material Specification</span>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-stone-400 hover:text-stone-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs space-y-2">
            <h3 className="font-bold text-base text-amber-300">{selectedHotspot.title}</h3>
            <p className="text-stone-300 leading-relaxed">{selectedHotspot.description}</p>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
              <span className="text-[10px] text-stone-400 block uppercase font-semibold">Technical Detail:</span>
              <span className="text-stone-200 font-mono text-xs">{selectedHotspot.specDetails}</span>
            </div>
          </div>
        </div>
      )}

      {/* Room Features & Dimension Strip */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="font-semibold text-stone-400 uppercase tracking-wider text-[10px]">Room Highlights:</span>
          <div className="flex flex-wrap gap-1.5">
            {currentRoom.keyFeatures.map((feat, idx) => (
              <span key={idx} className="bg-stone-950 text-stone-300 px-2.5 py-1 rounded-lg border border-stone-800 text-[11px]">
                • {feat}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-stone-400">Dimensions:</span>
          <span className="font-bold text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2.5 py-1 rounded-lg">
            {currentRoom.dimensions}
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { LiveChatMessage, TourRoom } from '../types';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Pin, 
  ThumbsUp, 
  Filter, 
  Radio, 
  Bot, 
  User,
  HelpCircle
} from 'lucide-react';

interface LiveDiscussionFeedProps {
  messages: LiveChatMessage[];
  currentRoom: TourRoom;
  rooms: TourRoom[];
  onSendMessage: (text: string, authorName: string, roomId?: string) => void;
  onLikeMessage: (messageId: string) => void;
  onOpenAIChat: () => void;
}

export const LiveDiscussionFeed: React.FC<LiveDiscussionFeedProps> = ({
  messages,
  currentRoom,
  rooms,
  onSendMessage,
  onLikeMessage,
  onOpenAIChat,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'current-room' | 'host-only'>('all');
  const [inputMessage, setInputMessage] = useState('');
  const [authorName, setAuthorName] = useState('');

  const filteredMessages = messages.filter((msg) => {
    if (filterMode === 'host-only') return msg.authorType === 'host' || msg.isHostAnnouncement;
    if (filterMode === 'current-room') return !msg.roomId || msg.roomId === currentRoom.id;
    return true;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(
      inputMessage.trim(),
      authorName.trim() || 'Visiting Homebuyer',
      currentRoom.id
    );
    setInputMessage('');
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-5 flex flex-col h-[580px] shadow-xl">
      {/* Header with Title & Filter Tabs */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
              Live Open House Chat
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>
            <span className="text-[10px] text-stone-400">Real-time buyer discussions</span>
          </div>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-[10px] font-semibold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              filterMode === 'all' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('current-room')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              filterMode === 'current-room' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            This Room
          </button>
          <button
            onClick={() => setFilterMode('host-only')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              filterMode === 'host-only' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Host Q&A
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs no-scrollbar">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-12">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p>No messages matching this filter.</p>
            <p className="text-[11px] text-amber-400 mt-1">Be the first to say hello or ask the host a question!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isHost = msg.authorType === 'host';
            const isAI = msg.authorType === 'ai_concierge';

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl border transition-all ${
                  msg.isPinned
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : isHost
                    ? 'bg-stone-950/90 border-amber-500/30'
                    : isAI
                    ? 'bg-stone-950/90 border-indigo-500/30'
                    : 'bg-stone-950 border-stone-800'
                }`}
              >
                {/* Author Bar */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {msg.avatar ? (
                      <img
                        src={msg.avatar}
                        alt={msg.authorName}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-stone-300 shrink-0">
                        {msg.authorName.charAt(0)}
                      </div>
                    )}

                    <span
                      className={`font-bold text-xs truncate ${
                        isHost ? 'text-amber-400' : isAI ? 'text-indigo-300' : 'text-stone-200'
                      }`}
                    >
                      {msg.authorName}
                    </span>

                    {isHost && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold shrink-0">
                        Host
                      </span>
                    )}

                    {isAI && (
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-semibold shrink-0 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> AI
                      </span>
                    )}

                    {msg.roomName && (
                      <span className="text-[9px] text-stone-500 bg-stone-900 px-1.5 py-0.2 rounded border border-stone-800 truncate">
                        {msg.roomName}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-stone-500 shrink-0">{msg.timestamp}</span>
                </div>

                {/* Message Body */}
                <p className="text-stone-300 leading-relaxed pl-7 text-[12px]">{msg.text}</p>

                {/* Message Footer: Like Button */}
                <div className="flex items-center justify-end gap-2 mt-1.5 pl-7">
                  <button
                    onClick={() => onLikeMessage(msg.id)}
                    className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{msg.likes}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Fast Help Prompt Banner */}
      <div className="bg-stone-950 border border-stone-800/80 rounded-2xl p-2.5 mb-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-stone-300 text-[11px]">Instant answers regarding schools, HOA & finishes</span>
        </div>
        <button
          onClick={onOpenAIChat}
          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
        >
          Ask AI Concierge →
        </button>
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your Name (optional)"
            className="w-1/3 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
          />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask a question or comment on ${currentRoom.name}...`}
            className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

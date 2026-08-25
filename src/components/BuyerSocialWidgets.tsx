import React, { useState } from 'react';
import { BuyerPoll, LiveAttendee, TourRoom } from '../types';
import { 
  Users, 
  Vote, 
  Share2, 
  Heart, 
  Check, 
  Sparkles, 
  UserPlus, 
  Star,
  Copy,
  Link,
  Flame
} from 'lucide-react';

interface BuyerSocialWidgetsProps {
  polls: BuyerPoll[];
  onVotePoll: (pollId: string, optionId: string) => void;
  attendees: LiveAttendee[];
  rooms: TourRoom[];
  onSelectRoom: (roomId: string) => void;
}

export const BuyerSocialWidgets: React.FC<BuyerSocialWidgetsProps> = ({
  polls,
  onVotePoll,
  attendees,
  rooms,
  onSelectRoom,
}) => {
  const [activeWidgetTab, setActiveWidgetTab] = useState<'polls' | 'attendees' | 'cotour' | 'favorites'>('polls');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerInviteSent, setPartnerInviteSent] = useState(false);
  const [coTourLinkCopied, setCoTourLinkCopied] = useState(false);

  const handleCopyCoTour = () => {
    const link = `${window.location.origin}${window.location.pathname}?co-tour=partner-${Date.now().toString(36)}#tour`;
    navigator.clipboard.writeText(link);
    setCoTourLinkCopied(true);
    setTimeout(() => setCoTourLinkCopied(false), 3000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerEmail) return;
    setPartnerInviteSent(true);
    setTimeout(() => {
      setPartnerInviteSent(false);
      setPartnerEmail('');
    }, 4000);
  };

  // Sort rooms by community love
  const sortedRooms = [...rooms].sort((a, b) => b.likesCount - a.likesCount);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Widget Tabs */}
      <div className="flex items-center justify-between gap-1 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveWidgetTab('polls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeWidgetTab === 'polls'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Buyer Polls</span>
          </button>

          <button
            onClick={() => setActiveWidgetTab('attendees')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeWidgetTab === 'attendees'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Live Attendees ({attendees.length})</span>
          </button>

          <button
            onClick={() => setActiveWidgetTab('cotour')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeWidgetTab === 'cotour'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Co-Tour Invite</span>
          </button>

          <button
            onClick={() => setActiveWidgetTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeWidgetTab === 'favorites'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Community Loves</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BUYER POLLS */}
      {activeWidgetTab === 'polls' && (
        <div className="space-y-4 animate-fade-in text-xs">
          {polls.map((poll) => {
            const hasVoted = Boolean(poll.userVotedOptionId);

            return (
              <div key={poll.id} className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-stone-100">{poll.question}</h4>
                  {poll.description && (
                    <p className="text-[11px] text-stone-400 mt-0.5">{poll.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const isSelected = poll.userVotedOptionId === opt.id;
                    const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => onVotePoll(poll.id, opt.id)}
                        className={`w-full relative overflow-hidden rounded-xl p-3 text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-stone-100 font-bold'
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        {/* Progress Bar Fill */}
                        {hasVoted && (
                          <div
                            style={{ width: `${percent}%` }}
                            className={`absolute inset-y-0 left-0 transition-all duration-500 opacity-25 ${
                              isSelected ? 'bg-amber-400' : 'bg-stone-600'
                            }`}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <span className="text-xs">{opt.label}</span>
                          {hasVoted && (
                            <span className="font-mono text-xs font-bold text-amber-300 shrink-0">
                              {percent}% ({opt.votes})
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                  <span>{poll.totalVotes} homebuyers voted</span>
                  {hasVoted && <span className="text-emerald-400 font-medium">✓ Vote Recorded</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: LIVE ATTENDEES PRESENCE */}
      {activeWidgetTab === 'attendees' && (
        <div className="space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Buyers currently in the open house:</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
              {attendees.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attendees.map((attendee) => (
              <div
                key={attendee.id}
                onClick={() => onSelectRoom(attendee.currentRoomId)}
                className="bg-stone-950 p-3 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={attendee.avatar}
                    alt={attendee.name}
                    className="w-9 h-9 rounded-full object-cover border border-stone-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-stone-200 truncate group-hover:text-amber-300">{attendee.name}</h5>
                      {attendee.isCoTouring && (
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 rounded">Co-Tour</span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 truncate">{attendee.statusText}</p>
                  </div>
                </div>

                <span className="text-[10px] text-amber-400/80 group-hover:text-amber-400 shrink-0">
                  Join Room →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CO-TOURING PARTNER INVITE */}
      {activeWidgetTab === 'cotour' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
            <div>
              <h4 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                Tour Together with a Partner or Family Member
              </h4>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Invite your spouse, co-buyer, or personal buyer agent to browse this home simultaneously with synced spatial pins and shared notes.
              </p>
            </div>

            {/* Quick Share Link */}
            <div>
              <label className="block text-stone-400 text-[11px] mb-1">Instant Synchronized Co-Tour Link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${window.location.pathname}?co-tour=live#tour`}
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-300 font-mono"
                />
                <button
                  onClick={handleCopyCoTour}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {coTourLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{coTourLinkCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Email Invite form */}
            <form onSubmit={handleSendInvite} className="pt-2 border-t border-stone-800/80 space-y-2">
              <label className="block text-stone-400 text-[11px]">Or Email VIP Open House Pass:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="partner@example.com"
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                  required
                />
                <button
                  type="submit"
                  className="bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  {partnerInviteSent ? 'Sent! ✓' : 'Send Pass'}
                </button>
              </div>
              {partnerInviteSent && (
                <p className="text-[11px] text-emerald-400">Co-tour invitation link sent successfully!</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: COMMUNITY LOVES & FAVORITE ROOMS */}
      {activeWidgetTab === 'favorites' && (
        <div className="space-y-3 animate-fade-in text-xs">
          <span className="text-stone-400">Most loved spaces by visiting homebuyers:</span>

          <div className="space-y-2">
            {sortedRooms.map((room, idx) => (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className="bg-stone-950 p-3 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-12 h-9 rounded-lg object-cover border border-stone-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-stone-200 truncate group-hover:text-amber-300">{room.name}</h5>
                    <p className="text-[10px] text-stone-400">{room.dimensions} • {room.ceilingHeight}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-md">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    {room.likesCount}
                  </span>
                  <span className="text-stone-500 group-hover:text-amber-400 text-xs">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { PropertyListing } from '../types';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  CheckCircle2, 
  ShieldCheck,
  HelpCircle,
  Clock
} from 'lucide-react';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  listing: PropertyListing;
  currentRoomName: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  listing,
  currentRoomName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I’m your AI Property Concierge for 428 Crestview Ridge Way. Ask me anything regarding property specs, appliance models, HOA covenants, school districts, or seller disclosures.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    `What are the HOA rules for Trousdale Estates?`,
    `Tell me about the kitchen appliances and range`,
    `What school district does this home belong to?`,
    `When is the offer review deadline?`,
  ];

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/property-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          propertyContext: listing,
          currentRoom: currentRoomName,
        }),
      });

      if (!res.ok) throw new Error('Failed to get answer');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'Thank you for your question! Sarah Jenkins and the team have been informed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Fallback helpful response based on property data
      let fallbackText = `Here is information on that: 428 Crestview is a 4-bed, 4.5-bath modern estate listed at $2,850,000 in Trousdale Estates. Offer deadline is ${listing.openHouseEvent.offerDeadline}.`;
      if (q.toLowerCase().includes('hoa')) {
        fallbackText = `Trousdale Estates HOA dues are $180/month covering 24/7 dedicated security patrols, license plate scanners, and private street maintenance.`;
      } else if (q.toLowerCase().includes('kitchen') || q.toLowerCase().includes('appliance')) {
        fallbackText = `The chef's kitchen is equipped with a 48" Wolf dual-fuel 6-burner range, Sub-Zero 48" column refrigerator/freezer, Miele espresso system, dual Bosch dishwashers, and Taj Mahal quartzite waterfall countertops.`;
      } else if (q.toLowerCase().includes('school')) {
        fallbackText = `The home is zoned for El Rodeo Elementary (9/10, K-8) and Beverly Hills High School (9/10), with Harvard-Westlake located 3.8 miles away.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col animate-slide-left text-stone-100">
      {/* Header */}
      <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">AI Property Concierge</h3>
            <p className="text-[10px] text-stone-400">Instant answers from verified disclosures & specs</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs no-scrollbar">
        {messages.map((m) => {
          const isAI = m.sender === 'ai';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isAI ? 'items-start' : 'items-end justify-end'}`}
            >
              {isAI && (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  isAI
                    ? 'bg-stone-950 border border-stone-800 text-stone-200'
                    : 'bg-amber-500 text-stone-950 font-medium'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[9px] block mt-1 ${
                    isAI ? 'text-stone-500' : 'text-stone-800 text-right'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-stone-400 text-xs pl-8">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Consulting listing specifications & disclosures...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 border-t border-stone-800 bg-stone-950/60 space-y-1.5">
        <span className="text-[10px] text-stone-400 font-semibold block">Suggested Inquiries:</span>
        <div className="flex flex-wrap gap-1">
          {quickQuestions.map((qq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qq)}
              className="text-[10px] bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 px-2 py-1 rounded-lg transition-colors text-left truncate max-w-full cursor-pointer"
            >
              {qq}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="p-3 bg-stone-950 border-t border-stone-800 flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about 428 Crestview..."
          className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold px-4 py-2 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

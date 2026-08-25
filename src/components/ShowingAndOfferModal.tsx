import React, { useState } from 'react';
import { PropertyListing } from '../types';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Send, 
  X, 
  CheckCircle2, 
  Phone, 
  Mail, 
  User,
  FileCheck
} from 'lucide-react';

interface ShowingAndOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: PropertyListing;
}

export const ShowingAndOfferModal: React.FC<ShowingAndOfferModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  const [activeTab, setActiveTab] = useState<'showing' | 'offer' | 'contact'>('showing');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('Tomorrow (Monday)');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [financingType, setFinancingType] = useState('pre_approved');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in relative text-stone-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-100 p-1.5 rounded-full hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">Private VIP Showing & Offer Center</h3>
          </div>
          <p className="text-xs text-stone-400">
            {listing.address}, {listing.city} • Offered at ${listing.price.toLocaleString()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-2xl border border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('showing')}
            className={`flex-1 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              activeTab === 'showing' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Book Private Tour
          </button>
          <button
            onClick={() => setActiveTab('offer')}
            className={`flex-1 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              activeTab === 'offer' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Offer Guidelines
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              activeTab === 'contact' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Direct Host Contact
          </button>
        </div>

        {/* TAB 1: BOOK SHOWING FORM */}
        {activeTab === 'showing' && (
          <div>
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">VIP Showing Requested!</h4>
                <p className="text-xs text-stone-300 max-w-xs mx-auto">
                  Sarah Jenkins and the listing team have received your request for {preferredDate} at {preferredTime}. A calendar invitation has been sent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="(310) 555-0199"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Preferred Date</label>
                    <select
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    >
                      <option>Tomorrow (Monday)</option>
                      <option>Tuesday Morning (Before deadline)</option>
                      <option>Wednesday</option>
                      <option>Weekend Walkthrough</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Time Slot</label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                    >
                      <option>9:00 AM – 10:00 AM</option>
                      <option>10:00 AM – 11:00 AM</option>
                      <option>1:00 PM – 2:00 PM</option>
                      <option>4:00 PM (Sunset Golden Hour)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Financing Status</label>
                  <select
                    value={financingType}
                    onChange={(e) => setFinancingType(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="cash">All Cash (Verified Proof of Funds)</option>
                    <option value="pre_approved">Pre-Approved Jumbo Mortgage</option>
                    <option value="contingent">Contingent on Home Sale</option>
                    <option value="unrepresented">Unrepresented Buyer (Request Listing Agent Representation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Specific Questions or Areas of Focus</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Would like to inspect the wine cellar refrigeration and pool mechanicals."
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirm VIP Showing Appointment</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: OFFER GUIDELINES */}
        {activeTab === 'offer' && (
          <div className="space-y-3.5 text-xs text-stone-300">
            <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl">
              <span className="font-bold text-amber-400 text-xs block mb-0.5">Offer Review Deadline:</span>
              <p className="text-stone-200 font-semibold">{listing.openHouseEvent.offerDeadline}</p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-stone-100">Submission Requirements:</h5>
              <ul className="space-y-1.5 text-stone-400">
                <li className="flex items-start gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Standard California Association of Realtors (C.A.R.) Residential Purchase Agreement (RPA).</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Proof of Funds (POF) and Mortgage Pre-Approval letter dated within the last 30 days.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Signed receipt of digital disclosure package.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Submit offers directly to: <span className="font-mono text-amber-300">{listing.agent.email}</span></span>
                </li>
              </ul>
            </div>

            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 text-[11px] text-stone-400">
              Escrow holder: First American Title Company (Beverly Hills Branch).
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT HOST */}
        {activeTab === 'contact' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              <img
                src={listing.agent.photo}
                alt={listing.agent.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-400"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-sm text-stone-100">{listing.agent.name}</h4>
                <p className="text-amber-400 text-[11px]">{listing.agent.title}</p>
                <p className="text-stone-400 text-[10px]">{listing.agent.brokerage} • {listing.agent.licenseNo}</p>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={`tel:${listing.agent.phone}`}
                className="flex items-center gap-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 p-3.5 rounded-2xl text-stone-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <span className="text-[10px] text-stone-400 block">Direct Mobile / SMS:</span>
                  <span className="font-mono font-bold text-xs">{listing.agent.phone}</span>
                </div>
              </a>

              <a
                href={`mailto:${listing.agent.email}`}
                className="flex items-center gap-3 bg-stone-950 hover:bg-stone-800 border border-stone-800 p-3.5 rounded-2xl text-stone-200 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <div className="text-left">
                  <span className="text-[10px] text-stone-400 block">Direct Email:</span>
                  <span className="font-mono font-bold text-xs">{listing.agent.email}</span>
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

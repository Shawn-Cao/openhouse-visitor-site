import React, { useState } from 'react';
import { DisclosureDocument, PropertyListing } from '../types';
import { 
  FileText, 
  Download, 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Calendar,
  Eye
} from 'lucide-react';

interface DisclosureVaultViewProps {
  disclosures: DisclosureDocument[];
  listing: PropertyListing;
}

export const DisclosureVaultView: React.FC<DisclosureVaultViewProps> = ({
  disclosures,
  listing,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'legal' | 'inspection' | 'hoa'>('all');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredDocs = disclosures.filter((doc) => {
    if (activeCategory === 'all') return true;
    return doc.category === activeCategory;
  });

  const handleDownload = (docId: string, title: string) => {
    setDownloadSuccessId(docId);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              Verified Pre-Inspection & Legal Repository
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Digital Disclosure Package & Property Reports
          </h2>
          <p className="text-xs text-stone-300 max-w-2xl mt-1 leading-relaxed">
            All statutory disclosures, home and pool inspections, preliminary title reports, and HOA financials are pre-compiled and signed for full buyer transparency prior to the offer review date ({listing.openHouseEvent.offerDeadline}).
          </p>
        </div>

        <div className="shrink-0 bg-stone-950 p-3.5 rounded-2xl border border-stone-800 text-center">
          <span className="text-[10px] text-stone-400 uppercase font-semibold block">Total Package Size</span>
          <span className="text-base font-bold text-amber-300 font-mono">37.9 MB (6 Docs)</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">✓ 100% Complete & Signed</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Documents (6)' },
          { id: 'inspection', label: 'Inspection & Engineering (2)' },
          { id: 'legal', label: 'Title, NHD & Seller Disclosures (3)' },
          { id: 'hoa', label: 'HOA CC&Rs & Reserves (1)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const isDownloaded = downloadSuccessId === doc.id;

          return (
            <div
              key={doc.id}
              className="bg-stone-900 border border-stone-800 hover:border-stone-700 p-5 rounded-3xl shadow-lg flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-100 leading-snug">{doc.title}</h4>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {doc.pageCount} Pages • {doc.fileSize} • {doc.lastUpdated}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    doc.category === 'inspection'
                      ? 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                      : doc.category === 'hoa'
                      ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                  }`}>
                    {doc.category}
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed pl-12">
                  {doc.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Verified Authentic
                </span>

                <button
                  onClick={() => handleDownload(doc.id, doc.title)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                    isDownloaded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-amber-400'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloaded ? 'Downloaded ✓' : 'Download PDF'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

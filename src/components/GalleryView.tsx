import React, { useState } from 'react';
import { PropertyListing, TourRoom } from '../types';
import { 
  Camera, 
  MapPin, 
  Layers, 
  School, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  Maximize2, 
  Sparkles,
  Home,
  Check
} from 'lucide-react';

interface GalleryViewProps {
  listing: PropertyListing;
  onSelectRoomTour: (roomId: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ listing, onSelectRoomTour }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<'all' | 'interior' | 'kitchen' | 'outdoor'>('all');

  // Aggregate all gallery photos
  const allPhotos = [
    { url: listing.heroImage, title: 'Front Facade & Architectural Entry', category: 'outdoor', roomName: 'Exterior' },
    ...listing.rooms.map((room) => ({
      url: room.imageUrl,
      title: `${room.name} — Primary View`,
      category: room.id.includes('kitchen') ? 'kitchen' : room.id.includes('pool') ? 'outdoor' : 'interior',
      roomName: room.name,
      roomId: room.id,
    })),
    ...listing.rooms.flatMap((room) =>
      (room.galleryImages || []).map((imgUrl, i) => ({
        url: imgUrl,
        title: `${room.name} — Detail Angle ${i + 1}`,
        category: room.id.includes('kitchen') ? 'kitchen' : room.id.includes('pool') ? 'outdoor' : 'interior',
        roomName: room.name,
        roomId: room.id,
      }))
    ),
  ];

  const filteredPhotos = allPhotos.filter((p) => {
    if (filterTag === 'all') return true;
    return p.category === filterTag;
  });

  return (
    <div className="space-y-8 animate-fade-in text-stone-100">
      {/* Property Key Specs Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Offered At', value: `$${listing.price.toLocaleString()}`, sub: `$${Math.round(listing.price / listing.sqft)} / sqft` },
          { label: 'Bedrooms', value: `${listing.beds} Beds`, sub: 'All En-Suite Suites' },
          { label: 'Bathrooms', value: `${listing.baths} Baths`, sub: 'Honed Calacatta Marble' },
          { label: 'Living Area', value: `${listing.sqft.toLocaleString()} SqFt`, sub: 'Conditioned Interior' },
          { label: 'Lot Size', value: listing.lotSize, sub: 'Trousdale View Parcel' },
          { label: 'Year Built', value: `${listing.yearBuilt}`, sub: '2023 Custom Remodel' },
        ].map((item, idx) => (
          <div key={idx} className="bg-stone-900 border border-stone-800 p-4 rounded-2xl shadow-sm">
            <span className="text-[10px] sm:text-[11px] text-stone-400 uppercase font-semibold block">{item.label}</span>
            <div className="text-base sm:text-lg font-bold text-amber-300 mt-0.5">{item.value}</div>
            <span className="text-[10px] text-stone-500">{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Property Narrative & Story */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-stone-100">Architectural Narrative & Design Overview</h3>
          </div>
          <p className="text-stone-300 text-sm leading-relaxed">
            {listing.headline}
          </p>
          <p className="text-stone-400 text-xs leading-relaxed">
            {listing.description}
          </p>

          <div className="pt-3 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-2">
                Structural & Smart-Home Specs:
              </span>
              <ul className="space-y-1.5 text-stone-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fleetwood motorized pocket glass slider walls</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Control4 / Lutron smart automation & lighting</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bowers & Wilkins architectural ceiling audio</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Level 2 dual Tesla / universal EV chargers</span>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-2">
                Kitchen & Luxury Finishes:
              </span>
              <ul className="space-y-1.5 text-stone-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>14ft Taj Mahal quartzite waterfall slab island</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>48” Wolf dual-fuel range & Sub-Zero column suite</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>WhisperKOOL 450-bottle frameless wine vault</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Heated Calacatta marble primary spa wet room</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Neighborhood & Top Rated Schools */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <School className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-stone-100">Top-Rated Nearby Schools</h3>
            </div>
            
            <div className="space-y-2.5">
              {listing.schools.map((school, i) => (
                <div key={i} className="bg-stone-950 p-3 rounded-2xl border border-stone-800 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-stone-200">{school.name}</h5>
                    <p className="text-[11px] text-stone-400">{school.type} • {school.distance}</p>
                  </div>
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md text-xs">
                    {school.rating}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-2">
                Trousdale Estates Highlights:
              </span>
              <ul className="space-y-1.5 text-stone-400 text-xs">
                {listing.neighborhoodHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* High-Resolution Photo Gallery Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              High-Resolution Architectural Photo Gallery
            </h3>
            <p className="text-xs text-stone-400">Click any image to view in high resolution or jump to that room in 3D walkthrough.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            {[
              { id: 'all', label: 'All Photos' },
              { id: 'interior', label: 'Living & Suites' },
              { id: 'kitchen', label: 'Kitchen & Dining' },
              { id: 'outdoor', label: 'Pool & Patio' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTag(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterTag === tab.id
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 cursor-pointer shadow-md"
              onClick={() => setSelectedPhoto(photo.url)}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <span className="text-xs font-bold text-white drop-shadow">{photo.title}</span>
                {photo.roomId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoomTour(photo.roomId!);
                    }}
                    className="mt-2 text-[11px] text-amber-300 font-semibold underline hover:text-amber-200"
                  >
                    Open in 3D Tour & Drop Pins →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
            <img
              src={selectedPhoto}
              alt="Expanded view"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-stone-900/80 text-white hover:bg-stone-800 p-2 rounded-full border border-stone-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

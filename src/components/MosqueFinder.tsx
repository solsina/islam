import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSettingsStore } from '../store/useSettingsStore';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

// Custom Mosque Icon
const mosqueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjc0OCI+PHBhdGggZD0iTTEyIDJDMiAyIDUgMTIgNSAxMkgxOUMxOSA1IDEyIDIgMTIgMlpNMTEgMTRWMjBIMTNWMTRIMTFaTTcgMTRWMjBIOVYxNEg3Wk0xNSAxNFYyMEgxN1YxNEgxNVoiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="width: 16px; height: 16px; background-color: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

interface Mosque {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'name:fr'?: string;
  };
  distance?: number;
}

export default function MosqueFinder() {
  const navigate = useNavigate();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const location = useSettingsStore((state) => state.location);
  const center: [number, number] = useMemo(() => mapCenter || [location.lat, location.lng], [location.lat, location.lng, mapCenter]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLon = parseFloat(data[0].lon);
        setMapCenter([newLat, newLon]);
        fetchMosquesAt(newLat, newLon);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMosquesAt = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lng});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lng});
          relation["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${lat},${lng});
        );
        out center;
      `;
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `data=${encodeURIComponent(query)}`
      });
      const data = await response.json();
      const processed = data.elements.map((el: any) => {
        const mLat = el.lat || el.center?.lat;
        const mLon = el.lon || el.center?.lon;
        return {
          ...el,
          lat: mLat,
          lon: mLon,
          distance: calculateDistance(lat, lng, mLat, mLon)
        };
      }).sort((a: Mosque, b: Mosque) => (a.distance || 0) - (b.distance || 0));
      setMosques(processed.slice(0, 15));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c;
  };

  useEffect(() => {
    fetchMosquesAt(location.lat, location.lng);
  }, [location.lat, location.lng]);

  return (
    <div className="bg-card-dark border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[500px]">
      <div className="p-6 border-b border-white/5 shrink-0 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-black text-lg tracking-tight uppercase">Mosquées du Monde</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{mosques.length} lieux trouvés</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            <button 
              onClick={() => navigate('/mosques')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
            >
              <span className="material-symbols-outlined text-xl">fullscreen</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une ville ou une mosquée..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 pl-10 text-xs text-white focus:outline-none focus:border-primary/50 transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/20 text-primary text-[8px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-primary hover:text-black transition-all">
            Aller
          </button>
        </form>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <ChangeView center={center} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />
          <Marker position={center} icon={userIcon} />
          {mosques.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lon]} icon={mosqueIcon}>
              <Popup>
                <div className="text-center p-1">
                  <p className="font-bold text-slate-900 text-xs mb-1">{m.tags?.name || 'Mosquée'}</p>
                  <p className="text-[10px] text-slate-500 mb-2">{m.distance?.toFixed(1)} km</p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase"
                  >
                    Itinéraire
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* List overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {mosques.map((m) => (
            <motion.div 
              key={m.id}
              whileHover={{ y: -5 }}
              className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl min-w-[160px] shrink-0"
            >
              <p className="text-white font-bold text-[10px] truncate mb-1">{m.tags?.name || 'Mosquée'}</p>
              <div className="flex justify-between items-center">
                <span className="text-primary font-black text-[9px] uppercase">{m.distance?.toFixed(1)} km</span>
                <span className="text-slate-500 text-[8px] font-bold uppercase tracking-tighter">~{Math.round((m.distance || 0) * 12)} min</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

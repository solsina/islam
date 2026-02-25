import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSettingsStore } from '../store/useSettingsStore';

// Fix Leaflet icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Mosque Icon
const mosqueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjc0OCI+PHBhdGggZD0iTTEyIDJDMiAyIDUgMTIgNSAxMkgxOUMxOSA1IDEyIDIgMTIgMlpNMTEgMTRWMjBIMTNWMTRIMTFaTTcgMTRWMjBIOVYxNEg3Wk0xNSAxNFYyMEgxN1YxNEgxNVoiLz48L3N2Zz4=',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Custom User Icon
const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `<div style="width: 20px; height: 20px; background-color: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); animation: pulse 2s infinite;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to update map center when location changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface Mosque {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'name:fr'?: string;
    amenity?: string;
    religion?: string;
  };
  distance?: number;
}

export default function Mosques() {
  const [search, setSearch] = useState('');
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useSettingsStore((state) => state.location);

  const center: [number, number] = [location.lat, location.lng];

  // Calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return d;
  };

  useEffect(() => {
    const fetchMosques = async () => {
      setLoading(true);
      try {
        // Overpass API query to find mosques within 5km
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${location.lat},${location.lng});
            way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${location.lat},${location.lng});
            relation["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${location.lat},${location.lng});
          );
          out center;
        `;
        
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        
        const data = await response.json();
        
        // Process and sort by distance
        const processedMosques = data.elements.map((el: any) => {
          const lat = el.lat || el.center?.lat;
          const lon = el.lon || el.center?.lon;
          return {
            ...el,
            lat,
            lon,
            distance: calculateDistance(location.lat, location.lng, lat, lon)
          };
        }).sort((a: Mosque, b: Mosque) => (a.distance || 0) - (b.distance || 0));

        // Deduplicate by coordinates (sometimes Overpass returns multiple nodes for the same building)
        const uniqueMosques = processedMosques.filter((mosque: Mosque, index: number, self: Mosque[]) =>
          index === self.findIndex((m) => (
            Math.abs(m.lat - mosque.lat) < 0.0001 && Math.abs(m.lon - mosque.lon) < 0.0001
          ))
        );

        setMosques(uniqueMosques);
      } catch (error) {
        console.error("Error fetching mosques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMosques();
  }, [location.lat, location.lng]);

  const filteredMosques = useMemo(() => {
    return mosques.filter(m => {
      const name = m.tags?.name || m.tags?.['name:fr'] || 'Mosquée';
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [mosques, search]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
      <Header leftIcon="arrow_back" title="Mosquées à proximité" />

      <div className="px-4 pt-2 pb-4 shrink-0 z-10 relative">
        <div className="relative flex items-center group">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors z-10">search</span>
          <input 
            type="text" 
            placeholder="Rechercher une mosquée..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card-dark/80 backdrop-blur-md border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-lg"
          />
        </div>
      </div>

      <div className="h-64 shrink-0 relative z-0 rounded-b-[2rem] overflow-hidden shadow-2xl border-b border-white/5 -mt-4">
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <ChangeView center={center} zoom={14} />
          {/* Dark theme tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {/* User Location */}
          <Marker position={center} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="text-center">
                <p className="font-bold text-slate-800">Votre position</p>
                <p className="text-xs text-slate-500">{location.city}</p>
              </div>
            </Popup>
          </Marker>

          {/* Mosques */}
          {filteredMosques.map((mosque) => (
            <Marker 
              key={mosque.id} 
              position={[mosque.lat, mosque.lon]}
              icon={mosqueIcon}
            >
              <Popup className="custom-popup">
                <div className="text-center">
                  <p className="font-bold text-slate-800 mb-1">
                    {mosque.tags?.name || mosque.tags?.['name:fr'] || 'Mosquée'}
                  </p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full mt-1"
                  >
                    Y aller
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Gradient overlay to blend map with list */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background-dark to-transparent z-[1000] pointer-events-none"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold tracking-wide">Résultats ({filteredMosques.length})</h3>
          <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/10">Rayon de 5km</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(16,183,72,0.5)]"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">Recherche des mosquées...</p>
          </div>
        ) : filteredMosques.length > 0 ? (
          filteredMosques.map((mosque) => {
            const name = mosque.tags?.name || mosque.tags?.['name:fr'] || 'Mosquée';
            const dist = mosque.distance ? mosque.distance.toFixed(1) : '?';
            const time = mosque.distance ? Math.round(mosque.distance * 12) : '?'; // Rough estimate: 12 mins per km walking

            return (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                key={mosque.id} 
                className="bg-card-dark border border-white/5 rounded-2xl p-3 flex gap-4 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer group shadow-lg"
              >
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-white/10 to-white/5 overflow-hidden shrink-0 relative border border-white/10 group-hover:border-primary/30 transition-colors">
                  <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mosque/200/200')] bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/70 group-hover:text-primary text-3xl drop-shadow-lg transition-colors">mosque</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">{name}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                      {dist} km de vous
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                      ~{time} min à pied
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors border border-white/10 group-hover:border-primary">
                      <span className="material-symbols-outlined text-[18px]">directions</span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })
        ) : (
          <div className="text-center py-16 bg-card-dark/50 rounded-3xl border border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <span className="material-symbols-outlined text-slate-500 text-3xl">location_off</span>
            </div>
            <p className="text-white font-bold mb-1">Aucune mosquée trouvée</p>
            <p className="text-slate-400 text-sm">Élargissez votre recherche ou vérifiez votre position.</p>
          </div>
        )}
      </div>
    </div>
  );
}

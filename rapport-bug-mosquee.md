# Rapport de Bug - Page Mosquées

## Problème rencontré
La carte (MapContainer de react-leaflet) ne s'affiche pas du tout, et la liste des mosquées trouvées (bien qu'indiquant "5 trouvées") semble invisible ou coupée. Le fond reste noir/sombre et les éléments interactifs de la carte n'apparaissent pas.

## Analyse du problème

1. **Problème de la Carte (Leaflet) invisible :**
   - Le composant `<MapContainer>` a besoin d'une hauteur explicite pour s'afficher. Actuellement, il a `style={{ height: '100%', width: '100%' }}`.
   - Le parent de `<MapContainer>` est `<div className="flex-1 relative z-0">`.
   - Cependant, le parent global est `<div className="flex-1 bg-[#0d1a14] relative h-screen flex flex-col overflow-hidden font-sans">`.
   - Il est possible que la hauteur `100%` ne soit pas correctement calculée si un des parents n'a pas une hauteur définie de manière absolue ou si flexbox ne distribue pas l'espace correctement.
   - De plus, les styles CSS de Leaflet (`leaflet/dist/leaflet.css`) sont bien importés, mais il arrive parfois que des conflits CSS avec Tailwind (notamment sur les z-index ou les overflow) cachent la carte.

2. **Problème de la liste des mosquées invisible :**
   - La liste est contenue dans `<motion.div className="... max-h-[45vh] overflow-y-auto no-scrollbar">`.
   - Le parent de ce `motion.div` est `<div className="pointer-events-auto">` qui est lui-même dans `<div className="absolute bottom-0 left-0 right-0 z-[400] pointer-events-none">`.
   - Il est possible que le `max-h-[45vh]` combiné avec le positionnement absolu en bas (`bottom-0`) fasse que le contenu soit poussé en dehors de l'écran ou caché derrière un autre élément.
   - Le conteneur parent a `pointer-events-none` et l'enfant a `pointer-events-auto`, ce qui est correct pour laisser passer les clics sur la carte, mais peut-être que la hauteur n'est pas bien gérée.

## Code de la page (`/src/pages/Mosques.tsx`)

Voici le code complet de la page pour que tu puisses l'analyser et trouver la solution :

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../components/Header';
import { useSettingsStore } from '../store/useSettingsStore';
import { motion, AnimatePresence } from 'motion/react';
import { getPrayerTimes, formatTime } from '../utils/prayerTimes';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Mosque Icon
const mosqueIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2319/2319870.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
    className: 'drop-shadow-lg'
});

// Component to update map center
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

interface Mosque {
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
  proximity: number;
  image: string;
  localisation: string;
  times: string[];
  iqama: string[];
  jumua: string | null;
  womenSpace: boolean;
  ablutions: boolean;
  parking: boolean;
  handicapAccessibility: boolean;
}

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const DirectionsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.71 11.29l-9-9a1 1 0 0 0-1.42 0l-9 9a1 1 0 0 0 0 1.42l9 9a1 1 0 0 0 1.42 0l9-9a1 1 0 0 0 0-1.42zM14 14.5V12h-4v3H8v-4a1 1 0 0 1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const BoltIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

export default function Mosques() {
  const { location } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Default Paris
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

  useEffect(() => {
    if (location && location.lat && location.lng) {
      setSearchQuery(location.city || '');
      setMapCenter([location.lat, location.lng]);
      fetchMosquesByCoords(location.lat, location.lng, location.city || '');
    } else if (location && location.city) {
      setSearchQuery(location.city);
      searchCityAndMosques(location.city);
    }
  }, [location?.lat, location?.lng, location?.city]);

  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 +
      Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
      Math.sin(dLng/2)**2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  const fetchMosquesByCoords = async (lat: number, lon: number, city: string = '') => {
    setLoading(true);
    try {
      const radiusMeters = 5000;
      const query = `
        [out:json];
        (
          node['amenity'='place_of_worship']['religion'='muslim'](around:${radiusMeters},${lat},${lon});
          way['amenity'='place_of_worship']['religion'='muslim'](around:${radiusMeters},${lat},${lon});
        );
        out center;
      `;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(query),
      });
      
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      if (data.elements && data.elements.length > 0) {
        const formattedMosques = data.elements.map((el: any) => {
          const mLat = el.lat || el.center?.lat;
          const mLon = el.lon || el.center?.lon;
          const distance = getDistanceKm(lat, lon, mLat, mLon) * 1000; // in meters
          
          return {
            uuid: el.id.toString(),
            name: el.tags?.name || el.tags?.['name:fr'] || 'Mosquée',
            latitude: mLat,
            longitude: mLon,
            proximity: distance,
            image: '',
            localisation: el.tags?.['addr:street'] ? `${el.tags?.['addr:housenumber'] || ''} ${el.tags?.['addr:street']}`.trim() : (city || 'Localisation inconnue'),
            times: ['--', '--', '--', '--', '--', '--'],
            iqama: [],
            jumua: null,
            womenSpace: false,
            ablutions: false,
            parking: false,
            handicapAccessibility: false
          };
        }).sort((a: any, b: any) => a.proximity - b.proximity);
        
        setMosques(formattedMosques);
      } else {
        setMosques([]);
      }
    } catch (error) {
      console.error("Error fetching mosques from Overpass:", error);
      setMosques([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCityAndMosques = async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      // First get coordinates for the city
      const cityRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const cityData = await cityRes.json();
      
      if (cityData && cityData.length > 0) {
        const lat = parseFloat(cityData[0].lat);
        const lon = parseFloat(cityData[0].lon);
        setMapCenter([lat, lon]);
        await fetchMosquesByCoords(lat, lon, query);
      } else {
        setMosques([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching city coordinates:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCityAndMosques(searchQuery);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setMapCenter([lat, lon]);
          setSearchQuery("Ma position");
          await fetchMosquesByCoords(lat, lon);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          alert("Impossible d'obtenir votre position.");
        }
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const prayerNames = ['Fajr', 'Chourouq', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div className="flex-1 bg-[#0d1a14] relative h-screen flex flex-col overflow-hidden font-sans">
      <Header className="bg-transparent border-none" leftIcon="arrow_back" onLeftClick={() => window.history.back()} rightIcon="my_location" onRightClick={handleLocateMe} />

      {/* Search bar */}
      <div className="px-4 pt-2 z-10 absolute top-14 left-0 right-0">
        <form onSubmit={handleSearch} className="bg-[#14201a]/92 backdrop-blur-md rounded-[30px] px-[18px] py-3 flex items-center gap-2.5 border border-[#4ade80]/20">
            <span className="text-[#4ade80] flex items-center"><SearchIcon /></span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nearby mosques..." 
              className="bg-transparent border-none outline-none text-white placeholder:text-white/35 text-[15px] flex-1"
            />
            <span className="text-white/40 flex items-center"><MicIcon /></span>
        </form>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-2.5 flex gap-2 overflow-x-auto no-scrollbar absolute top-[115px] left-0 right-0 z-10">
        {[
          { label: "Women's Section", icon: "♀", key: "womenSpace" },
          { label: "Jumu'ah", icon: "🕌", key: "jumua" },
          { label: "Parking", icon: "P", key: "parking" },
        ].map((chip) => (
          <div key={chip.label} className="bg-[#14201a]/88 backdrop-blur-sm border-[1.5px] border-[#4ade80]/35 rounded-full px-3 py-1.5 text-[#e2f5ec] text-xs font-medium flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
            <span>{chip.icon}</span>
            {chip.label}
          </div>
        ))}
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer center={mapCenter} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }} className="z-0 bg-[#0d1a14]">
            <ChangeView center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              className="map-tiles"
            />
            {mosques.map((mosque) => (
              <Marker 
                  key={mosque.uuid} 
                  position={[mosque.latitude, mosque.longitude]}
                  icon={mosqueIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedMosque(mosque);
                      setMapCenter([mosque.latitude, mosque.longitude]);
                    },
                  }}
              />
            ))}
        </MapContainer>

        {/* Bottom Sheet */}
        <div className="absolute bottom-0 left-0 right-0 z-[400] pointer-events-none">
          <div className="pointer-events-auto">
            <AnimatePresence mode="wait">
              {selectedMosque ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="bg-[#121c16]/95 backdrop-blur-xl rounded-t-[28px] p-5 pb-7 border border-[#4ade80]/15 border-b-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1">
                      <h2 className="text-white text-xl font-bold m-0 tracking-[-0.3px]">{selectedMosque.name}</h2>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[#4ade80]/80 flex items-center"><LocationIcon /></span>
                        <span className="text-white/50 text-xs">
                          {selectedMosque.localisation.split(',')[0]} · {(selectedMosque.proximity / 1000).toFixed(1)} km
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2.5">
                      <button className="w-10 h-10 bg-[#4ade80]/15 border-[1.5px] border-[#4ade80]/30 rounded-full text-[#4ade80] flex items-center justify-center cursor-pointer">
                        <ShareIcon />
                      </button>
                      <button 
                        onClick={() => setSelectedMosque(null)}
                        className="w-10 h-10 bg-[#4ade80]/15 border-[1.5px] border-[#4ade80]/30 rounded-full text-[#4ade80] flex items-center justify-center cursor-pointer transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>

                  {/* Prayer times */}
                  <div className="flex gap-1.5 my-4">
                    {selectedMosque.times.slice(0, 5).map((time, idx) => {
                      // Adjust index since Mawaqit returns 6 times (Fajr, Chourouq, Dhuhr, Asr, Maghrib, Isha)
                      // We want to skip Chourouq (idx 1) in the 5-prayer display
                      const displayIdx = idx >= 1 ? idx + 1 : idx;
                      if (idx === 5) return null; // We only show 5 boxes
                      
                      const actualTime = selectedMosque.times[displayIdx];
                      const prayerName = prayerNames[displayIdx];
                      
                      // Simple logic to determine active prayer (just for UI demonstration)
                      const isActive = displayIdx === 4; // Hardcoded to Maghrib for the design match
                      
                      return (
                        <div key={displayIdx} className={`flex-1 rounded-xl p-2 text-center ${isActive ? 'bg-transparent border-2 border-[#4ade80] shadow-[0_0_16px_rgba(74,222,128,0.2)]' : 'bg-white/5 border-[1.5px] border-white/10'}`}>
                          <div className={`text-[9px] font-bold tracking-[0.5px] mb-1.5 ${isActive ? 'text-[#4ade80]' : 'text-white/40'}`}>
                            {prayerName.toUpperCase()}
                          </div>
                          <div className={`text-[15px] font-bold tracking-[-0.5px] ${isActive ? 'text-[#4ade80]' : 'text-white'}`}>
                            {actualTime}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Get Directions button */}
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMosque.latitude},${selectedMosque.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-4 bg-[#4ade80] border-none rounded-[18px] text-[#0a1a0f] text-[17px] font-bold cursor-pointer flex items-center justify-center gap-2.5 tracking-[-0.2px] shadow-[0_4px_24px_rgba(74,222,128,0.35)] no-underline"
                  >
                    <DirectionsIcon />
                    Get Directions
                  </a>

                  {/* Footer meta */}
                  <div className="flex items-center gap-1.5 mt-3.5">
                    <StarIcon />
                    <span className="text-[#FFD700] text-[13px] font-semibold">4.8</span>
                    <span className="text-white/35 text-xs">(1.2k)</span>
                    <span className="text-white/20 text-[11px] mx-0.5">•</span>
                    <span className="text-[#4ade80] text-xs font-semibold flex items-center gap-[3px]">
                      <BoltIcon /> Mawaqit Verified
                    </span>
                    <span className="text-white/30 text-[11px] ml-auto">
                      Iqamah updated 5m ago
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-[#121c16]/95 backdrop-blur-xl rounded-t-[28px] p-5 pb-7 border border-[#4ade80]/15 border-b-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[45vh] overflow-y-auto no-scrollbar"
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-white text-sm font-bold uppercase tracking-widest">Mosquées à proximité</h3>
                    <span className="text-[10px] font-bold text-[#4ade80] bg-[#4ade80]/10 px-2 py-1 rounded-full border border-[#4ade80]/20">{mosques.length} trouvées</span>
                  </div>
                  
                  <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-white/40 flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined animate-spin text-[#4ade80]">refresh</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Recherche en cours...</span>
                        </div>
                    ) : mosques.length > 0 ? (
                        mosques.map((mosque) => (
                        <motion.div 
                            key={mosque.uuid}
                            variants={itemVariants}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#4ade80]/30 transition-all group shadow-lg"
                            onClick={() => {
                              setSelectedMosque(mosque);
                              setMapCenter([mosque.latitude, mosque.longitude]);
                            }}
                        >
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                              <img src={mosque.image || "https://picsum.photos/seed/mosque/100/100"} alt={mosque.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-100 text-sm truncate group-hover:text-[#4ade80] transition-colors">{mosque.name}</h4>
                              <p className="text-[10px] text-white/40 truncate mt-0.5">{mosque.localisation}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] font-bold text-[#4ade80] bg-[#4ade80]/10 px-1.5 py-0.5 rounded border border-[#4ade80]/20">
                                  {(mosque.proximity / 1000).toFixed(1)} km
                                </span>
                                {mosque.jumua && (
                                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    Jumu'ah {mosque.jumua}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-[#4ade80] group-hover:text-black transition-colors shrink-0">
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </div>
                        </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-white/40 flex flex-col items-center gap-2 bg-white/5 rounded-2xl border border-white/5">
                            <span className="material-symbols-outlined text-3xl opacity-50">location_off</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Aucune mosquée trouvée</span>
                            <p className="text-xs mt-1 opacity-70">Essayez de rechercher une autre ville</p>
                        </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Pistes de solution pour Claude

1. **Pour la carte (MapContainer) :**
   - Le conteneur parent `<div className="flex-1 relative z-0">` a bien `flex-1`, mais il faut s'assurer que son parent direct `<div className="flex-1 bg-[#0d1a14] relative h-screen flex flex-col overflow-hidden font-sans">` prend bien toute la hauteur.
   - Parfois, dans React Leaflet, il faut forcer la hauteur de `.leaflet-container` en CSS.
   - Ajouter `min-height: 100%` ou une hauteur fixe (ex: `h-[calc(100vh-60px)]`) au conteneur de la carte pourrait résoudre le problème.

2. **Pour la liste des mosquées :**
   - Le `motion.div` de la liste a `max-h-[45vh] overflow-y-auto`. S'il y a 5 mosquées, elles devraient s'afficher.
   - Le problème vient probablement du fait que le conteneur parent a `pointer-events-none` et que bien que l'enfant ait `pointer-events-auto`, le z-index ou le positionnement absolu (`bottom-0`) pourrait causer un bug d'affichage (par exemple, si la hauteur du parent est 0).
   - Il faudrait vérifier si les éléments de la liste ne sont pas cachés par un autre élément ou si la couleur du texte/fond ne les rend pas invisibles.
   - Il y a un padding bottom `pb-7` sur le conteneur de la liste, peut-être que la liste est scrollée tout en bas par défaut ou que la hauteur calculée est incorrecte.

3. **Conflit de Layout :**
   - La page utilise `h-screen` mais elle est rendue à l'intérieur de `<Layout>` qui a aussi des styles complexes (`flex-1 flex flex-col w-full h-full overflow-hidden`). Il y a peut-être un conflit de hauteur (`h-screen` vs `h-full`) qui fait que la carte a une hauteur de 0 pixels.
   - Essayer de remplacer `h-screen` par `h-full` dans le conteneur principal de `Mosques.tsx`.

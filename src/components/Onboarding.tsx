import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfileStore } from '../store/useProfileStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Mosque Icon
const mosqueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjc0OCI+PHBhdGggZD0iTTEyIDJDMiAyIDUgMTIgNSAxMkgxOUMxOSA1IDEyIDIgMTIgMlpNMTEgMTRWMjBIMTNWMTRIMTFaTTcgMTRWMjBIOVYxNEg3Wk0xNSAxNFYyMEgxN1YxNEgxNVoiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
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
}

const steps = [
  {
    id: 'welcome',
    title: 'Bienvenue',
    subtitle: 'Commencez votre voyage spirituel avec Emerald Islam.',
    icon: 'auto_awesome',
  },
  {
    id: 'personal',
    title: 'Qui êtes-vous ?',
    subtitle: 'Apprenons à nous connaître pour personnaliser votre expérience.',
    icon: 'person',
  },
  {
    id: 'location',
    title: 'Votre Position',
    subtitle: 'Pour des horaires de prière précis et une boussole fiable.',
    icon: 'location_on',
  },
  {
    id: 'mosque',
    title: 'Votre Mosquée',
    subtitle: 'Trouvez votre communauté sur la carte.',
    icon: 'mosque',
  },
  {
    id: 'final',
    title: 'Tout est prêt !',
    subtitle: 'Que votre chemin soit rempli de lumière et de paix.',
    icon: 'celebration',
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [nearbyMosques, setNearbyMosques] = useState<Mosque[]>([]);
  const [loadingMosques, setLoadingMosques] = useState(false);
  
  const { 
    firstName, setFirstName, 
    lastName, setLastName, 
    age, setAge, 
    mosque, setMosque,
    setName,
    completeOnboarding 
  } = useProfileStore();
  
  const { location, setLocation } = useSettingsStore();
  const [mapCenter, setMapCenter] = useState<[number, number]>([location.lat || 48.8566, location.lng || 2.3522]);
  const [selectedMosquePos, setSelectedMosquePos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (currentStep === 3) { // Mosque step
      fetchNearbyMosques();
    }
  }, [currentStep, location.lat, location.lng]);

  const fetchNearbyMosques = async () => {
    if (!location.lat || !location.lng) return;
    setLoadingMosques(true);
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${location.lat},${location.lng});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:3000,${location.lat},${location.lng});
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
      const processed = data.elements.map((el: any) => ({
        ...el,
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon
      }));
      setNearbyMosques(processed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMosques(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setName(`${firstName} ${lastName}`);
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGeolocation = () => {
    setIsLocating(true);
    setGeoError(null);
    
    if (!("geolocation" in navigator)) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || 'Ma Position';
          
          setLocation({
            ...location,
            lat: latitude,
            lng: longitude,
            city: city,
            country: data.address.country || ''
          });
          setMapCenter([latitude, longitude]);
          setIsLocating(false);
        } catch (err) {
          setLocation({ ...location, lat: latitude, lng: longitude, city: 'Ma Position' });
          setMapCenter([latitude, longitude]);
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Impossible de vous localiser.";
        if (error.code === 1) msg = "Accès à la position refusé.";
        else if (error.code === 2) msg = "Position non disponible.";
        else if (error.code === 3) msg = "Délai d'attente dépassé.";
        setGeoError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMosqueSelect = async (lat: number, lng: number) => {
    setSelectedMosquePos([lat, lng]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const name = data.display_name.split(',')[0];
      setMosque(name);
    } catch (err) {
      setMosque(`Mosquée à ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_50px_rgba(0,230,118,0.2)]"
            >
              <span className="material-symbols-outlined text-6xl font-black">auto_awesome</span>
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                As-salamu <br />
                <span className="text-primary">Alaykum</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-[250px] mx-auto">
                Nous sommes honorés de vous accompagner dans votre pratique quotidienne.
              </p>
            </div>
          </div>
        );
      case 'personal':
        return (
          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prénom</label>
                <input 
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom</label>
                <input 
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Âge</label>
                <input 
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Votre âge"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        );
      case 'location':
        return (
          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ville</label>
                <input 
                  type="text"
                  value={location.city}
                  onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  placeholder="Ex: Paris, Lyon..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <button 
                onClick={handleGeolocation}
                disabled={isLocating}
                className="w-full py-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLocating ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">my_location</span>
                )}
                {isLocating ? 'Localisation...' : 'Me géolocaliser'}
              </button>
              {geoError && <p className="text-rose-500 text-[10px] text-center font-bold uppercase">{geoError}</p>}
            </div>
          </div>
        );
      case 'mosque':
        return (
          <div className="space-y-4 py-2">
            <div className="h-[300px] w-full rounded-3xl overflow-hidden border border-white/10 relative z-10 shadow-2xl">
              <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; CARTO'
                />
                <MapUpdater center={mapCenter} />
                <LocationPicker onLocationSelect={handleMosqueSelect} />
                
                {/* Nearby Mosques */}
                {nearbyMosques.map(m => (
                  <Marker 
                    key={m.id} 
                    position={[m.lat, m.lon]} 
                    icon={mosqueIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedMosquePos([m.lat, m.lon]);
                        setMosque(m.tags?.name || m.tags?.['name:fr'] || 'Mosquée');
                      }
                    }}
                  />
                ))}
                
                {selectedMosquePos && <Marker position={selectedMosquePos} />}
              </MapContainer>
              
              {loadingMosques && (
                <div className="absolute top-4 right-4 z-[1000] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Recherche...</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de votre mosquée</label>
              <div className="relative">
                <input 
                  type="text"
                  value={mosque}
                  onChange={(e) => setMosque(e.target.value)}
                  placeholder="Cliquez sur une mosquée ou la carte"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-colors pr-12"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">mosque</span>
              </div>
            </div>
          </div>
        );
      case 'final':
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-8 py-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_50px_rgba(0,230,118,0.2)]"
            >
              <span className="material-symbols-outlined text-6xl font-black">celebration</span>
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                Prêt pour <br />
                <span className="text-primary">L'Aventure</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-[250px] mx-auto">
                Qu'Allah bénisse votre apprentissage et votre dévotion.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex flex-col overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Progress Bar */}
      <div className="px-8 pt-12">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            className="h-full bg-primary shadow-[0_0_10px_rgba(0,230,118,0.5)]"
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Étape {currentStep + 1} / {steps.length}</span>
          <span className="text-[8px] font-black text-primary uppercase tracking-widest">{steps[currentStep].title}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col px-8 justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={steps[currentStep].id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">{steps[currentStep].title}</h2>
              <p className="text-slate-500 text-sm">{steps[currentStep].subtitle}</p>
            </div>
            
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="px-8 pb-12 flex gap-4">
        {currentStep > 0 && (
          <button 
            onClick={handleBack}
            className="flex-1 py-5 rounded-[2rem] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            Retour
          </button>
        )}
        <button 
          onClick={handleNext}
          disabled={
            (steps[currentStep].id === 'personal' && (!firstName || !lastName || !age)) ||
            (steps[currentStep].id === 'location' && !location.city) ||
            (steps[currentStep].id === 'mosque' && !mosque)
          }
          className="flex-[2] py-5 rounded-[2rem] bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(0,230,118,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
        >
          {currentStep === steps.length - 1 ? 'Commencer' : 'Continuer'}
        </button>
      </div>
    </div>
  );
}

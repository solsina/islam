import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Qibla as AdhanQibla, Coordinates } from 'adhan';
import { useSettingsStore } from '../store/useSettingsStore';

export default function Qibla() {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const { location } = useSettingsStore();

  // Calculate Qibla direction from current location
  const coordinates = new Coordinates(location.lat, location.lng);
  const qiblaDirection = AdhanQibla(coordinates);

  // Calculate distance to Mecca (Lat: 21.422487, Lng: 39.826206) using Haversine formula
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
    return Math.round(d);
  };

  const distance = calculateDistance(location.lat, location.lng, 21.422487, 39.826206);

  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      } catch (error) {
        console.error(error);
        setPermissionGranted(false);
      }
    } else {
      // Non-iOS 13+ devices
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (permissionGranted) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        let alpha = event.alpha;
        let webkitCompassHeading = (event as any).webkitCompassHeading;

        if (webkitCompassHeading !== undefined) {
          // iOS
          setHeading(webkitCompassHeading);
        } else if (alpha !== null) {
          // Android
          // Convert alpha to compass heading
          setHeading(360 - alpha);
        }
      };

      window.addEventListener('deviceorientationabsolute', handleOrientation as any);
      // Fallback for devices that don't support absolute
      window.addEventListener('deviceorientation', handleOrientation as any);

      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
        window.removeEventListener('deviceorientation', handleOrientation as any);
      };
    }
  }, [permissionGranted]);

  // Calculate rotation for the compass needle
  // The needle should point to Qibla. If heading is known, we rotate the compass dial 
  // so North is up, and the needle points to Qibla.
  // Actually, a simpler approach: rotate the whole compass dial by -heading, 
  // and the Qibla indicator is fixed at qiblaDirection on the dial.
  const compassRotation = heading !== null ? -heading : 0;
  
  // Is the user facing Qibla? (within 5 degrees)
  const isFacingQibla = heading !== null && Math.abs(heading - qiblaDirection) < 5;

  return (
    <div className="flex-1 overflow-y-auto pb-24 flex flex-col">
      <Header leftIcon="arrow_back" rightIcon="help_outline" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(16,183,72,0.8)]"></span>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Direction de la Mecque</span>
          </div>
          <h2 className="text-7xl font-extrabold text-white tracking-tighter mb-2 drop-shadow-lg">{Math.round(qiblaDirection)}°</h2>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
            <span className="material-symbols-outlined text-[16px]">straighten</span>
            {distance.toLocaleString('fr-FR')} km depuis <span className="text-white">{location.city}</span>
          </div>
        </div>

        {permissionGranted === null ? (
          <div className="bg-card-dark/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-4xl">explore</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Accès à la boussole</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Pour indiquer la direction précise de la Qibla, nous avons besoin d'accéder aux capteurs de mouvement de votre appareil.</p>
            <button 
              onClick={requestAccess}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-[0_4px_20px_rgba(16,183,72,0.3)]"
            >
              Autoriser l'accès
            </button>
          </div>
        ) : (
          <div className="relative w-80 h-80 flex items-center justify-center my-8">
            {/* Outer Glow when facing Qibla */}
            <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isFacingQibla ? 'bg-primary/30 blur-[50px] scale-110' : 'bg-transparent'}`}></div>
            
            {/* Compass Dial Background */}
            <div className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-b from-card-dark to-background-dark shadow-2xl"></div>
            
            {/* Rotating Compass Dial */}
            <div 
              className="absolute inset-4 rounded-full border border-white/5 bg-black/40 flex items-center justify-center transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${compassRotation}deg)` }}
            >
              {/* Decorative rings */}
              <div className="absolute inset-2 rounded-full border border-white/5 border-dashed opacity-50"></div>
              <div className="absolute inset-8 rounded-full border border-white/5"></div>

              {/* Cardinal Points */}
              <div className="absolute top-4 text-primary font-bold text-lg drop-shadow-[0_0_8px_rgba(16,183,72,0.8)]">N</div>
              <div className="absolute bottom-4 text-slate-600 font-bold text-sm">S</div>
              <div className="absolute right-4 text-slate-600 font-bold text-sm">E</div>
              <div className="absolute left-4 text-slate-600 font-bold text-sm">O</div>

              {/* Tick marks */}
              {Array.from({ length: 72 }).map((_, i) => (
                <div 
                  key={i}
                  className={`absolute w-0.5 ${i % 18 === 0 ? 'h-3 bg-white/40' : i % 6 === 0 ? 'h-2 bg-white/20' : 'h-1 bg-white/10'}`}
                  style={{ 
                    top: 0,
                    transformOrigin: '50% 136px', // 136px is half of (320px - 32px padding) - 8px inset
                    transform: `rotate(${i * 5}deg)`
                  }}
                ></div>
              ))}

              {/* Qibla Indicator on the dial */}
              <div 
                className="absolute w-full h-full flex justify-center"
                style={{ transform: `rotate(${qiblaDirection}deg)` }}
              >
                {/* The Needle */}
                <div className="w-1.5 h-36 bg-gradient-to-b from-primary to-transparent rounded-full mt-6 relative shadow-[0_0_15px_rgba(16,183,72,0.5)]">
                  {/* Arrow Head */}
                  <div className="absolute -top-3 -left-[5px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-primary drop-shadow-[0_0_10px_rgba(16,183,72,1)]"></div>
                </div>
              </div>
            </div>

            {/* Center Hub */}
            <div className="w-12 h-12 bg-card-dark rounded-full z-10 shadow-2xl border border-white/10 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(16,183,72,0.8)]"></div>
            </div>
          </div>
        )}

        {permissionGranted && (
          <div className="mt-8 text-center relative z-10">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-md transition-all duration-500 ${isFacingQibla ? 'bg-primary/20 border border-primary/30' : 'bg-card-dark/80 border border-white/10'}`}>
              <span className={`material-symbols-outlined ${isFacingQibla ? 'text-primary' : 'text-slate-400'}`}>
                {isFacingQibla ? 'check_circle' : 'info'}
              </span>
              <p className={`text-sm font-medium ${isFacingQibla ? 'text-white' : 'text-slate-300'}`}>
                {isFacingQibla ? 'Vous êtes face à la Qibla' : 'Éloignez-vous des objets métalliques'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 w-full max-w-sm flex flex-col gap-4 relative z-10">
          {/* Destination Card */}
          <div className="rounded-[2rem] overflow-hidden border border-white/10 relative h-40 bg-card-dark group shadow-2xl">
            <img src="https://picsum.photos/seed/mecca/600/400" alt="Kaaba" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">Destination</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">La Mecque</h3>
                <p className="text-slate-300 text-sm font-medium flex items-center gap-1.5 drop-shadow-md">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  Kaaba, Arabie Saoudite
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Distance</span>
                <p className="text-primary font-mono font-bold text-lg drop-shadow-md leading-none">{distance.toLocaleString('fr-FR')} <span className="text-xs text-slate-300 font-sans">km</span></p>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <Link to="/mosques" className="w-full bg-card-dark/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2.5 flex items-center justify-between group hover:border-primary/30 hover:bg-card-dark transition-all duration-300 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex items-center gap-4 relative z-10 w-full">
              <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 group-hover:from-primary/20 group-hover:to-primary/5 transition-all duration-500 shadow-inner">
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-2xl transition-colors">mosque</span>
              </div>
              <div className="flex-1">
                <span className="block text-sm font-bold text-white mb-0.5 tracking-wide group-hover:text-primary transition-colors">Trouver une mosquée</span>
                <span className="block text-[11px] text-slate-400 font-medium">Lieux de prière à proximité</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors duration-300 mr-1 border border-white/5 group-hover:border-primary">
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

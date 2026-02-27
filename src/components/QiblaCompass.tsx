import { useState, useEffect } from 'react';
import { Qibla as AdhanQibla, Coordinates } from 'adhan';
import { useSettingsStore } from '../store/useSettingsStore';
import { motion } from 'motion/react';

import { useNavigate } from 'react-router-dom';

export default function QiblaCompass() {
  const navigate = useNavigate();
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const { location } = useSettingsStore();

  const coordinates = new Coordinates(location.lat, location.lng);
  const qiblaDirection = AdhanQibla(coordinates);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return Math.round(R * c);
  };

  const distance = calculateDistance(location.lat, location.lng, 21.422487, 39.826206);

  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceOrientationEvent as any).requestPermission();
        setPermissionGranted(permissionState === 'granted');
      } catch (error) {
        console.error(error);
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (permissionGranted) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        // Use webkitCompassHeading if available (iOS)
        let compassHeading = (event as any).webkitCompassHeading;
        
        if (compassHeading !== undefined) {
          setHeading(compassHeading);
        } else if (event.alpha !== null) {
          // Android/Standard
          // alpha is the rotation around the z-axis (0 to 360)
          // We might need to adjust based on absolute orientation
          if ((event as any).absolute) {
            setHeading(360 - event.alpha);
          } else {
            // Fallback if not absolute
            setHeading(360 - event.alpha);
          }
        }
      };

      // Try absolute orientation first
      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      // Fallback to standard orientation
      window.addEventListener('deviceorientation', handleOrientation as any, true);
      
      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
        window.removeEventListener('deviceorientation', handleOrientation as any);
      };
    }
  }, [permissionGranted]);

  const compassRotation = heading !== null ? -heading : 0;
  const isFacingQibla = heading !== null && Math.abs(heading - qiblaDirection) < 5;

  return (
    <div className="bg-card-dark border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-black text-lg tracking-tight uppercase">Boussole Qibla</h3>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{location.city} • {distance.toLocaleString()} km</p>
        </div>
        <button 
          onClick={() => navigate('/qibla')}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
        >
          <span className="material-symbols-outlined text-xl">fullscreen</span>
        </button>
      </div>

      {permissionGranted === null ? (
        <button 
          onClick={requestAccess}
          className="w-full py-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
        >
          Activer la boussole
        </button>
      ) : (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isFacingQibla ? 'bg-primary/20 blur-[30px] scale-110' : 'bg-transparent'}`}></div>
          
          <div 
            className="absolute inset-0 rounded-full border border-white/5 bg-black/40 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <div className="absolute top-2 text-primary font-black text-[10px]">N</div>
            <div className="absolute bottom-2 text-slate-700 font-bold text-[8px]">S</div>
            
            {/* Qibla Indicator */}
            <div 
              className="absolute w-full h-full flex justify-center"
              style={{ transform: `rotate(${qiblaDirection}deg)` }}
            >
              <div className="w-1 h-20 bg-gradient-to-b from-primary to-transparent rounded-full mt-2 relative shadow-[0_0_10px_rgba(0,230,118,0.5)]">
                <div className="absolute -top-2 -left-[3px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-primary"></div>
              </div>
            </div>
          </div>
          
          <div className="w-8 h-8 bg-card-dark rounded-full z-10 shadow-xl border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(0,230,118,0.8)]"></div>
          </div>
        </div>
      )}
      
      <p className="mt-6 text-[10px] text-slate-500 font-medium text-center leading-relaxed">
        {isFacingQibla ? 'Vous êtes face à la Kaaba' : 'Tournez votre appareil pour trouver la direction'}
      </p>
    </div>
  );
}

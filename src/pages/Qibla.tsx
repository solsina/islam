import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { motion } from 'motion/react';

export default function Qibla() {
  const [heading, setHeading] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [calibrationNeeded, setCalibrationNeeded] = useState(false);

  // Qibla direction from Paris (approx 119 degrees)
  // In a real app, calculate based on user location
  const QIBLA_DIRECTION = 119; 

  const handlePermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (permissionGranted) {
      const handleOrientation = (e: DeviceOrientationEvent) => {
        // iOS uses webkitCompassHeading, Android uses alpha
        const compass = (e as any).webkitCompassHeading || Math.abs(e.alpha! - 360);
        setHeading(compass);
        
        // Simple calibration check
        if ((e as any).webkitCompassAccuracy && (e as any).webkitCompassAccuracy < 0) {
          setCalibrationNeeded(true);
        } else {
          setCalibrationNeeded(false);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [permissionGranted]);

  const isAligned = Math.abs(heading - QIBLA_DIRECTION) < 5;

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-[#050505] relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <Header title="Qibla" leftIcon="arrow_back" onLeftClick={() => window.history.back()} />

      <main className="px-4 py-6 flex flex-col items-center justify-center min-h-[70vh] relative z-10">
        {!permissionGranted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-xs"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
              <span className="material-symbols-outlined text-primary text-4xl">explore</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">Autorisation requise</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pour vous indiquer la direction de la Mecque, nous avons besoin d'accéder à la boussole de votre appareil.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handlePermission}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] uppercase tracking-wider text-xs"
            >
              Autoriser la boussole
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="relative w-72 h-72 mb-12">
              {/* Compass Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-white/10 flex items-center justify-center">
                <div className="absolute top-0 w-1 h-4 bg-primary rounded-full"></div>
                <div className="absolute bottom-0 w-1 h-4 bg-white/10 rounded-full"></div>
                <div className="absolute left-0 w-4 h-1 bg-white/10 rounded-full"></div>
                <div className="absolute right-0 w-4 h-1 bg-white/10 rounded-full"></div>
              </div>

              {/* Rotating Compass */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ rotate: -heading }}
                transition={{ type: "spring", damping: 20 }}
              >
                {/* Qibla Indicator */}
                <div 
                  className="absolute top-0 flex flex-col items-center"
                  style={{ transform: `rotate(${QIBLA_DIRECTION}deg) translateY(10px)` }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isAligned ? 'bg-primary shadow-[0_0_30px_rgba(16,185,129,0.6)]' : 'bg-white/10'}`}>
                    <span className={`material-symbols-outlined text-2xl ${isAligned ? 'text-black' : 'text-white'}`}>kaaba</span>
                  </div>
                  <div className={`w-0.5 h-24 mt-2 ${isAligned ? 'bg-primary' : 'bg-white/20'}`}></div>
                </div>

                {/* North Indicator */}
                <div className="absolute top-4 flex flex-col items-center">
                  <span className="text-xs font-black text-rose-500 uppercase tracking-widest">N</span>
                </div>
              </motion.div>

              {/* Center Dot */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">
                {Math.round(heading)}°
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                {isAligned ? 'Vous êtes aligné' : 'Tournez-vous vers la Qibla'}
              </p>
              {calibrationNeeded && (
                <p className="text-orange-500 text-[10px] font-bold uppercase tracking-wider animate-pulse mt-4">
                  Calibrage requis : faites un 8 avec votre téléphone
                </p>
              )}
            </div>

            {isAligned && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 bg-primary/20 border border-primary/30 text-primary px-6 py-3 rounded-xl flex items-center gap-3 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-bold text-sm">Direction trouvée !</span>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

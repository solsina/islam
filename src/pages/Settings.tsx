import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '../store/useProfileStore';
import { motion, AnimatePresence } from 'motion/react';

const CALCULATION_METHODS = [
  { id: 'MuslimWorldLeague', name: 'Ligue Islamique Mondiale (MWL)' },
  { id: 'Egyptian', name: 'Autorité Générale Égyptienne' },
  { id: 'Karachi', name: 'Université Islamique de Karachi' },
  { id: 'UmmAlQura', name: 'Umm Al-Qura, La Mecque' },
  { id: 'Dubai', name: 'Dubaï' },
  { id: 'MoonsightingCommittee', name: 'Comité d\'Observation de la Lune' },
  { id: 'NorthAmerica', name: 'ISNA (Amérique du Nord)' },
  { id: 'Kuwait', name: 'Koweït' },
  { id: 'Qatar', name: 'Qatar' },
  { id: 'Singapore', name: 'Singapour' },
  { id: 'Tehran', name: 'Institut de Géophysique, Téhéran' },
  { id: 'Turkey', name: 'Diyanet, Turquie' },
];

const ASR_METHODS = [
  { id: 'Standard', name: 'Standard (Shafi, Maliki, Hanbali)' },
  { id: 'Hanafi', name: 'Hanafi' },
];

const SOUNDS = [
  'Mekkah - Sheikh Ali Mulla',
  'Madinah',
  'Al-Aqsa',
  'Egypt',
  'Turkey',
  'Beep (Défaut)'
];

const LANGUAGES = [
  'Français',
  'English',
  'العربية'
];

export default function Settings() {
  const { t } = useTranslation();
  const { 
    firstName, setFirstName, 
    lastName, setLastName, 
    age, setAge, 
    mosque, setMosque 
  } = useProfileStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeModal, setActiveModal] = useState<'calculation' | 'asr' | 'sound' | 'language' | null>(null);
  
  // Audio ref for preview
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { 
    location, 
    calculationMethod, 
    asrMethod, 
    notifications, 
    appearance,
    toggleAdhanNotification,
    toggleDarkMode,
    setCalculationMethod,
    setAsrMethod,
    setLocation,
    setSound,
    setLanguage
  } = useSettingsStore();

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectCity = (result: any) => {
    const city = result.name || result.display_name.split(',')[0];
    const countryParts = result.display_name.split(',');
    const country = countryParts[countryParts.length - 1].trim();
    
    setLocation({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      city: city,
      country: country
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const getCalculationMethodName = (id: string) => {
    return CALCULATION_METHODS.find(m => m.id === id)?.name || id;
  };

  const getAsrMethodName = (id: string) => {
    return ASR_METHODS.find(m => m.id === id)?.name || id;
  };

  const playSoundPreview = (soundName: string) => {
    setSound(soundName);
    
    // Create a short beep or play a sample audio based on selection
    // In a real app, you would load actual audio files here.
    // For now, we simulate a preview with a simple beep using Web Audio API
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (soundName === 'Beep (Défaut)') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        // Simulate a different tone for Adhan
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      }
    } catch (e) {
      console.error("Audio preview failed", e);
    }
    
    setTimeout(() => {
      setActiveModal(null);
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative bg-[#050505]">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <Header leftIcon="arrow_back" onLeftClick={() => window.history.back()} title="Paramètres" />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-2 pb-6 space-y-6 relative z-10"
      >
        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1 h-3 bg-primary rounded-full"></span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profil</h2>
          </div>
          <div className="bg-card-dark rounded-3xl border border-white/5 p-5 space-y-4 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Prénom</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-primary focus:bg-white/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nom</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-primary focus:bg-white/10 outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Âge</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-primary focus:bg-white/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Ma Mosquée</label>
                <input 
                  type="text" 
                  value={mosque} 
                  onChange={(e) => setMosque(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-primary focus:bg-white/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('location')}</h2>
          </div>
          <div className="bg-card-dark rounded-3xl border border-white/5 divide-y divide-white/5 backdrop-blur-sm">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t('current_city')}</p>
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">{location.city}, {location.country}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-slate-400 mr-3 text-lg">search</span>
                  <input 
                    type="text" 
                    placeholder={t('search_city')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500 text-sm font-medium"
                  />
                  {isSearching && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-card-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.map((res, i) => (
                      <div 
                        key={i} 
                        className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                        onClick={() => handleSelectCity(res)}
                      >
                        <p className="text-sm text-white font-bold">{res.name}</p>
                        <p className="text-xs text-slate-400 truncate">{res.display_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('calculation_method')}</h2>
          </div>
          <div className="bg-card-dark rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden backdrop-blur-sm">
            <motion.div 
              whileTap={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              className="flex items-center justify-between p-5 cursor-pointer group"
              onClick={() => setActiveModal('calculation')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                  <span className="material-symbols-outlined">settings_suggest</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('convention')}</p>
                  <p className="text-xs text-slate-400 font-medium">{getCalculationMethodName(calculationMethod)}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
            </motion.div>
            <motion.div 
              whileTap={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              className="flex items-center justify-between p-5 cursor-pointer group"
              onClick={() => setActiveModal('asr')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                  <span className="material-symbols-outlined">straighten</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('asr_method')}</p>
                  <p className="text-xs text-slate-400 font-medium">{getAsrMethodName(asrMethod)}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
            </motion.div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1 h-3 bg-amber-500 rounded-full"></span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('notifications')}</h2>
          </div>
          <div className="bg-card-dark rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <p className="text-sm font-bold text-white">{t('adhan_alerts')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.adhan}
                  onChange={toggleAdhanNotification}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <motion.div 
              whileTap={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              className={`flex items-center justify-between p-5 transition-colors group ${notifications.adhan ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => notifications.adhan && setActiveModal('sound')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                  <span className="material-symbols-outlined">volume_up</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('sound')}</p>
                  <p className="text-xs text-slate-400 font-medium">{notifications.sound}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
            </motion.div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1 h-3 bg-purple-500 rounded-full"></span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('appearance')}</h2>
          </div>
          <div className="bg-card-dark rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <span className="material-symbols-outlined">dark_mode</span>
                </div>
                <p className="text-sm font-bold text-white">{t('dark_mode')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={appearance.darkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <motion.div 
              whileTap={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              className="flex items-center justify-between p-5 cursor-pointer group"
              onClick={() => setActiveModal('language')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                  <span className="material-symbols-outlined">translate</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t('language')}</p>
                  <p className="text-xs text-slate-400 font-medium">{appearance.language}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
            </motion.div>
          </div>
        </motion.section>

        <div className="text-center py-4">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Emerald Islam v1.0</p>
        </div>
      </motion.main>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-md" 
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card-dark w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 overflow-hidden flex flex-col max-h-[80vh] shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500"></div>
              
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  {activeModal === 'calculation' && t('convention')}
                  {activeModal === 'asr' && t('asr_method')}
                  {activeModal === 'sound' && t('sound')}
                  {activeModal === 'language' && t('language')}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-slate-400">close</span>
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 space-y-2">
                {activeModal === 'calculation' && CALCULATION_METHODS.map(method => (
                  <motion.button
                    key={method.id}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${calculationMethod === method.id ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'}`}
                    onClick={() => { setCalculationMethod(method.id as any); setActiveModal(null); }}
                  >
                    <span className="font-bold text-sm">{method.name}</span>
                    {calculationMethod === method.id && <span className="material-symbols-outlined">check_circle</span>}
                  </motion.button>
                ))}

                {activeModal === 'asr' && ASR_METHODS.map(method => (
                  <motion.button
                    key={method.id}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${asrMethod === method.id ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'}`}
                    onClick={() => { setAsrMethod(method.id as any); setActiveModal(null); }}
                  >
                    <span className="font-bold text-sm">{method.name}</span>
                    {asrMethod === method.id && <span className="material-symbols-outlined">check_circle</span>}
                  </motion.button>
                ))}

                {activeModal === 'sound' && SOUNDS.map(sound => (
                  <motion.button
                    key={sound}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${notifications.sound === sound ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'}`}
                    onClick={() => playSoundPreview(sound)}
                  >
                    <span className="font-bold text-sm">{sound}</span>
                    {notifications.sound === sound && <span className="material-symbols-outlined">check_circle</span>}
                  </motion.button>
                ))}

                {activeModal === 'language' && LANGUAGES.map(lang => (
                  <motion.button
                    key={lang}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all ${appearance.language === lang ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'}`}
                    onClick={() => { setLanguage(lang); setActiveModal(null); }}
                  >
                    <span className="font-bold text-sm">{lang}</span>
                    {appearance.language === lang && <span className="material-symbols-outlined">check_circle</span>}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

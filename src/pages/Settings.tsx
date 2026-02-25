import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative bg-transparent">
      <Header leftIcon="arrow_back" />

      <main className="px-4 pt-2 pb-6 space-y-6">
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary px-1">{t('location')}</h2>
          <div className="bg-card-dark rounded-xl border border-white/5 divide-y divide-white/5">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-slate-400">location_on</span>
                  <div>
                    <p className="text-sm font-semibold">{t('current_city')}</p>
                    <p className="text-xs text-primary font-bold">{location.city}, {location.country}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus-within:border-primary/50 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 mr-3 text-lg">search</span>
                  <input 
                    type="text" 
                    placeholder={t('search_city')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500 text-sm"
                  />
                  {isSearching && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
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
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary px-1">{t('calculation_method')}</h2>
          <div className="bg-card-dark rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setActiveModal('calculation')}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400">settings_suggest</span>
                <div>
                  <p className="text-sm font-semibold">{t('convention')}</p>
                  <p className="text-xs text-slate-400">{getCalculationMethodName(calculationMethod)}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
            </div>
            <div 
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setActiveModal('asr')}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400">straighten</span>
                <div>
                  <p className="text-sm font-semibold">{t('asr_method')}</p>
                  <p className="text-xs text-slate-400">{getAsrMethodName(asrMethod)}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary px-1">{t('notifications')}</h2>
          <div className="bg-card-dark rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400">notifications_active</span>
                <p className="text-sm font-semibold">{t('adhan_alerts')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.adhan}
                  onChange={toggleAdhanNotification}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div 
              className={`flex items-center justify-between p-4 transition-colors ${notifications.adhan ? 'hover:bg-white/5 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => notifications.adhan && setActiveModal('sound')}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400">volume_up</span>
                <div>
                  <p className="text-sm font-semibold">{t('sound')}</p>
                  <p className="text-xs text-slate-400">{notifications.sound}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary px-1">{t('appearance')}</h2>
          <div className="bg-card-dark rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400">dark_mode</span>
                <p className="text-sm font-semibold">{t('dark_mode')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={appearance.darkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div 
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setActiveModal('language')}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400">translate</span>
                <div>
                  <p className="text-sm font-semibold">{t('language')}</p>
                  <p className="text-xs text-slate-400">{appearance.language}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary px-1">Développement</h2>
          <div className="bg-card-dark rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
            <Link 
              to="/showcase"
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400">auto_awesome</span>
                <div>
                  <p className="text-sm font-semibold">Showcase de l'App</p>
                  <p className="text-xs text-slate-400">Voir les visuels de l'avancement</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
            </Link>
          </div>
        </section>

        <div className="text-center py-4">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Emerald Islam v1.0</p>
        </div>
      </main>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div 
            className="bg-card-dark w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <h3 className="text-lg font-bold text-white">
                {activeModal === 'calculation' && t('convention')}
                {activeModal === 'asr' && t('asr_method')}
                {activeModal === 'sound' && t('sound')}
                {activeModal === 'language' && t('language')}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto p-2">
              {activeModal === 'calculation' && CALCULATION_METHODS.map(method => (
                <button
                  key={method.id}
                  className={`w-full text-left p-4 rounded-xl mb-1 flex items-center justify-between transition-colors ${calculationMethod === method.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-slate-300'}`}
                  onClick={() => { setCalculationMethod(method.id as any); setActiveModal(null); }}
                >
                  <span className="font-medium">{method.name}</span>
                  {calculationMethod === method.id && <span className="material-symbols-outlined">check</span>}
                </button>
              ))}

              {activeModal === 'asr' && ASR_METHODS.map(method => (
                <button
                  key={method.id}
                  className={`w-full text-left p-4 rounded-xl mb-1 flex items-center justify-between transition-colors ${asrMethod === method.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-slate-300'}`}
                  onClick={() => { setAsrMethod(method.id as any); setActiveModal(null); }}
                >
                  <span className="font-medium">{method.name}</span>
                  {asrMethod === method.id && <span className="material-symbols-outlined">check</span>}
                </button>
              ))}

              {activeModal === 'sound' && SOUNDS.map(sound => (
                <button
                  key={sound}
                  className={`w-full text-left p-4 rounded-xl mb-1 flex items-center justify-between transition-colors ${notifications.sound === sound ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-slate-300'}`}
                  onClick={() => playSoundPreview(sound)}
                >
                  <span className="font-medium">{sound}</span>
                  {notifications.sound === sound && <span className="material-symbols-outlined">check</span>}
                </button>
              ))}

              {activeModal === 'language' && LANGUAGES.map(lang => (
                <button
                  key={lang}
                  className={`w-full text-left p-4 rounded-xl mb-1 flex items-center justify-between transition-colors ${appearance.language === lang ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-slate-300'}`}
                  onClick={() => { setLanguage(lang); setActiveModal(null); }}
                >
                  <span className="font-medium">{lang}</span>
                  {appearance.language === lang && <span className="material-symbols-outlined">check</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

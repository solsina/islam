import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useQuranStore } from '../store/useQuranStore';
import { useGamificationStore, XP_VALUES } from '../store/useGamificationStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { motion, AnimatePresence } from 'motion/react';

export default function SurahReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [arabicData, setArabicData] = useState<any>(null);
  const [frenchData, setFrenchData] = useState<any>(null);
  const [phoneticData, setPhoneticData] = useState<any>(null);
  const [audioData, setAudioData] = useState<any>(null);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const { quranSettings, setQuranSettings } = useSettingsStore();
  const { fontSize, showTranslation, showPhonetic } = quranSettings;

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { setLastRead, lastRead, markAsRead, readSurahs } = useQuranStore();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isRead = readSurahs.includes(parseInt(id || '0', 10));

  const convertToFrenchPhonetic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/sh/g, 'ch').replace(/Sh/g, 'Ch')
      .replace(/oo/g, 'oû')
      .replace(/ee/g, 'î')
      .replace(/aa/g, 'â')
      .replace(/u/g, 'ou')
      .replace(/j/g, 'dj').replace(/J/g, 'Dj');
  };

  useEffect(() => {
    const fetchSurah = async () => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,fr.hamidullah,en.transliteration,ar.alafasy`);
        const json = await res.json();
        if (json.code === 200) {
          setArabicData(json.data[0]);
          setFrenchData(json.data[1]);
          setPhoneticData(json.data[2]);
          setAudioData(json.data[3]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la sourate", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurah();
  }, [id]);

  // Setup Intersection Observer to track reading progress
  useEffect(() => {
    if (loading || !arabicData) return;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const ayahNumber = parseInt(entry.target.getAttribute('data-ayah') || '1', 10);
          if (id) {
            setLastRead(parseInt(id, 10), ayahNumber);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when ayah is in the upper middle of the screen
      threshold: 0.1
    });

    const elements = document.querySelectorAll('.ayah-container');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, arabicData, id, setLastRead]);

  // Scroll to last read ayah if returning to this surah
  useEffect(() => {
    if (!loading && arabicData && lastRead && lastRead.surahId === parseInt(id || '0', 10)) {
      const element = document.querySelector(`[data-ayah="${lastRead.ayahNumber}"]`);
      if (element) {
        // Add a small delay to ensure rendering is complete
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [loading, arabicData, id]); // Only run once when data is loaded

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (currentAyahIndex === null) {
        setCurrentAyahIndex(0);
      }
      // Use setTimeout to allow render to update audio src if index changed
      setTimeout(() => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, 0);
    }
  };

  const handleAyahEnd = () => {
    if (currentAyahIndex !== null && currentAyahIndex < arabicData.ayahs.length - 1) {
      setCurrentAyahIndex(currentAyahIndex + 1);
      // Auto-scroll to next ayah
      const nextAyahElement = document.querySelector(`[data-ayah="${arabicData.ayahs[currentAyahIndex + 1].numberInSurah}"]`);
      nextAyahElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setIsPlaying(false);
      setCurrentAyahIndex(null);
    }
  };

  // Effect to play audio when index changes while playing
  useEffect(() => {
    if (isPlaying && audioRef.current && currentAyahIndex !== null) {
      audioRef.current.play();
    }
  }, [currentAyahIndex]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Chargement..." leftIcon="arrow_back" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-sm">Chargement des versets...</p>
        </div>
      </div>
    );
  }

  if (!arabicData || !frenchData || !phoneticData) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Erreur" leftIcon="arrow_back" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Impossible de charger la sourate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent relative">
      <Header 
        leftIcon="arrow_back" 
        rightIcon="tune" 
        onRightClick={() => setShowSettings(!showSettings)}
      />
      
      {/* Audio Element */}
      <audio 
        ref={audioRef}
        src={currentAyahIndex !== null && audioData ? audioData.ayahs[currentAyahIndex].audio : ''}
        onEnded={handleAyahEnd}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 z-50 bg-card-dark border border-white/10 rounded-2xl p-4 shadow-xl w-64 backdrop-blur-xl"
          >
            <h3 className="text-white font-bold mb-4 text-sm">Paramètres de lecture</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Taille du texte</label>
                <input 
                  type="range" 
                  min="20" 
                  max="50" 
                  value={fontSize} 
                  onChange={(e) => setQuranSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Traduction</span>
                <button 
                  onClick={() => setQuranSettings({ showTranslation: !showTranslation })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${showTranslation ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showTranslation ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Phonétique</span>
                <button 
                  onClick={() => setQuranSettings({ showPhonetic: !showPhonetic })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${showPhonetic ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showPhonetic ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32 space-y-6">
        <div className="text-center mb-8 bg-card-dark border border-white/5 rounded-2xl p-6 emerald-glow relative overflow-hidden">
          <div className="absolute -right-12 -top-12 size-32 bg-primary/10 rounded-full blur-3xl"></div>
          <h1 className="text-4xl font-arabic text-primary mb-3">{arabicData.name}</h1>
          <p className="text-slate-300 font-bold mb-1">{frenchData.englishNameTranslation}</p>
          <p className="text-slate-500 text-xs uppercase tracking-widest">{arabicData.revelationType} • {arabicData.numberOfAyahs} versets</p>
        </div>
        
        {/* Display Bismillah for all surahs except At-Tawbah (9) and Al-Fatihah (1, already included in ayah 1) */}
        {id !== '1' && id !== '9' && (
          <div className="text-center py-4 mb-4">
            <p className="font-arabic text-3xl text-white opacity-90">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          </div>
        )}

        <div className="space-y-6">
          {arabicData.ayahs.map((ayah: any, index: number) => {
            // The API often prepends Bismillah to the first ayah of every surah.
            // We strip it here for cleaner display since we show it standalone above.
            let arabicText = ayah.text;
            const bismillah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ';
            if (id !== '1' && index === 0 && arabicText.startsWith(bismillah)) {
              arabicText = arabicText.replace(bismillah, '');
            }

            const isLastRead = lastRead?.surahId === parseInt(id || '0', 10) && lastRead?.ayahNumber === ayah.numberInSurah;
            const isPlayingAyah = currentAyahIndex === index;

            return (
              <div 
                key={ayah.numberInSurah} 
                data-ayah={ayah.numberInSurah}
                onClick={() => {
                  setCurrentAyahIndex(index);
                  setIsPlaying(true);
                }}
                className={`ayah-container bg-card-dark border rounded-xl p-5 space-y-5 transition-all cursor-pointer ${
                  isPlayingAyah 
                    ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(16,185,129,0.1)] scale-[1.02]' 
                    : isLastRead 
                      ? 'border-primary/50 emerald-glow' 
                      : 'border-white/5 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border mt-1 transition-colors ${
                    isPlayingAyah 
                      ? 'bg-primary text-black border-primary animate-pulse' 
                      : isLastRead 
                        ? 'bg-primary/20 text-primary border-primary/30' 
                        : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    <span className="text-sm font-bold">{ayah.numberInSurah}</span>
                  </div>
                  <p 
                    className="font-arabic leading-loose text-white text-right flex-1 transition-all duration-300" 
                    dir="rtl"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '2' }}
                  >
                    {arabicText}
                  </p>
                </div>
                
                {(showTranslation || showPhonetic) && (
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    {showTranslation && (
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {frenchData.ayahs[index].text}
                      </p>
                    )}
                    {showPhonetic && (
                      <p className="text-primary/70 text-xs italic leading-relaxed">
                        {convertToFrenchPhonetic(phoneticData.ayahs[index].text)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Audio Player */}
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <div className="bg-card-dark/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">
                  {isPlaying ? 'graphic_eq' : 'music_note'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  {currentAyahIndex !== null 
                    ? `Verset ${arabicData.ayahs[currentAyahIndex].numberInSurah}` 
                    : 'Écouter la sourate'}
                </p>
                <p className="text-slate-400 text-xs truncate">{arabicData.englishName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentAyahIndex !== null && currentAyahIndex > 0) {
                    setCurrentAyahIndex(currentAyahIndex - 1);
                  }
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">skip_previous</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAudio();
                }}
                className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-95"
              >
                <span className="material-symbols-outlined text-2xl">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentAyahIndex !== null && currentAyahIndex < arabicData.ayahs.length - 1) {
                    setCurrentAyahIndex(currentAyahIndex + 1);
                  } else if (currentAyahIndex === null) {
                    setCurrentAyahIndex(0);
                    setIsPlaying(true);
                  }
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">skip_next</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mark as Read Button */}
        <div className="pt-8 pb-4 flex justify-center">
          <button
            onClick={() => {
              if (id) {
                markAsRead(parseInt(id, 10));
                navigate('/quran');
              }
            }}
            disabled={isRead}
            className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all ${
              isRead 
                ? 'bg-primary/20 text-primary cursor-default' 
                : 'bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {isRead ? 'check_circle' : 'task_alt'}
            </span>
            {isRead ? 'Sourate lue' : `Marquer comme lue (+${XP_VALUES.SURAH_READ} XP)`}
          </button>
        </div>
      </div>
    </div>
  );
}

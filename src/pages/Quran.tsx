import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useQuranStore, Surah } from '../store/useQuranStore';
import { surahNamesFr } from '../utils/surahNamesFr';

export default function Quran() {
  const navigate = useNavigate();
  const { surahs, setSurahs, learnedSurahs, toggleLearned } = useQuranStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(surahs.length === 0);
  
  // Audio state
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      if (surahs.length > 0) return;
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.code === 200) {
          setSurahs(data.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des sourates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, [surahs.length, setSurahs]);

  const toggleAudio = (e: React.MouseEvent, surahId: number) => {
    e.stopPropagation();
    if (playingId === surahId) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
    } else {
      setPlayingId(surahId);
      setIsPlaying(true);
      // The src will update, and autoPlay will handle the playing
    }
  };

  const handleToggleLearned = (e: React.MouseEvent, surahId: number) => {
    e.stopPropagation();
    toggleLearned(surahId);
  };

  const filteredSurahs = surahs.filter(surah => {
    const frenchTranslation = surahNamesFr[surah.number] || surah.englishNameTranslation;
    return (
      surah.englishName.toLowerCase().includes(search.toLowerCase()) || 
      frenchTranslation.toLowerCase().includes(search.toLowerCase())
    );
  });

  const completionPercentage = Math.round((learnedSurahs.length / 114) * 100) || 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
      <Header rightIcon="search" />

      {/* Audio Element */}
      {playingId && (
        <audio 
          ref={audioRef}
          src={`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${playingId}.mp3`}
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setPlayingId(null);
          }}
        />
      )}

      <div className="px-4 pt-2 pb-4 shrink-0 space-y-4">
        {/* Progression Card */}
        <div className="bg-card-dark border border-white/5 rounded-xl p-5 emerald-glow">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-white font-bold text-sm">Apprentissage</h2>
              <p className="text-slate-400 text-xs mt-0.5">{learnedSurahs.length} sur 114 sourates apprises</p>
            </div>
            <span className="text-2xl font-extrabold text-primary">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div className="emerald-gradient h-full rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center group">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Rechercher une sourate (ex: Al-Baqarah, La Vache)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-input-dark border-none rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 text-sm">Chargement des 114 sourates...</p>
          </div>
        ) : filteredSurahs.map((surah) => {
          const isLearned = learnedSurahs.includes(surah.number);
          const isThisPlaying = playingId === surah.number;
          const frenchTranslation = surahNamesFr[surah.number] || surah.englishNameTranslation;

          return (
            <div 
              key={surah.number} 
              onClick={() => navigate(`/quran/${surah.number}`)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                isThisPlaying ? 'border-primary/50 bg-primary/5 emerald-glow' : 'border-white/5 bg-card-dark hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                  <span className="absolute text-[10px] font-bold text-primary">{surah.number}</span>
                  <svg className="w-full h-full text-primary/20" viewBox="0 0 36 36" fill="currentColor">
                    <path d="M18 0L22.5 5.5L29.5 4.5L31.5 11.5L36 18L31.5 24.5L29.5 31.5L22.5 30.5L18 36L13.5 30.5L6.5 31.5L4.5 24.5L0 18L4.5 11.5L6.5 4.5L13.5 5.5L18 0Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-slate-100 truncate">{surah.englishName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{frenchTranslation} • {surah.numberOfAyahs} versets</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-arabic text-xl text-primary/90 hidden sm:block">{surah.name}</span>
                
                {/* Play/Pause Button */}
                <button 
                  onClick={(e) => toggleAudio(e, surah.number)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isThisPlaying ? 'bg-primary text-black' : 'bg-white/5 text-slate-300 hover:bg-primary/20 hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isThisPlaying && isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                {/* Mark as Learned Button */}
                <button 
                  onClick={(e) => handleToggleLearned(e, surah.number)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isLearned ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isLearned ? 'task_alt' : 'radio_button_unchecked'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        {!loading && filteredSurahs.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">menu_book</span>
            <p className="text-slate-400">Aucune sourate trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

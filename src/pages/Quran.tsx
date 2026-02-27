import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useQuranStore, Surah } from '../store/useQuranStore';
import { surahNamesFr } from '../utils/surahNamesFr';
import { motion, AnimatePresence } from 'motion/react';

export default function Quran() {
  const navigate = useNavigate();
  const { surahs, setSurahs, learnedSurahs, toggleLearned, readSurahs } = useQuranStore();
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
  const readPercentage = Math.round((readSurahs.length / 114) * 100) || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#050505] relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

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

      <div className="px-4 pt-2 pb-4 shrink-0 space-y-4 relative z-10">
        {/* Progression Card */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card-dark border border-white/5 rounded-2xl p-5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors"></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
              <span className="text-xl font-black text-primary">{readPercentage}%</span>
            </div>
            <h2 className="text-white font-bold text-xs uppercase tracking-wider relative z-10">Lecture</h2>
            <p className="text-slate-400 text-[10px] mt-0.5 relative z-10">{readSurahs.length}/114 lues</p>
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-3 overflow-hidden relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${readPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card-dark border border-white/5 rounded-2xl p-5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors"></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="material-symbols-outlined text-amber-500 text-xl">psychology</span>
              <span className="text-xl font-black text-amber-500">{completionPercentage}%</span>
            </div>
            <h2 className="text-white font-bold text-xs uppercase tracking-wider relative z-10">Hifz</h2>
            <p className="text-slate-400 text-[10px] mt-0.5 relative z-10">{learnedSurahs.length}/114 apprises</p>
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-3 overflow-hidden relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              />
            </div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center group">
          <span className="material-symbols-outlined absolute left-4 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Rechercher une sourate..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card-dark border border-white/5 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 pb-32 space-y-3 relative z-10"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Chargement...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredSurahs.map((surah) => {
              const isLearned = learnedSurahs.includes(surah.number);
              const isRead = readSurahs.includes(surah.number);
              const isThisPlaying = playingId === surah.number;
              const frenchTranslation = surahNamesFr[surah.number] || surah.englishNameTranslation;

              return (
                <motion.div 
                  key={surah.number}
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/quran/${surah.number}`)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                    isThisPlaying 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-white/5 bg-card-dark hover:border-white/10'
                  }`}
                >
                  {isThisPlaying && (
                    <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none"></div>
                  )}
                  
                  <div className="flex items-center gap-4 flex-1 relative z-10">
                    <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                      <span className={`absolute text-[10px] font-bold ${isRead ? 'text-primary' : 'text-slate-500'}`}>{surah.number}</span>
                      <svg className={`w-full h-full ${isRead ? 'text-primary/20' : 'text-slate-800'}`} viewBox="0 0 36 36" fill="currentColor">
                        <path d="M18 0L22.5 5.5L29.5 4.5L31.5 11.5L36 18L31.5 24.5L29.5 31.5L22.5 30.5L18 36L13.5 30.5L6.5 31.5L4.5 24.5L0 18L4.5 11.5L6.5 4.5L13.5 5.5L18 0Z" />
                      </svg>
                      {isRead && (
                        <div className="absolute -bottom-1 -right-1 bg-card-dark rounded-full border border-card-dark">
                          <span className="material-symbols-outlined text-[10px] text-primary">check_circle</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className={`font-bold truncate text-sm ${isRead ? 'text-primary' : 'text-slate-200'}`}>{surah.englishName}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate uppercase tracking-wider font-medium">{frenchTranslation} • {surah.numberOfAyahs} versets</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 relative z-10">
                    <span className="font-arabic text-xl text-slate-400 group-hover:text-primary/80 transition-colors hidden sm:block">{surah.name}</span>
                    
                    {/* Play/Pause Button */}
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleAudio(e, surah.number)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isThisPlaying ? 'bg-primary text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {isThisPlaying && isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </motion.button>

                    {/* Mark as Learned Button */}
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleToggleLearned(e, surah.number)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${
                        isLearned 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : 'bg-white/5 text-slate-600 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        <motion.span 
                          key={isLearned ? 'learned' : 'not-learned'}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="material-symbols-outlined text-lg"
                        >
                          {isLearned ? 'workspace_premium' : 'radio_button_unchecked'}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && filteredSurahs.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <span className="material-symbols-outlined text-slate-700 text-5xl mb-4">menu_book</span>
            <p className="text-slate-500 text-sm">Aucune sourate trouvée</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

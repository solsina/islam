import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { duasData, Dua as DuaType } from '../data/duasData';
import { motion, AnimatePresence } from 'motion/react';
import { useGamificationStore, XP_VALUES } from '../store/useGamificationStore';

export default function Dua() {
  const navigate = useNavigate();
  const { incrementCounter } = useGamificationStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tags = [
    { id: 'stress', name: 'Stress', icon: 'spa' },
    { id: 'gratitude', name: 'Gratitude', icon: 'favorite' },
    { id: 'protection', name: 'Protection', icon: 'shield' },
    { id: 'famille', name: 'Famille', icon: 'family_restroom' },
    { id: 'santé', name: 'Santé', icon: 'medical_services' },
    { id: 'voyage', name: 'Voyage', icon: 'flight' },
    { id: 'pardon', name: 'Pardon', icon: 'volunteer_activism' },
    { id: 'maison', name: 'Maison', icon: 'home' },
  ];

  const allDuas = duasData.flatMap(category => category.duas);
  
  const displayedDuas = showFavorites
    ? allDuas.filter(dua => favorites.includes(dua.id))
    : selectedTag
      ? allDuas.filter(dua => dua.tags?.includes(selectedTag))
      : allDuas;

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const shareDua = (dua: DuaType) => {
    if (navigator.share) {
      navigator.share({
        title: dua.title,
        text: `${dua.title}\n\n${dua.arabic}\n\n${dua.translation}`,
        url: window.location.href,
      }).catch(console.error);
    }
  };

  const playAudio = (url: string | undefined, id: string) => {
    if (!url) return;

    if (playingAudio === id) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audio.onended = () => setPlayingAudio(null);
      audioRef.current = audio;
      audio.play();
      setPlayingAudio(id);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#050505] relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <Header leftIcon="arrow_back" onLeftClick={() => navigate('/learn')} title="Invocations" />

      <main className="px-4 pt-2 pb-6 space-y-8 relative z-10">
        
        {/* Section Recommandation */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            <h2 className="text-xs font-black text-white uppercase tracking-widest">Besoin d'une invocation ?</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <motion.button
                key={tag.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedTag(selectedTag === tag.id ? null : tag.id);
                  setShowFavorites(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all ${
                  selectedTag === tag.id
                    ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tag.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{tag.name}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Liste des Douas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              {showFavorites ? 'Mes Favoris' : selectedTag ? `Douas : ${tags.find(t => t.id === selectedTag)?.name}` : 'Toutes les Douas'}
            </h3>
            {favorites.length > 0 && (
              <button 
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setSelectedTag(null);
                }}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${showFavorites ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
              >
                {showFavorites ? 'Voir tout' : 'Mes Favoris'}
              </button>
            )}
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {displayedDuas.length === 0 ? (
              <motion.div variants={itemVariants} className="text-center py-12 bg-card-dark border border-white/5 rounded-3xl">
                <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">sentiment_content</span>
                <p className="text-slate-400 text-sm">Aucune invocation trouvée.</p>
              </motion.div>
            ) : (
              displayedDuas.map(dua => (
                <motion.div 
                  key={dua.id} 
                  variants={itemVariants}
                  className="bg-card-dark border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/20 transition-all group relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
                  
                  <div className="p-6 space-y-6 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-bold text-slate-400 uppercase tracking-wider border border-white/5">
                            {dua.tags?.[0] || 'Général'}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white pr-4 leading-tight">{dua.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => incrementCounter('dua')}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20"
                          title={`Lu (+${XP_VALUES.DAILY_DUA} XP)`}
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleFavorite(dua.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                            favorites.includes(dua.id) 
                              ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' 
                              : 'text-slate-500 hover:bg-white/5 border-transparent'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {favorites.includes(dua.id) ? 'favorite' : 'favorite_border'}
                          </span>
                        </motion.button>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                      <p className="font-arabic text-2xl leading-[2.2] text-white text-right" dir="rtl">
                        {dua.arabic}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-primary/80 text-sm italic leading-relaxed font-serif opacity-80">
                        {dua.phonetic}
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        {dua.translation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="material-symbols-outlined text-sm">menu_book</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {dua.reference}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => shareDua(dua)}
                          className="w-8 h-8 rounded-full text-slate-500 hover:bg-white/5 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">share</span>
                        </motion.button>

                        {dua.audioUrl && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => playAudio(dua.audioUrl, dua.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                              playingAudio === dua.id 
                                ? 'bg-primary text-black animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {playingAudio === dua.id ? 'pause' : 'play_arrow'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {playingAudio === dua.id ? 'Pause' : 'Écouter'}
                            </span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </section>

      </main>
    </div>
  );
}

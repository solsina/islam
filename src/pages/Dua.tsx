import { useState, useRef } from 'react';
import Header from '../components/Header';
import { duasData, Dua as DuaType } from '../data/duasData';

export default function Dua() {
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

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
      <Header />

      <main className="px-4 pt-2 pb-6 space-y-8">
        
        {/* Section Recommandation */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Besoin d'une invocation ?</h2>
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => {
                  setSelectedTag(selectedTag === tag.id ? null : tag.id);
                  setShowFavorites(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                  selectedTag === tag.id
                    ? 'bg-primary text-black border-primary'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tag.icon}</span>
                <span className="text-sm font-medium">{tag.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Liste des Douas */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              {showFavorites ? 'Mes Favoris' : selectedTag ? `Douas : ${tags.find(t => t.id === selectedTag)?.name}` : 'Toutes les Douas'}
            </h3>
            {favorites.length > 0 && (
              <button 
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setSelectedTag(null);
                }}
                className={`text-xs font-bold uppercase tracking-wider ${showFavorites ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
              >
                {showFavorites ? 'Voir tout' : 'Mes Favoris'}
              </button>
            )}
          </div>

          {displayedDuas.length === 0 ? (
            <div className="text-center py-12 bg-card-dark border border-white/5 rounded-2xl">
              <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">sentiment_content</span>
              <p className="text-slate-400">Aucune invocation trouvée.</p>
            </div>
          ) : (
            displayedDuas.map(dua => (
              <div key={dua.id} className="bg-card-dark/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-primary/30 transition-all group">
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white pr-4">{dua.title}</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleFavorite(dua.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          favorites.includes(dua.id) ? 'text-red-500 bg-red-500/10' : 'text-slate-500 hover:bg-white/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {favorites.includes(dua.id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                      <button 
                        onClick={() => shareDua(dua)}
                        className="w-8 h-8 rounded-full text-slate-500 hover:bg-white/5 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">share</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="font-arabic text-2xl leading-loose text-white text-right" dir="rtl">
                      {dua.arabic}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-primary/80 text-sm italic leading-relaxed">
                      {dua.phonetic}
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {dua.translation}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {dua.reference}
                    </span>
                    {dua.audioUrl && (
                      <button 
                        onClick={() => playAudio(dua.audioUrl, dua.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                          playingAudio === dua.id 
                            ? 'bg-primary text-black animate-pulse' 
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {playingAudio === dua.id ? 'pause' : 'play_arrow'}
                        </span>
                        <span className="text-xs font-bold uppercase">
                          {playingAudio === dua.id ? 'Pause' : 'Écouter'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

      </main>
    </div>
  );
}

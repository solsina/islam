import { useState } from 'react';
import Header from '../components/Header';
import { duasData, DuaCategory, Dua } from '../data/duasData';

export default function Duas() {
  const [activeCategory, setActiveCategory] = useState<DuaCategory | null>(null);
  const [activeDua, setActiveDua] = useState<Dua | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    if (activeDua) {
      setActiveDua(null);
    } else if (activeCategory) {
      setActiveCategory(null);
    }
  };

  if (activeDua) {
    return (
      <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
        <Header leftIcon="arrow_back" onLeftClick={handleBack} />
        <div className="px-4 py-6 space-y-6">
          <div className="bg-card-dark border border-white/5 rounded-xl p-6 flex flex-col gap-6">
            <p className="font-arabic text-4xl text-right text-white leading-relaxed" dir="rtl">
              {activeDua.arabic}
            </p>
            <div className="h-px w-full bg-white/5"></div>
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Phonétique</h4>
              <p className="text-slate-300 italic">{activeDua.phonetic}</p>
            </div>
            <div className="h-px w-full bg-white/5"></div>
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Traduction</h4>
              <p className="text-slate-300">{activeDua.translation}</p>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-slate-500 font-medium bg-white/5 px-3 py-1.5 rounded-full">
              {activeDua.reference}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (activeCategory) {
    return (
      <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
        <Header leftIcon="arrow_back" onLeftClick={handleBack} />
        <div className="px-4 py-6 space-y-4">
          {activeCategory.duas.map((dua) => (
            <div 
              key={dua.id}
              onClick={() => setActiveDua(dua)}
              className="bg-card-dark border border-white/5 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all group"
            >
              <div className="flex-1">
                <h3 className="font-bold text-slate-100">{dua.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{dua.translation}</p>
              </div>
              <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors ml-4">chevron_right</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const allDuas = duasData.flatMap(c => c.duas);
  const filteredDuas = searchQuery 
    ? allDuas.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.translation.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-transparent">
      <Header />

      <div className="px-6 pt-2 pb-4">
        <div className="relative flex items-center group">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une invocation..." 
            className="w-full bg-card-dark border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
          />
        </div>
      </div>

      {searchQuery ? (
        <section className="px-6 py-4">
          <h2 className="text-primary text-xl font-extrabold tracking-tight mb-4">Résultats de recherche</h2>
          <div className="space-y-3">
            {filteredDuas.length > 0 ? filteredDuas.map(dua => (
              <div 
                key={dua.id}
                onClick={() => setActiveDua(dua)}
                className="flex items-center p-4 rounded-xl border border-white/5 bg-card-dark hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-100">{dua.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{dua.translation}</p>
                </div>
                <span className="material-symbols-outlined text-slate-500">chevron_right</span>
              </div>
            )) : (
              <p className="text-slate-400 text-sm text-center py-8">Aucune invocation trouvée.</p>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-primary text-xl font-extrabold tracking-tight">Catégories</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {duasData.map((category) => (
                <div 
                  key={category.id}
                  onClick={() => setActiveCategory(category)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 bg-card-dark flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl">{category.icon}</span>
                  </div>
                  <span className="font-bold text-sm text-center px-2 leading-tight text-slate-200">{category.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="px-6 py-4">
            <h2 className="text-primary text-xl font-extrabold tracking-tight mb-4">Invocations populaires</h2>
            <div className="space-y-3">
              {duasData[0].duas.map(dua => (
                <div 
                  key={dua.id}
                  onClick={() => setActiveDua(dua)}
                  className="flex items-center p-4 rounded-xl border border-white/5 bg-card-dark hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-100">{dua.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{dua.translation}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

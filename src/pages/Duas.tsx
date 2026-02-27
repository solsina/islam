import { useState } from 'react';
import Header from '../components/Header';
import { duasData, DuaCategory, Dua } from '../data/duasData';
import { motion } from 'motion/react';

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

  if (activeDua) {
    return (
      <div className="flex-1 overflow-y-auto pb-24 bg-[#050505] relative">
        <Header leftIcon="arrow_back" onLeftClick={handleBack} title="Détail" />
        <div className="px-4 py-6 space-y-6">
          <div className="bg-card-dark border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <p className="font-arabic text-3xl text-right text-white leading-[2.2] relative z-10" dir="rtl">
              {activeDua.arabic}
            </p>
            <div className="h-px w-full bg-white/5"></div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Phonétique</h4>
              <p className="text-slate-300 italic font-serif opacity-90 leading-relaxed">{activeDua.phonetic}</p>
            </div>
            <div className="h-px w-full bg-white/5"></div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Traduction</h4>
              <p className="text-slate-300 leading-relaxed font-medium">{activeDua.translation}</p>
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-bold bg-white/5 px-4 py-2 rounded-full uppercase tracking-wider border border-white/5">
              {activeDua.reference}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (activeCategory) {
    return (
      <div className="flex-1 overflow-y-auto pb-24 bg-[#050505] relative">
        <Header leftIcon="arrow_back" onLeftClick={handleBack} title={activeCategory.name} />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 py-6 space-y-3"
        >
          {activeCategory.duas.map((dua) => (
            <motion.div 
              key={dua.id}
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveDua(dua)}
              className="bg-card-dark border border-white/5 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:border-primary/30 hover:bg-white/5 transition-all group"
            >
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-slate-100 text-sm mb-1">{dua.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-1 font-medium">{dua.translation}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  const allDuas = duasData.flatMap(c => c.duas);
  const filteredDuas = searchQuery 
    ? allDuas.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.translation.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#050505] relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <Header title="Invocations" />

      <div className="px-4 pt-2 pb-4 relative z-10">
        <div className="relative flex items-center group">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une invocation..." 
            className="w-full bg-card-dark border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none font-medium text-sm shadow-lg"
          />
        </div>
      </div>

      {searchQuery ? (
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 py-4 relative z-10"
        >
          <h2 className="text-primary text-xs font-black uppercase tracking-widest mb-4 px-1">Résultats de recherche</h2>
          <div className="space-y-3">
            {filteredDuas.length > 0 ? filteredDuas.map(dua => (
              <motion.div 
                key={dua.id}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveDua(dua)}
                className="flex items-center p-5 rounded-2xl border border-white/5 bg-card-dark hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-slate-100 text-sm mb-1">{dua.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1 font-medium">{dua.translation}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12 bg-card-dark border border-white/5 rounded-3xl">
                <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">sentiment_content</span>
                <p className="text-slate-400 text-sm font-medium">Aucune invocation trouvée.</p>
              </div>
            )}
          </div>
        </motion.section>
      ) : (
        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <section className="px-4 py-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-white text-sm font-black uppercase tracking-widest">Catégories</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {duasData.map((category) => (
                <motion.div 
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(category)}
                  className="group relative aspect-square rounded-3xl overflow-hidden border border-white/5 bg-card-dark flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/30 transition-all shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-primary/10 group-hover:bg-primary/20">
                    <span className="material-symbols-outlined text-primary text-3xl">{category.icon}</span>
                  </div>
                  <span className="font-bold text-sm text-center px-4 leading-tight text-slate-200 group-hover:text-white transition-colors">{category.name}</span>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="px-4 py-4">
            <h2 className="text-white text-sm font-black uppercase tracking-widest mb-4 px-1">Populaires</h2>
            <div className="space-y-3">
              {duasData[0].duas.map(dua => (
                <motion.div 
                  key={dua.id}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveDua(dua)}
                  className="flex items-center p-5 rounded-2xl border border-white/5 bg-card-dark hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-slate-100 text-sm mb-1">{dua.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1 font-medium">{dua.translation}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.main>
      )}
    </div>
  );
}

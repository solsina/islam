import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { nawawiHadiths, Hadith as HadithType } from '../data/hadithData';
import { useHadithStore } from '../store/useHadithStore';
import { useGamificationStore, XP_VALUES } from '../store/useGamificationStore';
import { motion, AnimatePresence } from 'motion/react';

export default function Hadith() {
  const navigate = useNavigate();
  const { markAsRead, isRead, readHadithIds } = useHadithStore();
  const [activeHadith, setActiveHadith] = useState<HadithType | null>(null);
  const [hadiths, setHadiths] = useState<HadithType[]>([]);
  const [loading, setLoading] = useState(true);

  const progress = Math.round((readHadithIds.length / nawawiHadiths.length) * 100);

  useEffect(() => {
    const fetchHadiths = async () => {
      try {
        const [frRes, arRes] = await Promise.all([
          fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/fra-nawawi.json'),
          fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.json')
        ]);
        
        const frData = await frRes.json();
        const arData = await arRes.json();

        const mergedHadiths = frData.hadiths.map((h: any, i: number) => {
          // Find local hadith to get the nice title
          const localHadith = nawawiHadiths.find(lh => lh.id === h.hadithnumber);
          
          return {
            id: h.hadithnumber,
            title: localHadith ? localHadith.title : `Hadith ${h.hadithnumber}`,
            arabic: arData.hadiths[i]?.text || '',
            translation: h.text,
            narrator: 'An-Nawawi',
            reference: '40 Hadith Nawawi'
          };
        });
        
        setHadiths(mergedHadiths);
      } catch (error) {
        console.error("Erreur lors du chargement des hadiths", error);
        // Fallback to local data if API fails
        setHadiths(nawawiHadiths);
      } finally {
        setLoading(false);
      }
    };
    fetchHadiths();
  }, []);

  const handleBack = () => {
    setActiveHadith(null);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeHadith && !isRead(activeHadith.id)) {
      markAsRead(activeHadith.id);
    }
  };

  const handleNext = () => {
    if (activeHadith) {
      const currentIndex = hadiths.findIndex(h => h.id === activeHadith.id);
      if (currentIndex < hadiths.length - 1) {
        setActiveHadith(hadiths[currentIndex + 1]);
      }
    }
  };

  const handlePrev = () => {
    if (activeHadith) {
      const currentIndex = hadiths.findIndex(h => h.id === activeHadith.id);
      if (currentIndex > 0) {
        setActiveHadith(hadiths[currentIndex - 1]);
      }
    }
  };

  if (activeHadith) {
    const isCompleted = isRead(activeHadith.id);
    
    return (
      <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
        <Header leftIcon="arrow_back" onLeftClick={handleBack} title={`Hadith ${activeHadith.id}`} />

        <main className="flex-1 overflow-y-auto px-4 pt-2 pb-32">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Navigation Controls */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePrev}
                disabled={activeHadith.id === 1}
                className="p-2 rounded-full bg-white/5 text-slate-400 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {activeHadith.id} / {hadiths.length}
              </span>
              <button 
                onClick={handleNext}
                disabled={activeHadith.id === hadiths.length}
                className="p-2 rounded-full bg-white/5 text-slate-400 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-white leading-tight px-4">
                {activeHadith.title}
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-xs text-primary">person</span>
                <span className="text-xs text-slate-300">{activeHadith.narrator}</span>
              </div>
            </div>

            <div className="bg-card-dark/50 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <p className="font-arabic text-3xl leading-[2.2] text-white text-right relative z-10" dir="rtl">
                {activeHadith.arabic}
              </p>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="text-slate-200 text-lg leading-relaxed space-y-4 px-2 font-serif">
              {activeHadith.translation.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="pt-8 pb-4 flex justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkRead}
                disabled={isCompleted}
                className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm transition-all shadow-lg ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-primary text-black hover:bg-primary/90 shadow-primary/20'
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {isCompleted ? 'check_circle' : 'check'}
                </span>
                {isCompleted ? 'Lu et Appris' : `Marquer comme lu (+${XP_VALUES.DAILY_HADITH} XP)`}
              </motion.button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
      <Header leftIcon="arrow_back" onLeftClick={() => navigate('/learn')} title="Hadiths" />

      <section className="px-4 pt-2 pb-6">
        {/* Progress Card */}
        <div className="bg-gradient-to-br from-card-dark to-card-dark/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-white font-bold text-xl mb-1">40 Hadiths Nawawi</h2>
                <p className="text-slate-400 text-sm">Les fondements de la foi et de la morale</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-400">Progression</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">
                {readHadithIds.length} / {nawawiHadiths.length} hadiths lus
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 text-sm">Chargement des hadiths...</p>
            </div>
          ) : (
            hadiths.map((hadith) => {
              const isCompleted = isRead(hadith.id);
              return (
                <motion.div 
                  key={hadith.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveHadith(hadith)}
                  className={`bg-card-dark border ${isCompleted ? 'border-emerald-500/30' : 'border-white/5'} rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all group relative overflow-hidden`}
                >
                  {isCompleted && (
                    <div className="absolute top-0 right-0 p-2">
                      <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                    </div>
                  )}
                  
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg transition-colors ${
                    isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-white/5 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    {hadith.id}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base mb-1 truncate ${isCompleted ? 'text-emerald-100' : 'text-slate-100'}`}>
                      {hadith.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {hadith.translation}
                    </p>
                  </div>
                  
                  {!isCompleted && (
                    <span className="material-symbols-outlined text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useQadaStore } from './store/useQadaStore';
import { useTajwidStore } from './store/useTajwidStore';
import { useQuranStore } from './store/useQuranStore';
import { useGamificationStore, BADGES } from './store/useGamificationStore';
import { useProphetsStore } from './store/useProphetsStore';
import { motion, AnimatePresence } from 'motion/react';

export default function GamificationManager() {
  const { 
    prayerStreak, 
    totalPrayersValidated, 
    fastingCompleted, 
    voluntaryFasts 
  } = useQadaStore();
  const { completedLessons } = useTajwidStore();
  const { readSurahs } = useQuranStore();
  const { 
    checkBadges, 
    experience, 
    showLevelUp, 
    closeLevelUp, 
    level, 
    lastUnlockedBadgeId, 
    clearLastBadge 
  } = useGamificationStore();
  const { completedStories } = useProphetsStore();

  useEffect(() => {
    checkBadges({
      prayerCount: totalPrayersValidated,
      prayerStreak: prayerStreak,
      fastingCount: (fastingCompleted || 0) + voluntaryFasts.length,
      experience: experience,
      tajwidCount: completedLessons.length,
      quranCount: readSurahs.length,
      completedProphetStories: completedStories
    });
  }, [
    totalPrayersValidated, 
    prayerStreak, 
    fastingCompleted, 
    voluntaryFasts.length, 
    experience, 
    completedLessons.length,
    readSurahs.length,
    completedStories,
    checkBadges
  ]);

  const lastBadge = lastUnlockedBadgeId ? BADGES.find(b => b.id === lastUnlockedBadgeId) : null;

  return (
    <AnimatePresence>
      {/* Level Up Modal */}
      {showLevelUp && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeLevelUp}
        >
          <motion.div 
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            className="bg-card-dark border border-primary/30 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden emerald-glow"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
            
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <span className="material-symbols-outlined text-5xl text-primary">military_tech</span>
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2">Niveau {level} !</h2>
            <p className="text-slate-400 mb-6">Félicitations ! Votre dévouement porte ses fruits. Continuez ainsi.</p>
            
            <button 
              onClick={closeLevelUp}
              className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Continuer
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Badge Unlock Modal */}
      {lastBadge && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-[90] flex justify-center pointer-events-none"
        >
          <div className="bg-card-dark border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-4 max-w-md w-full pointer-events-auto" onClick={clearLastBadge}>
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl text-amber-500">{lastBadge.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Nouveau Badge Débloqué</p>
              <h3 className="text-white font-bold">{lastBadge.title}</h3>
              <p className="text-slate-400 text-xs">{lastBadge.description}</p>
            </div>
            <button onClick={clearLastBadge} className="text-slate-500 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useQadaStore, PrayerType } from '../store/useQadaStore';
import { useGamificationStore } from '../store/useGamificationStore';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export default function Qada() {
  const { t } = useTranslation();
  const { 
    initialQadaSet,
    totalDebt,
    dailyPrayers,
    setInitialQada, 
    markDailyPrayer,
    validateDoubleShot,
    validateOneQada,
    getEstimatedCompletionDate,
    prayerStreak
  } = useQadaStore();
  
  const { experience } = useGamificationStore();

  const [showInitialSetup, setShowInitialSetup] = useState(!initialQadaSet);
  
  // Questionnaire State
  const [currentAge, setCurrentAge] = useState(20);
  const [pubertyAge, setPubertyAge] = useState(13);
  const [regularity, setRegularity] = useState(50);
  const [safetyMargin, setSafetyMargin] = useState(false);
  const [isFemale, setIsFemale] = useState(false);

  // Dashboard State
  const [dailyRate, setDailyRate] = useState(1); // Estimated daily catch-up rate

  useEffect(() => {
    if (!initialQadaSet) {
      setShowInitialSetup(true);
    }
  }, [initialQadaSet]);

  const prayers: { id: PrayerType; name: string; icon: string }[] = [
    { id: 'fajr', name: t('fajr'), icon: 'wb_twilight' },
    { id: 'dhuhr', name: t('dhuhr'), icon: 'wb_sunny' },
    { id: 'asr', name: t('asr'), icon: 'wb_sunny' },
    { id: 'maghrib', name: t('maghrib'), icon: 'nights_stay' },
    { id: 'isha', name: t('isha'), icon: 'bedtime' },
  ];

  const handleSetInitialQada = () => {
    setInitialQada({
      currentAge,
      pubertyAge,
      regularity,
      safetyMargin,
      isFemale
    });
    setShowInitialSetup(false);
  };

  const estimatedDate = getEstimatedCompletionDate(dailyRate);
  const isDailyFull = Object.values(dailyPrayers).every(Boolean);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <Header title="Rattrapage (Qada)" />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-2 space-y-8 relative z-10"
      >
        
        {/* Section Aujourd'hui */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Aujourd'hui</h3>
            </div>
            {isDailyFull && (
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Journée Complète
              </motion.span>
            )}
          </div>
          
          <div className={`grid grid-cols-5 gap-2 bg-card-dark border rounded-3xl p-4 transition-all duration-500 ${isDailyFull ? 'border-primary/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}>
            {prayers.map((prayer) => (
              <motion.button
                key={prayer.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => markDailyPrayer(prayer.id)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 relative overflow-hidden ${
                  dailyPrayers[prayer.id]
                    ? 'bg-primary text-black shadow-[0_0_15px_rgba(16,183,72,0.4)]'
                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-xl relative z-10">{prayer.icon}</span>
                <span className="text-[9px] font-black uppercase relative z-10">{prayer.name.substring(0, 3)}</span>
                {dailyPrayers[prayer.id] && (
                  <motion.div 
                    layoutId={`glow-${prayer.id}`}
                    className="absolute inset-0 bg-white/20 blur-md"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Section Dette (Qada Vault) */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4 px-1">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Coffre-Fort Qada</h3>
          </div>
          
          <div className="bg-card-dark border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors duration-700"></div>
            
            <div className="relative z-10 text-center mb-8">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Dette Restante</p>
              <h2 className="text-6xl font-black text-white tracking-tighter mb-2">
                {totalDebt.toLocaleString()}
              </h2>
              <p className="text-blue-400 text-sm font-bold bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1 inline-block">Prières à rattraper</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={validateOneQada}
                className="bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                  <span className="material-symbols-outlined text-emerald-500">check</span>
                </div>
                <div>
                  <span className="block text-sm font-bold text-white mb-1">Rattrapage</span>
                  <span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider">-1 Dette</span>
                </div>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={validateDoubleShot}
                className="bg-gradient-to-br from-primary/10 to-emerald-900/10 border border-primary/20 hover:border-primary/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] relative z-10">
                  <span className="material-symbols-outlined text-black font-bold">all_inclusive</span>
                </div>
                <div className="relative z-10">
                  <span className="block text-sm font-bold text-white mb-1">Double Shot</span>
                  <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">-1 Dette + Bonus</span>
                </div>
              </motion.button>
            </div>

            {/* Projection */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rythme journalier</span>
                <span className="text-xs font-bold text-white">{dailyRate} / jour</span>
              </div>
              
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={dailyRate} 
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary mb-6"
              />

              {estimatedDate && (
                <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <span className="material-symbols-outlined">event</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Estimation de fin</p>
                    <p className="text-sm font-bold text-white">
                      {format(estimatedDate, 'd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Stats Rapides */}
        <motion.section variants={itemVariants} className="grid grid-cols-2 gap-4">
          <div className="bg-card-dark border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <span className="material-symbols-outlined text-xl">workspace_premium</span>
              </div>
              <span className="text-2xl font-black text-white">{experience}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">XP Total</p>
          </div>

          <div className="bg-card-dark border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <span className="material-symbols-outlined text-xl">local_fire_department</span>
              </div>
              <span className="text-2xl font-black text-white">{prayerStreak}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jours consécutifs</p>
          </div>
        </motion.section>

      </motion.main>

      {/* Initial Setup Modal */}
      <AnimatePresence>
        {showInitialSetup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-card-dark border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-500"></div>
              
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <span className="material-symbols-outlined text-primary text-3xl">calculate</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-white mb-2 text-center uppercase tracking-tight">Précision Chirurgicale</h2>
              <p className="text-slate-400 text-center mb-8 text-sm font-medium">Calculons ensemble ton parcours de rattrapage.</p>

              <div className="space-y-6">
                {/* Age Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Âge Actuel</label>
                    <input 
                      type="number" 
                      value={currentAge} 
                      onChange={(e) => setCurrentAge(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold text-center focus:border-primary focus:outline-none focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Âge Puberté</label>
                    <input 
                      type="number" 
                      value={pubertyAge} 
                      onChange={(e) => setPubertyAge(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold text-center focus:border-primary focus:outline-none focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                {/* Regularity Slider */}
                <div className="space-y-3 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Régularité Passée</label>
                    <span className="text-primary font-black">{regularity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={regularity} 
                    onChange={(e) => setRegularity(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-slate-500 font-medium text-center">Estimation de vos prières effectuées</p>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer border border-white/5 hover:border-white/10 transition-colors group">
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Exemption Menstruations (-7j/mois)</span>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isFemale ? 'bg-primary' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isFemale ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isFemale} 
                      onChange={(e) => setIsFemale(e.target.checked)}
                      className="hidden"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer border border-white/5 hover:border-white/10 transition-colors group">
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Marge de Sécurité (+10%)</span>
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${safetyMargin ? 'bg-primary' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${safetyMargin ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={safetyMargin} 
                      onChange={(e) => setSafetyMargin(e.target.checked)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSetInitialQada}
                className="w-full mt-8 py-4 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
              >
                Calculer ma Dette
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

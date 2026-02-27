import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useGamificationStore, BADGES } from '../store/useGamificationStore';
import { useProfileStore } from '../store/useProfileStore';
import { useProphetsStore } from '../store/useProphetsStore';
import { useHadithStore } from '../store/useHadithStore';
import { useQuranStore } from '../store/useQuranStore';
import { useQadaStore } from '../store/useQadaStore';
import { useTajwidStore } from '../store/useTajwidStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { prophetsData } from '../data/prophetsData';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

export default function Hub() {
  const navigate = useNavigate();
  const { 
    level, 
    experience, 
    unlockedBadgeIds,
    wuduCompleted,
    salahCompleted,
    zakatCalculated,
    hadithReadCount,
    duaReadCount,
    checkBadges
  } = useGamificationStore();
  
  const { name, avatarUrl, setName, setAvatarUrl, age } = useProfileStore();
  const { completedStories } = useProphetsStore();
  const { readSurahs, learnedSurahs } = useQuranStore();
  const { completedLessons } = useTajwidStore();
  const { location } = useSettingsStore();
  const { 
    totalDebt, 
    initialCounts, 
    fastingDebt, 
    fastingCompleted, 
    prayerStreak, 
    totalPrayersValidated,
    voluntaryFasts
  } = useQadaStore();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'badges'>('overview');

  // Sync gamification stats
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
  }, [totalPrayersValidated, prayerStreak, fastingCompleted, voluntaryFasts.length, experience, completedLessons.length, completedStories, checkBadges, readSurahs.length]);

  const nextLevelXp = Math.pow(level, 2) * 10;
  const prevLevelXp = Math.pow(level - 1, 2) * 10;
  const levelProgress = ((experience - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;

  const unlockedBadges = BADGES.filter(b => unlockedBadgeIds.includes(b.id));
  const lockedBadges = BADGES.filter(b => !unlockedBadgeIds.includes(b.id));

  const avatars = ['🧕', '👳‍♂️', '🧕🏼', '👳🏽‍♂️', '🧕🏾', '👳🏿‍♂️', '🦁', '🌙', '⭐', '🕌'];

  const saveProfile = () => {
    setName(tempName);
    setIsEditingProfile(false);
  };

  // Learning Stats
  const quranReadProgress = Math.round((readSurahs.length / 114) * 100);
  const quranMemorizedProgress = Math.round((learnedSurahs.length / 114) * 100);
  const prophetsProgress = Math.round((completedStories.length / prophetsData.length) * 100);
  const tajwidProgress = Math.round((completedLessons.length / 30) * 100); // Assuming 30 lessons total

  // Practice Stats
  const prayerProgress = initialCounts > 0 ? Math.round(((initialCounts - totalDebt) / initialCounts) * 100) : 0;
  const fastingTotal = fastingDebt + (fastingCompleted || 0);
  const fastingProgress = fastingTotal > 0 ? Math.round(((fastingCompleted || 0) / fastingTotal) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#050505] relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <Header title="Mon Profil" rightIcon="settings" onRightClick={() => navigate('/settings')} />

      <main className="px-4 pt-2 space-y-6 relative z-10">
        
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-dark border border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditingProfile(true)}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-card-dark to-white/5 border-4 border-primary/20 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden mb-4 group-hover:border-primary/40 transition-colors"
            >
              {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                 <span>🧕</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-2xl">edit</span>
              </div>
            </motion.button>
            
            <h2 className="text-2xl font-black text-white mb-1">{name}</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
                Niveau {level}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{experience} XP</span>
            </div>
            
            {/* XP Bar */}
            <div className="w-full max-w-[200px] relative h-2 bg-white/5 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
            <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
              {Math.round(nextLevelXp - experience)} XP pour le niveau {level + 1}
            </p>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm sticky top-0 z-20">
          {['overview', 'stats', 'badges'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative",
                activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {activeTab === tab && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-white/10 rounded-xl shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {tab === 'overview' && 'Aperçu'}
                {tab === 'stats' && 'Statistiques'}
                {tab === 'badges' && 'Succès'}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {/* Streaks Grid */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div variants={itemVariants} className="bg-card-dark border border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center gap-2 text-center group hover:border-rose-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">local_fire_department</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white block">{prayerStreak}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Jours Prière</span>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="bg-card-dark border border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center gap-2 text-center group hover:border-indigo-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">nights_stay</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white block">{fastingCompleted || 0}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Jours Jeûne</span>
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity / Quick Stats */}
              <motion.div variants={itemVariants} className="bg-card-dark border border-white/5 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-3 bg-primary rounded-full"></span>
                  Activité Récente
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <span className="material-symbols-outlined text-lg">format_quote</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Hadiths Lus</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
                      </div>
                    </div>
                    <span className="text-xl font-black text-white">{hadithReadCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <span className="material-symbols-outlined text-lg">volunteer_activism</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Duas Lues</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p>
                      </div>
                    </div>
                    <span className="text-xl font-black text-white">{duaReadCount}</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button 
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/quran')}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex flex-col gap-2 text-left hover:bg-emerald-500/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-emerald-500 text-2xl">menu_book</span>
                  <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Lire Coran</span>
                </motion.button>
                <motion.button 
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/calendar')}
                  className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex flex-col gap-2 text-left hover:bg-blue-500/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-blue-500 text-2xl">calendar_month</span>
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Calendrier</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {/* Learning Progress Section */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Apprentissage</h3>
                
                <div className="bg-card-dark border border-white/5 rounded-3xl p-5 space-y-5">
                  {/* Quran */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500 text-lg">menu_book</span>
                        <span className="text-sm font-bold text-white">Coran (Lecture)</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">{quranReadProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${quranReadProgress}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Hifz */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-lg">psychology</span>
                        <span className="text-sm font-bold text-white">Hifz (Mémorisation)</span>
                      </div>
                      <span className="text-xs font-bold text-amber-500">{quranMemorizedProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${quranMemorizedProgress}%` }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Tajwid */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500 text-lg">mic</span>
                        <span className="text-sm font-bold text-white">Tajwid</span>
                      </div>
                      <span className="text-xs font-bold text-purple-500">{tajwidProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${tajwidProgress}%` }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Prophets */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-lg">auto_stories</span>
                        <span className="text-sm font-bold text-white">Histoires Prophètes</span>
                      </div>
                      <span className="text-xs font-bold text-blue-500">{prophetsProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${prophetsProgress}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Practice Stats Section */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Pratique</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card-dark border border-white/5 rounded-3xl p-5 space-y-2">
                    <span className="material-symbols-outlined text-blue-500 text-2xl">prayer_times</span>
                    <div>
                      <span className="text-2xl font-black text-white block">{totalPrayersValidated}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prières Validées</span>
                    </div>
                  </div>
                  <div className="bg-card-dark border border-white/5 rounded-3xl p-5 space-y-2">
                    <span className="material-symbols-outlined text-indigo-500 text-2xl">water_drop</span>
                    <div>
                      <span className="text-2xl font-black text-white block">{fastingCompleted || 0}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jeûnes Rattrapés</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Guides Completion */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Guides Terminés</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-colors ${wuduCompleted ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                    <span className={`material-symbols-outlined text-2xl ${wuduCompleted ? 'text-blue-500' : 'text-slate-500'}`}>water_drop</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${wuduCompleted ? 'text-blue-200' : 'text-slate-500'}`}>Ablutions</span>
                  </div>
                  <div className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-colors ${salahCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                    <span className={`material-symbols-outlined text-2xl ${salahCompleted ? 'text-emerald-500' : 'text-slate-500'}`}>mosque</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${salahCompleted ? 'text-emerald-200' : 'text-slate-500'}`}>Prière</span>
                  </div>
                  <div className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-colors ${zakatCalculated ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                    <span className={`material-symbols-outlined text-2xl ${zakatCalculated ? 'text-amber-500' : 'text-slate-500'}`}>calculate</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${zakatCalculated ? 'text-amber-200' : 'text-slate-500'}`}>Zakat</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div 
              key="badges"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Collection</h3>
                <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-white border border-white/10">
                  {unlockedBadges.length} / {BADGES.length}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {unlockedBadges.map((badge) => (
                  <motion.button
                    key={badge.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedBadge(badge.id)}
                    className="aspect-square rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 flex flex-col items-center justify-center gap-2 p-2 relative group overflow-hidden shadow-lg shadow-amber-900/20"
                  >
                    <div className="absolute inset-0 bg-amber-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="material-symbols-outlined text-3xl text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{badge.icon}</span>
                    <span className="text-[8px] font-bold text-amber-200 text-center uppercase tracking-wider leading-tight line-clamp-2">{badge.title}</span>
                  </motion.button>
                ))}
                
                {lockedBadges.map((badge) => (
                  <motion.button
                    key={badge.id}
                    variants={itemVariants}
                    onClick={() => setSelectedBadge(badge.id)}
                    className="aspect-square rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-2 p-2 opacity-40 grayscale hover:opacity-60 transition-all"
                  >
                    <span className="material-symbols-outlined text-3xl text-slate-500">{badge.icon}</span>
                    <span className="text-[8px] font-bold text-slate-500 text-center uppercase tracking-wider leading-tight line-clamp-2">{badge.title}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card-dark border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-6"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-wider text-center">Modifier le profil</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Avatar</label>
                  <div className="grid grid-cols-5 gap-2">
                    {avatars.map(a => (
                      <button
                        key={a}
                        onClick={() => setAvatarUrl(a)} // Assuming avatars are strings/emojis
                        className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                          avatarUrl === a ? 'bg-primary/20 border-2 border-primary' : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Pseudo</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={saveProfile}
                  className="flex-1 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card-dark border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>
              
              {(() => {
                const badge = BADGES.find(b => b.id === selectedBadge);
                const isUnlocked = unlockedBadgeIds.includes(selectedBadge || '');
                if (!badge) return null;

                return (
                  <div className="relative z-10 space-y-4">
                    <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-4 ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
                        : 'bg-white/5 border border-white/10 grayscale opacity-50'
                    }`}>
                      <span className="material-symbols-outlined text-amber-400">{badge.icon}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">{badge.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{badge.description}</p>
                    </div>

                    <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-slate-500'
                    }`}>
                      {isUnlocked ? 'Débloqué' : 'Verrouillé'}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

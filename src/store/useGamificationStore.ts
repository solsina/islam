import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'prayer' | 'fasting' | 'quran' | 'tajwid' | 'social';
  requirement: number;
  unlockedAt?: string;
}

export const XP_VALUES = {
  PRAYER_ON_TIME: 20,
  PRAYER_QADA: 10,
  FASTING_RAMADAN: 100,
  FASTING_VOLUNTARY: 50,
  TAJWID_LESSON: 30,
  PROPHET_STORY: 50,
  GUIDE_COMPLETION: 50, // Wudu, Salah
  DAILY_HADITH: 15,
  DAILY_DUA: 10,
  ZAKAT_CALCULATION: 20,
  MOSQUE_FINDER: 10,
  SURAH_READ: 30,
  SURAH_LEARNED: 100
};

export const BADGES: Badge[] = [
  { id: 'first_prayer', title: 'Premier Pas', description: 'Valider votre première prière.', icon: 'auto_awesome', category: 'prayer', requirement: 1 },
  { id: 'prayer_streak_3', title: 'Constant', description: 'Maintenir une série de 3 jours de prières.', icon: 'local_fire_department', category: 'prayer', requirement: 3 },
  { id: 'prayer_streak_7', title: 'Dévoué', description: 'Maintenir une série de 7 jours de prières.', icon: 'bolt', category: 'prayer', requirement: 7 },
  { id: 'xp_100', title: 'Âme Généreuse', description: 'Atteindre 100 XP.', icon: 'workspace_premium', category: 'social', requirement: 100 },
  { id: 'xp_1000', title: 'Pilier de Lumière', description: 'Atteindre 1000 XP.', icon: 'military_tech', category: 'social', requirement: 1000 },
  { id: 'first_fast', title: 'Endurance', description: 'Compléter votre premier jeûne.', icon: 'wb_sunny', category: 'fasting', requirement: 1 },
  { id: 'fast_streak_3', title: 'Ascète', description: 'Jeûner 3 fois en une semaine.', icon: 'nights_stay', category: 'fasting', requirement: 3 },
  { id: 'tajwid_master_1', title: 'Apprenti Récitateur', description: 'Compléter le premier module de Tajwid.', icon: 'mic', category: 'tajwid', requirement: 1 },
  { id: 'quran_reader', title: 'Lecteur Assidu', description: 'Lire 5 sourates différentes.', icon: 'menu_book', category: 'quran', requirement: 5 },
  { id: 'prophet_adam', title: 'Gardien d\'Adam (as)', description: 'Maîtriser l\'histoire du premier homme.', icon: 'eco', category: 'social', requirement: 1 },
  { id: 'prophet_nuh', title: 'Gardien de Nuh (as)', description: 'Maîtriser l\'histoire de l\'arche.', icon: 'sailing', category: 'social', requirement: 1 },
  { id: 'prophet_ibrahim', title: 'Gardien d\'Ibrahim (as)', description: 'Maîtriser l\'histoire de l\'ami d\'Allah.', icon: 'local_fire_department', category: 'social', requirement: 1 },
  { id: 'prophet_musa', title: 'Gardien de Musa (as)', description: 'Maîtriser l\'histoire du Kalim Allah.', icon: 'waves', category: 'social', requirement: 1 },
  
  // New Badges
  { id: 'wudu_learner', title: 'Pureté Rituelle', description: 'Compléter le guide des ablutions.', icon: 'water_drop', category: 'social', requirement: 1 },
  { id: 'salah_learner', title: 'Apprenti Prière', description: 'Compléter le guide de la prière.', icon: 'mosque', category: 'prayer', requirement: 1 },
  { id: 'hadith_reader', title: 'Sagesse Prophétique', description: 'Lire un Hadith.', icon: 'format_quote', category: 'social', requirement: 1 },
  { id: 'dua_seeker', title: 'Invocateur', description: 'Lire une Doua.', icon: 'volunteer_activism', category: 'social', requirement: 1 },
  { id: 'zakat_aware', title: 'Conscience Sociale', description: 'Utiliser le calculateur de Zakat.', icon: 'calculate', category: 'social', requirement: 1 },
];

interface GamificationState {
  level: number;
  experience: number;
  unlockedBadgeIds: string[];
  lastUnlockedBadgeId: string | null;
  
  // Guide Completion Flags
  wuduCompleted: boolean;
  salahCompleted: boolean;
  zakatCalculated: boolean;
  hadithReadCount: number;
  duaReadCount: number;

  // UI Flags
  showLevelUp: boolean;
  closeLevelUp: () => void;

  addExperience: (amount: number) => void;
  completeGuide: (guide: 'wudu' | 'salah') => void;
  incrementCounter: (type: 'hadith' | 'dua' | 'zakat') => void;
  checkBadges: (stats: { 
    prayerCount: number, 
    prayerStreak: number, 
    fastingCount: number, 
    experience: number, 
    tajwidCount: number, 
    quranCount: number,
    completedProphetStories: string[]
  }) => void;
  clearLastBadge: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      level: 1,
      experience: 0,
      unlockedBadgeIds: [],
      lastUnlockedBadgeId: null,
      wuduCompleted: false,
      salahCompleted: false,
      zakatCalculated: false,
      hadithReadCount: 0,
      duaReadCount: 0,

      showLevelUp: false,

      addExperience: (amount) => {
        const state = get();
        const newExp = state.experience + amount;
        const newLevel = Math.floor(Math.sqrt(newExp / 10)) + 1;
        
        if (newLevel > state.level) {
          set({ experience: newExp, level: newLevel, showLevelUp: true });
        } else {
          set({ experience: newExp });
        }
      },

      closeLevelUp: () => set({ showLevelUp: false }),

      completeGuide: (guide) => {
        const state = get();
        if (guide === 'wudu' && !state.wuduCompleted) {
          state.addExperience(XP_VALUES.GUIDE_COMPLETION);
          set({ wuduCompleted: true });
        } else if (guide === 'salah' && !state.salahCompleted) {
          state.addExperience(XP_VALUES.GUIDE_COMPLETION);
          set({ salahCompleted: true });
        }
      },

      incrementCounter: (type) => {
        const state = get();
        if (type === 'hadith') {
          state.addExperience(XP_VALUES.DAILY_HADITH);
          set({ hadithReadCount: state.hadithReadCount + 1 });
        } else if (type === 'dua') {
          state.addExperience(XP_VALUES.DAILY_DUA);
          set({ duaReadCount: state.duaReadCount + 1 });
        } else if (type === 'zakat') {
          if (!state.zakatCalculated) {
             state.addExperience(XP_VALUES.ZAKAT_CALCULATION);
             set({ zakatCalculated: true });
          }
        }
      },

      checkBadges: (stats) => {
        const state = get();
        const newlyUnlocked: string[] = [];
        
        BADGES.forEach(badge => {
          if (state.unlockedBadgeIds.includes(badge.id)) return;

          let isEligible = false;
          switch (badge.id) {
            case 'first_prayer': isEligible = stats.prayerCount >= 1; break;
            case 'prayer_streak_3': isEligible = stats.prayerStreak >= 3; break;
            case 'prayer_streak_7': isEligible = stats.prayerStreak >= 7; break;
            case 'xp_100': isEligible = state.experience >= 100; break;
            case 'xp_1000': isEligible = state.experience >= 1000; break;
            case 'first_fast': isEligible = stats.fastingCount >= 1; break;
            case 'fast_streak_3': isEligible = stats.fastingCount >= 3; break;
            case 'tajwid_master_1': isEligible = stats.tajwidCount >= 1; break;
            case 'quran_reader': isEligible = stats.quranCount >= 5; break;
            case 'prophet_adam': isEligible = stats.completedProphetStories.includes('adam'); break;
            case 'prophet_nuh': isEligible = stats.completedProphetStories.includes('nuh'); break;
            case 'prophet_ibrahim': isEligible = stats.completedProphetStories.includes('ibrahim'); break;
            case 'prophet_musa': isEligible = stats.completedProphetStories.includes('musa'); break;
            
            // New checks using internal state
            case 'wudu_learner': isEligible = state.wuduCompleted; break;
            case 'salah_learner': isEligible = state.salahCompleted; break;
            case 'hadith_reader': isEligible = state.hadithReadCount >= 1; break;
            case 'dua_seeker': isEligible = state.duaReadCount >= 1; break;
            case 'zakat_aware': isEligible = state.zakatCalculated; break;
          }

          if (isEligible) {
            newlyUnlocked.push(badge.id);
          }
        });

        if (newlyUnlocked.length > 0) {
          set({
            unlockedBadgeIds: [...state.unlockedBadgeIds, ...newlyUnlocked],
            lastUnlockedBadgeId: newlyUnlocked[newlyUnlocked.length - 1]
          });
        }
      },

      clearLastBadge: () => set({ lastUnlockedBadgeId: null })
    }),
    {
      name: 'emerald-islam-gamification',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGamificationStore, XP_VALUES } from './useGamificationStore';

export type PrayerType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

interface QadaState {
  initialQadaSet: boolean;
  initialCounts: number; // Total initial debt
  totalDebt: number; // Current total debt
  fastingDebt: number; // Current fasting debt
  fastingCompleted: number; // Total Qada fasts completed
  voluntaryFasts: string[]; // Dates of voluntary fasts (ISO strings)
  qadaFasts: string[]; // Dates of Qada fasts (ISO strings)
  intentionDate: string | null; // Date for which intention was made
  
  dailyPrayers: Record<PrayerType, boolean>;
  lastDailyTrackedDate: string;
  prayerStreak: number;
  fastingStreak: number;
  totalPrayersValidated: number;
  
  // New user profile data for calculation
  userProfile: {
    currentAge: number;
    pubertyAge: number;
    regularity: number; // 0-100
    safetyMargin: boolean;
    isFemale?: boolean; // Optional for menstruation calculation
  } | null;

  setInitialQada: (profile: QadaState['userProfile']) => void;
  markDailyPrayer: (prayer: PrayerType) => void;
  validateDoubleShot: (prayer: PrayerType) => void; // Validates daily + 1 Qada
  validateOneQada: () => void; // "Rattrapage Rapide"
  validateOneFasting: (isVoluntary?: boolean, date?: string) => void; // Rattrapage Jeûne or Voluntary
  adjustFastingDebt: (amount: number) => void;
  adjustFastingCompleted: (amount: number) => void;
  setIntention: (date: string) => void;
  checkDailyReset: () => void;
  getEstimatedCompletionDate: (dailyRate: number) => Date | null;
}

export const useQadaStore = create<QadaState>()(
  persist(
    (set, get) => ({
      initialQadaSet: false,
      initialCounts: 0,
      totalDebt: 0,
      fastingDebt: 0,
      fastingCompleted: 0,
      voluntaryFasts: [],
      qadaFasts: [],
      intentionDate: null,
      dailyPrayers: {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      },
      lastDailyTrackedDate: new Date().toISOString().split('T')[0],
      prayerStreak: 0,
      fastingStreak: 0,
      totalPrayersValidated: 0,
      userProfile: null,

      setInitialQada: (profile) => {
        if (!profile) return;
        
        const yearsMissed = profile.currentAge - profile.pubertyAge;
        const daysInYear = 365;
        const prayersPerDay = 5;
        
        // Basic calculation: Years * 365 * 5
        let totalPrayers = yearsMissed * daysInYear * prayersPerDay;
        let totalFasting = yearsMissed * 30; // Approx 30 days per Ramadan
        
        // Apply regularity factor (1 - regularity/100)
        totalPrayers = totalPrayers * (1 - profile.regularity / 100);
        totalFasting = totalFasting * (1 - profile.regularity / 100);
        
        if (profile.isFemale) {
             totalPrayers = totalPrayers * (1 - 0.233);
        }

        if (profile.safetyMargin) {
          totalPrayers = totalPrayers * 1.10;
          totalFasting = totalFasting * 1.10;
        }

        const finalDebt = Math.round(totalPrayers);
        const finalFastingDebt = Math.round(totalFasting);

        set({
          initialQadaSet: true,
          userProfile: profile,
          initialCounts: finalDebt,
          totalDebt: finalDebt,
          fastingDebt: finalFastingDebt,
          prayerStreak: 0,
          fastingStreak: 0,
          totalPrayersValidated: 0
        });
      },

      markDailyPrayer: (prayer) => {
        useGamificationStore.getState().addExperience(XP_VALUES.PRAYER_ON_TIME);
        set((state) => {
          const newDaily = { ...state.dailyPrayers, [prayer]: true };
          const allDone = Object.values(newDaily).every(v => v);
          if (allDone && !Object.values(state.dailyPrayers).every(v => v)) {
            useGamificationStore.getState().addExperience(50); // Bonus for completing all 5
          }
          return { 
            dailyPrayers: newDaily,
            prayerStreak: allDone ? state.prayerStreak + 1 : state.prayerStreak,
            totalPrayersValidated: state.totalPrayersValidated + 1
          };
        });
      },

      validateDoubleShot: (prayer) => {
        useGamificationStore.getState().addExperience(XP_VALUES.PRAYER_ON_TIME + XP_VALUES.PRAYER_QADA);
        set((state) => {
          const newDaily = { ...state.dailyPrayers, [prayer]: true };
          const newDebt = Math.max(0, state.totalDebt - 1);
          const allDone = Object.values(newDaily).every(v => v);
          return { 
            dailyPrayers: newDaily,
            totalDebt: newDebt,
            prayerStreak: allDone ? state.prayerStreak + 1 : state.prayerStreak,
            totalPrayersValidated: state.totalPrayersValidated + 1
          };
        });
      },

      validateOneQada: () => {
        useGamificationStore.getState().addExperience(XP_VALUES.PRAYER_QADA);
        set((state) => ({
          totalDebt: Math.max(0, state.totalDebt - 1),
          totalPrayersValidated: state.totalPrayersValidated + 1
        }));
      },

      validateOneFasting: (isVoluntary = false, date = new Date().toISOString().split('T')[0]) => {
        set((state) => {
          if (isVoluntary) {
            if (state.voluntaryFasts.includes(date)) return {};
            useGamificationStore.getState().addExperience(XP_VALUES.FASTING_VOLUNTARY);
            return { 
              voluntaryFasts: [...state.voluntaryFasts, date],
              fastingStreak: state.fastingStreak + 1
            };
          } else {
            if (state.qadaFasts?.includes(date)) return {};
            useGamificationStore.getState().addExperience(XP_VALUES.FASTING_RAMADAN);
            return { 
              fastingDebt: Math.max(0, state.fastingDebt - 1),
              fastingCompleted: (state.fastingCompleted || 0) + 1,
              qadaFasts: [...(state.qadaFasts || []), date],
              fastingStreak: state.fastingStreak + 1
            };
          }
        });
      },

      adjustFastingDebt: (amount) => {
        set((state) => ({ fastingDebt: Math.max(0, state.fastingDebt + amount) }));
      },

      adjustFastingCompleted: (amount) => {
        set((state) => ({ fastingCompleted: Math.max(0, (state.fastingCompleted || 0) + amount) }));
      },

      setIntention: (date) => {
        set({ intentionDate: date });
      },

      checkDailyReset: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.lastDailyTrackedDate !== today) {
          // If yesterday was not fully completed, streak resets
          const allDoneYesterday = Object.values(state.dailyPrayers).every(v => v);
          
          set({
            dailyPrayers: {
              fajr: false,
              dhuhr: false,
              asr: false,
              maghrib: false,
              isha: false,
            },
            lastDailyTrackedDate: today,
            prayerStreak: allDoneYesterday ? state.prayerStreak : 0
          });
        }
      },

      getEstimatedCompletionDate: (dailyRate) => {
        const { totalDebt } = get();
        if (dailyRate <= 0 || totalDebt <= 0) return null;
        
        const daysRemaining = totalDebt / dailyRate;
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + daysRemaining);
        
        return futureDate;
      }
    }),
    {
      name: 'emerald-islam-qada-v2', // Versioned to avoid conflict with old store
      onRehydrateStorage: () => (state) => {
        state?.checkDailyReset();
      },
    }
  )
);

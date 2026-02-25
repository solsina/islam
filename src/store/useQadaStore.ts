import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  lifetimePrayerScore: number;
  
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
      lifetimePrayerScore: 0,
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
        // If regularity is 100%, debt is 0. If 0%, debt is full.
        totalPrayers = totalPrayers * (1 - profile.regularity / 100);
        totalFasting = totalFasting * (1 - profile.regularity / 100);
        
        // Apply menstruation exemption if female (approx 7 days/month = ~23% of time)
        // 7 days / 30 days = 0.233
        if (profile.isFemale) {
             totalPrayers = totalPrayers * (1 - 0.233);
             // For fasting, women have to make up missed days, so we don't reduce the fasting debt based on menstruation!
             // Actually, they miss ~7 days per Ramadan, but they MUST make them up. 
             // So if they didn't make them up, the debt remains 30 days/year missed.
        }

        // Apply safety margin (1.10)
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
          lifetimePrayerScore: 0, // Reset score on new calculation
        });
      },

      markDailyPrayer: (prayer) => {
        set((state) => {
          const newDaily = { ...state.dailyPrayers, [prayer]: true };
          // Check if all completed for visual effect or bonus
          return { dailyPrayers: newDaily };
        });
      },

      validateDoubleShot: (prayer) => {
        set((state) => {
          const newDaily = { ...state.dailyPrayers, [prayer]: true };
          const newDebt = Math.max(0, state.totalDebt - 1);
          return { 
            dailyPrayers: newDaily,
            totalDebt: newDebt,
            lifetimePrayerScore: state.lifetimePrayerScore + 2 // +1 for daily, +1 for qada
          };
        });
      },

      validateOneQada: () => {
        set((state) => ({
          totalDebt: Math.max(0, state.totalDebt - 1),
          lifetimePrayerScore: state.lifetimePrayerScore + 1
        }));
      },

      validateOneFasting: (isVoluntary = false, date = new Date().toISOString().split('T')[0]) => {
        set((state) => {
          if (isVoluntary) {
            // Check if already added
            if (state.voluntaryFasts.includes(date)) return {};
            return { voluntaryFasts: [...state.voluntaryFasts, date] };
          } else {
            // Check if already added as Qada
            if (state.qadaFasts?.includes(date)) return {};
            return { 
              fastingDebt: Math.max(0, state.fastingDebt - 1),
              fastingCompleted: (state.fastingCompleted || 0) + 1,
              qadaFasts: [...(state.qadaFasts || []), date]
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
          // Check for missed prayers from yesterday and add to debt
          // This is a simplified logic. In a real app, we'd need to know exactly when the day changed.
          // For now, we just reset. The "missed prayer -> debt" logic requires a more robust background check
          // which is tricky in a client-side only app without a server.
          // We will implement the "add to debt" manually if the user opens the app next day? 
          // Let's keep it simple: Reset daily.
          
          // Ideally:
          // const missedCount = Object.values(state.dailyPrayers).filter(v => !v).length;
          // set({ totalDebt: state.totalDebt + missedCount });
          
          set({
            dailyPrayers: {
              fajr: false,
              dhuhr: false,
              asr: false,
              maghrib: false,
              isha: false,
            },
            lastDailyTrackedDate: today,
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

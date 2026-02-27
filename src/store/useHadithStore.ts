import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGamificationStore, XP_VALUES } from './useGamificationStore';

interface HadithState {
  readHadithIds: number[];
  markAsRead: (hadithId: number) => void;
  isRead: (hadithId: number) => boolean;
  getProgress: (total: number) => number;
}

export const useHadithStore = create<HadithState>()(
  persist(
    (set, get) => ({
      readHadithIds: [],

      markAsRead: (hadithId) => {
        const state = get();
        if (!state.readHadithIds.includes(hadithId)) {
          set({ readHadithIds: [...state.readHadithIds, hadithId] });
          
          // Award XP via Gamification Store (incrementCounter handles XP addition)
          useGamificationStore.getState().incrementCounter('hadith');
        }
      },

      isRead: (hadithId) => {
        return get().readHadithIds.includes(hadithId);
      },

      getProgress: (total) => {
        const { readHadithIds } = get();
        if (total === 0) return 0;
        return Math.round((readHadithIds.length / total) * 100);
      }
    }),
    {
      name: 'emerald-islam-hadith-storage',
    }
  )
);

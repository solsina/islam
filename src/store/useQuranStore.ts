import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGamificationStore, XP_VALUES } from './useGamificationStore';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface QuranState {
  surahs: Surah[];
  learnedSurahs: number[];
  readSurahs: number[];
  lastRead: { surahId: number; ayahNumber: number } | null;
  setSurahs: (surahs: Surah[]) => void;
  toggleLearned: (id: number) => void;
  markAsRead: (id: number) => void;
  setLastRead: (surahId: number, ayahNumber: number) => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      surahs: [],
      learnedSurahs: [],
      readSurahs: [],
      lastRead: null,
      setSurahs: (surahs) => set({ surahs }),
      toggleLearned: (id) => {
        const state = get();
        const isLearned = state.learnedSurahs.includes(id);
        if (!isLearned) {
          useGamificationStore.getState().addExperience(XP_VALUES.SURAH_LEARNED);
        }
        set({
          learnedSurahs: isLearned
            ? state.learnedSurahs.filter((sId) => sId !== id)
            : [...state.learnedSurahs, id],
        });
      },
      markAsRead: (id) => {
        const state = get();
        if (!state.readSurahs.includes(id)) {
          useGamificationStore.getState().addExperience(XP_VALUES.SURAH_READ);
          set({ readSurahs: [...state.readSurahs, id] });
        }
      },
      setLastRead: (surahId, ayahNumber) => set({ lastRead: { surahId, ayahNumber } }),
    }),
    {
      name: 'emerald-islam-quran',
    }
  )
);

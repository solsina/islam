import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  lastRead: { surahId: number; ayahNumber: number } | null;
  setSurahs: (surahs: Surah[]) => void;
  toggleLearned: (id: number) => void;
  setLastRead: (surahId: number, ayahNumber: number) => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set) => ({
      surahs: [],
      learnedSurahs: [],
      lastRead: null,
      setSurahs: (surahs) => set({ surahs }),
      toggleLearned: (id) =>
        set((state) => ({
          learnedSurahs: state.learnedSurahs.includes(id)
            ? state.learnedSurahs.filter((sId) => sId !== id)
            : [...state.learnedSurahs, id],
        })),
      setLastRead: (surahId, ayahNumber) => set({ lastRead: { surahId, ayahNumber } }),
    }),
    {
      name: 'emerald-islam-quran',
    }
  )
);

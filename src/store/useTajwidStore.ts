import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TajwidState {
  completedLessons: string[];
  completeLesson: (id: string) => void;
  isLessonCompleted: (id: string) => boolean;
  getCompletionPercentage: (totalLessons: number) => number;
}

export const useTajwidStore = create<TajwidState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      completeLesson: (id) =>
        set((state) => ({
          completedLessons: state.completedLessons.includes(id)
            ? state.completedLessons
            : [...state.completedLessons, id],
        })),
      isLessonCompleted: (id) => get().completedLessons.includes(id),
      getCompletionPercentage: (totalLessons) => {
        if (totalLessons === 0) return 0;
        return Math.round((get().completedLessons.length / totalLessons) * 100);
      },
    }),
    {
      name: 'emerald-islam-tajwid',
    }
  )
);

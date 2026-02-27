import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGamificationStore, XP_VALUES } from './useGamificationStore';

interface ProphetsState {
  completedStories: string[]; // IDs of stories where quiz was passed
  unlockedBadges: string[]; // Badge names
  markStoryAsCompleted: (storyId: string, prophetName: string) => void;
  isStoryCompleted: (storyId: string) => boolean;
}

export const useProphetsStore = create<ProphetsState>()(
  persist(
    (set, get) => ({
      completedStories: [],
      unlockedBadges: [],
      markStoryAsCompleted: (storyId, prophetName) => {
        const { completedStories, unlockedBadges } = get();
        const badgeName = `Gardien de l'histoire de ${prophetName}`;
        
        if (!completedStories.includes(storyId)) {
          useGamificationStore.getState().addExperience(XP_VALUES.PROPHET_STORY);
          set({
            completedStories: [...completedStories, storyId],
            unlockedBadges: unlockedBadges.includes(badgeName) 
              ? unlockedBadges 
              : [...unlockedBadges, badgeName]
          });
        }
      },
      isStoryCompleted: (storyId) => {
        return get().completedStories.includes(storyId);
      }
    }),
    {
      name: 'prophets-library-storage',
    }
  )
);

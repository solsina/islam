import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  name: string;
  avatarUrl: string;
  hasCompletedOnboarding: boolean;
  setName: (name: string) => void;
  setAvatarUrl: (url: string) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: '',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7MnTKMCnARgWfLgn0qmTnNF32N7dlRPogcYqw9eLr0EDuXnpC-CRv_wHCKOX2SOGuG291PwT5hYPAJjhHrKKLT0dKyE8hg-WLtRgSoXgp7ZldrSDE-MbNUE6Xx6pZC4_1qD-p42Co4siO0f53DbPsrriY8qDfaAqv9l6S7wtvNp3ZOke7MWBdqVctz9P3WTGI9dvNYPspPdVM873qjs_CANl93ucmDVQP1olkKnZqW8QEztGiIDC5x4SRNMTGBY1UzX0XFaFmf40i',
      hasCompletedOnboarding: false,
      setName: (name) => set({ name }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetProfile: () => set({ name: '', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muslim', hasCompletedOnboarding: false }),
    }),
    {
      name: 'emerald-islam-profile',
    }
  )
);

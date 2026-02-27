import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  name: string;
  firstName: string;
  lastName: string;
  age: string;
  mosque: string;
  avatarUrl: string;
  hasCompletedOnboarding: boolean;
  setName: (name: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setAge: (age: string) => void;
  setMosque: (mosque: string) => void;
  setAvatarUrl: (url: string) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: '',
      firstName: '',
      lastName: '',
      age: '',
      mosque: '',
      avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=10b981',
      hasCompletedOnboarding: false,
      setName: (name) => set({ name }),
      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setAge: (age) => set({ age }),
      setMosque: (mosque) => set({ mosque }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetProfile: () => set({ 
        name: '', 
        firstName: '',
        lastName: '',
        age: '',
        mosque: '',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Muslim', 
        hasCompletedOnboarding: false 
      }),
    }),
    {
      name: 'emerald-islam-profile',
    }
  )
);

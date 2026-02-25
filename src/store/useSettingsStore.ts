import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  calculationMethod: 'MuslimWorldLeague' | 'Egyptian' | 'Karachi' | 'UmmAlQura' | 'Dubai' | 'MoonsightingCommittee' | 'NorthAmerica' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Tehran' | 'Turkey' | 'Other';
  asrMethod: 'Standard' | 'Hanafi';
  notifications: {
    adhan: boolean;
    sound: string;
  };
  appearance: {
    darkMode: boolean;
    language: string;
  };
  hijriAdjustment: number;
  setLocation: (location: SettingsState['location']) => void;
  setCalculationMethod: (method: SettingsState['calculationMethod']) => void;
  setAsrMethod: (method: SettingsState['asrMethod']) => void;
  toggleAdhanNotification: () => void;
  setSound: (sound: string) => void;
  toggleDarkMode: () => void;
  setLanguage: (language: string) => void;
  setHijriAdjustment: (adjustment: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      location: {
        lat: 48.8566,
        lng: 2.3522,
        city: 'Paris',
        country: 'France',
      },
      calculationMethod: 'MuslimWorldLeague', // Closest to UOIF 12° in adhan library
      asrMethod: 'Standard',
      notifications: {
        adhan: true,
        sound: 'Mekkah - Sheikh Ali Mulla',
      },
      appearance: {
        darkMode: true,
        language: 'Français',
      },
      hijriAdjustment: 0,
      setLocation: (location) => set({ location }),
      setCalculationMethod: (calculationMethod) => set({ calculationMethod }),
      setAsrMethod: (asrMethod) => set({ asrMethod }),
      toggleAdhanNotification: () =>
        set((state) => ({
          notifications: { ...state.notifications, adhan: !state.notifications.adhan },
        })),
      setSound: (sound) =>
        set((state) => ({
          notifications: { ...state.notifications, sound },
        })),
      toggleDarkMode: () =>
        set((state) => ({
          appearance: { ...state.appearance, darkMode: !state.appearance.darkMode },
        })),
      setLanguage: (language) =>
        set((state) => ({
          appearance: { ...state.appearance, language },
        })),
      setHijriAdjustment: (hijriAdjustment) => set({ hijriAdjustment }),
    }),
    {
      name: 'emerald-islam-settings',
    }
  )
);

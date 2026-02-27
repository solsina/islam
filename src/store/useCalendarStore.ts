import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import moment from 'moment-hijri';

export interface CalendarEvent {
  id: string;
  date: string; // Format: YYYY-MM-DD (Gregorian)
  title: string;
  description?: string;
  type: 'personal' | 'fasting' | 'reminder' | 'quran';
  time?: string; // Format: HH:mm
}

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: Math.random().toString(36).substr(2, 9) }]
      })),
      
      removeEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id)
      })),
      
      getEventsForDate: (date) => {
        return get().events.filter(e => e.date === date).sort((a, b) => {
          if (!a.time) return -1;
          if (!b.time) return 1;
          return a.time.localeCompare(b.time);
        });
      },
      
      getUpcomingEvents: (limit = 5) => {
        const today = moment().format('YYYY-MM-DD');
        return get().events
          .filter(e => e.date >= today)
          .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            if (!a.time) return -1;
            if (!b.time) return 1;
            return a.time.localeCompare(b.time);
          })
          .slice(0, limit);
      }
    }),
    {
      name: 'islamic-calendar-storage',
    }
  )
);

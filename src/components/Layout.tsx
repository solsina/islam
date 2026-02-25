import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { useSettingsStore } from '../store/useSettingsStore';
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const { appearance } = useSettingsStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (appearance.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [appearance.darkMode]);

  useEffect(() => {
    if (appearance.language !== i18n.language) {
      i18n.changeLanguage(appearance.language);
      document.documentElement.dir = appearance.language === 'العربية' ? 'rtl' : 'ltr';
    }
  }, [appearance.language, i18n]);

  return (
    <div className="flex-1 flex flex-col font-display relative bg-background-dark text-white overflow-hidden">
      {/* Premium Atmospheric Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background-dark">
        {/* Deep Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 via-background-dark to-background-dark"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-emerald-900/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full bg-emerald-900/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating Accent */}
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-float"></div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col w-full h-full overflow-hidden">
        <Outlet />
      </div>
      <BottomNavigation />
    </div>
  );
}

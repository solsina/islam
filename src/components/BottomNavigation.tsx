import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export default function BottomNavigation() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', icon: 'home', label: t('home') },
    { path: '/tajwid', icon: 'mic', label: t('tajwid') },
    { path: '/qibla', icon: 'explore', label: t('qibla'), isCentral: true },
    { path: '/quran', icon: 'menu_book', label: t('quran') },
    { path: '/profile', icon: 'person', label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-card-dark/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-2 py-2 flex items-center justify-between relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.isCentral) {
              return (
                <div key={item.path} className="flex-1 flex justify-center relative z-10">
                  <Link
                    to={item.path}
                    className={clsx(
                      "absolute -top-10 bg-gradient-to-b from-primary to-primary/80 size-16 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(16,183,72,0.4)] border-[6px] border-background-dark transition-transform hover:scale-105 active:scale-95",
                      isActive ? "shadow-[0_4px_25px_rgba(16,183,72,0.6)]" : ""
                    )}
                  >
                    <span className="material-symbols-outlined text-black text-[32px] font-light">explore</span>
                  </Link>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-8 pointer-events-none">
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-2xl transition-all duration-300 relative",
                  isActive ? "text-primary" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"></div>
                )}
                <span 
                  className={clsx(
                    "material-symbols-outlined text-[26px] transition-transform duration-300",
                    isActive ? "scale-110 font-medium" : "font-light"
                  )}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className={clsx(
                  "text-[9px] uppercase tracking-widest transition-all duration-300", 
                  isActive ? "font-bold opacity-100" : "font-medium opacity-70"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

export default function BottomNavigation() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', icon: 'dashboard', label: 'Aujourd\'hui' },
    { path: '/quran', icon: 'menu_book', label: 'Lecture' },
    { path: '/learn', icon: 'school', label: 'Apprendre' },
    { path: '/hub', icon: 'person', label: 'Moi' },
  ];

  // Only show bottom navigation on main tabs
  const mainRoutes = ['/', '/quran', '/learn', '/hub', '/profile'];
  const isMainRoute = mainRoutes.includes(location.pathname);

  return (
    <AnimatePresence>
      {isMainRoute && (
        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pt-2 pointer-events-none"
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] px-4 py-2 flex items-center justify-between relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      "flex flex-col items-center justify-center gap-1 flex-1 py-3 rounded-2xl transition-all duration-500 relative group",
                      isActive ? "text-primary" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="nav-active-glow"
                        className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(0,230,118,0.8)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <motion.span 
                      animate={{ 
                        scale: isActive ? 1.1 : 1,
                        y: isActive ? -2 : 0
                      }}
                      className={clsx(
                        "material-symbols-outlined text-[24px] transition-all duration-500",
                        isActive ? "font-medium" : "font-light"
                      )}
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </motion.span>
                    <span className={clsx(
                      "text-[8px] uppercase tracking-[0.15em] transition-all duration-500", 
                      isActive ? "font-black opacity-100" : "font-bold opacity-40 group-hover:opacity-70"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

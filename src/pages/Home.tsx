import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getPrayerTimes, formatTime } from '../utils/prayerTimes';
import { useSettingsStore } from '../store/useSettingsStore';
import { useQadaStore } from '../store/useQadaStore';
import { useTajwidStore } from '../store/useTajwidStore';
import { useQuranStore } from '../store/useQuranStore';
import { tajwidData } from '../data/tajwidData';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { surahNamesFr } from '../utils/surahNamesFr';
import moment from 'moment-hijri';
import 'moment/locale/fr';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const { location, hijriAdjustment } = useSettingsStore();
  
  // Get real data from stores
  const { totalDebt, fastingDebt, intentionDate, setIntention } = useQadaStore();
  const { getCompletionPercentage } = useTajwidStore();
  const { lastRead, surahs } = useQuranStore();
  
  const totalLessons = tajwidData.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const tajwidProgress = getCompletionPercentage(totalLessons);
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Set locale to French
  moment.locale('fr');
  const hijriDate = moment(now).add(hijriAdjustment, 'days').format('iD iMMMM iYYYY');

  const prayerTimes = getPrayerTimes(now);
  const nextPrayer = prayerTimes.nextPrayer();
  const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);

  // Fallback if next prayer is tomorrow
  const nextTime = nextPrayerTime || getPrayerTimes(new Date(now.getTime() + 86400000)).fajr;
  const nextName = nextPrayer !== 'none' ? nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1) : 'Fajr';

  const duration = intervalToDuration({ start: now, end: nextTime });
  const countdown = `${String(duration.hours || 0).padStart(2, '0')}:${String(duration.minutes || 0).padStart(2, '0')}:${String(duration.seconds || 0).padStart(2, '0')}`;

  const services = [
    { name: t('quran'), icon: 'menu_book', path: '/quran' },
    { name: t('calendar'), icon: 'calendar_today', path: '/calendar' },
    { name: t('zakat'), icon: 'payments', path: '/zakat' },
    { name: t('duas'), icon: 'volunteer_activism', path: '/duas' },
    { name: t('hadith'), icon: 'format_quote', path: '/hadith' },
    { name: t('qada'), icon: 'history', path: '/qada' },
    { name: t('tajwid'), icon: 'mic', path: '/tajwid' },
    { name: 'Showcase', icon: 'auto_awesome', path: '/showcase' },
  ];

  const prayers = [
    { id: 'fajr', name: 'Fajr', time: formatTime(prayerTimes.fajr), icon: 'wb_twilight' },
    { id: 'dhuhr', name: 'Dhuhr', time: formatTime(prayerTimes.dhuhr), icon: 'light_mode' },
    { id: 'asr', name: 'Asr', time: formatTime(prayerTimes.asr), icon: 'partly_cloudy_day' },
    { id: 'maghrib', name: 'Maghrib', time: formatTime(prayerTimes.maghrib), icon: 'wb_sunny' },
    { id: 'isha', name: 'Isha', time: formatTime(prayerTimes.isha), icon: 'bedtime' },
  ];

  // Find last read surah details
  const lastReadSurah = lastRead ? surahs.find(s => s.number === lastRead.surahId) : null;
  const lastReadSurahNameFr = lastReadSurah ? (surahNamesFr[lastReadSurah.number] || lastReadSurah.englishNameTranslation) : '';

  // Calculate next fasting opportunity
  const nextFastingOpp = (() => {
    const today = moment();
    const adjustedToday = today.clone().add(hijriAdjustment, 'days');
    const dayOfWeek = today.day(); // 0=Sun, 1=Mon, ...
    
    let nextFast = null;
    let type = '';

    // Check for White Days (13, 14, 15)
    const currentHDay = adjustedToday.iDate();
    if (currentHDay < 13) {
      nextFast = adjustedToday.clone().iDate(13).subtract(hijriAdjustment, 'days');
      type = 'Jours Blancs';
    } else if (currentHDay < 14) {
      nextFast = adjustedToday.clone().iDate(14).subtract(hijriAdjustment, 'days');
      type = 'Jours Blancs';
    } else if (currentHDay < 15) {
      nextFast = adjustedToday.clone().iDate(15).subtract(hijriAdjustment, 'days');
      type = 'Jours Blancs';
    }

    // Check for Monday/Thursday
    const daysToMon = (1 + 7 - dayOfWeek) % 7 || 7;
    const daysToThu = (4 + 7 - dayOfWeek) % 7 || 7;
    
    const nextMon = today.clone().add(daysToMon, 'days');
    const nextThu = today.clone().add(daysToThu, 'days');

    // If White Day is closer or same, prioritize it
    if (nextFast) {
      const diffWhite = nextFast.diff(today, 'days');
      if (diffWhite <= Math.min(daysToMon, daysToThu)) {
        return { date: nextFast, type, diff: diffWhite };
      }
    }

    // Otherwise return closest Mon/Thu
    if (daysToMon < daysToThu) {
      return { date: nextMon, type: 'Lundi (Sunnah)', diff: daysToMon };
    } else {
      return { date: nextThu, type: 'Jeudi (Sunnah)', diff: daysToThu };
    }
  })();

  const fastingDiffText = nextFastingOpp.diff === 0 ? "Aujourd'hui" : nextFastingOpp.diff === 1 ? "Demain" : `Dans ${nextFastingOpp.diff} jours`;
  const isIntentionSet = intentionDate === moment().add(1, 'days').format('YYYY-MM-DD');

  const handleIntentionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    if (intentionDate === tomorrow) {
      setIntention('');
    } else {
      setIntention(tomorrow);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
      <Header />

      <div className="px-4 pt-2 pb-6">
        <div className="bg-gradient-to-br from-primary/20 via-card-dark to-card-dark border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-slate-400 text-xs font-medium mb-1 capitalize">{hijriDate}</p>
                <p className="text-white font-bold text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  {location.city}
                </p>
              </div>
              <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(16,183,72,0.8)]"></span>
                <span className="text-[10px] font-bold text-white tracking-wider uppercase">{t('next_prayer')}</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-extrabold text-white tracking-tight mb-1">{nextName}</h2>
                <p className="text-primary text-xl font-mono font-medium">{countdown}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Imsak</p>
                <p className="text-white font-medium text-sm mb-2">{formatTime(prayerTimes.fajr)}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Sunrise</p>
                <p className="text-white font-medium text-sm">{formatTime(prayerTimes.sunrise)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fasting Opportunity Widget */}
      <section className="px-4 mb-4">
        <div className="bg-card-dark border border-white/5 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden group cursor-pointer" onClick={() => navigate('/calendar?tab=fasting')}>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">event_available</span>
            </div>
            <div>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5">Prochain Jeûne</p>
              <h3 className="text-white font-bold">{nextFastingOpp.type}</h3>
              <p className="text-slate-400 text-xs">{fastingDiffText} • {nextFastingOpp.date.format('D MMMM')}</p>
            </div>
          </div>
          
          {nextFastingOpp.diff === 1 ? (
            <button 
              onClick={handleIntentionClick}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all z-20 ${
                isIntentionSet 
                  ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {isIntentionSet ? 'Intention' : 'Définir'}
            </button>
          ) : (
            <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
          )}
        </div>
      </section>

      {/* Quick Stats Dashboard */}
      <section className="px-4 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <Link to="/qada" className="bg-card-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-all group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-xl">history</span>
            </div>
            <span className="text-white font-bold text-xl mb-1">{totalDebt}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Prières</span>
          </Link>
          <Link to="/calendar?tab=fasting" className="bg-card-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-all group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-xl">no_meals</span>
            </div>
            <span className="text-white font-bold text-xl mb-1">{fastingDebt}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Jeûnes</span>
          </Link>
          <Link to="/tajwid" className="bg-card-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-all group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
              <div className="h-full bg-primary" style={{ width: `${tajwidProgress}%` }}></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-xl">mic</span>
            </div>
            <span className="text-white font-bold text-xl mb-1">{tajwidProgress}%</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Tajwid</span>
          </Link>
        </div>
      </section>

      {/* Reprendre ma lecture */}
      {lastReadSurah && (
        <section className="px-4 mb-8">
          <div 
            onClick={() => navigate(`/quran/${lastReadSurah.number}`)}
            className="bg-gradient-to-r from-card-dark to-card-dark border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/10 to-transparent"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-black/50 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
              </div>
              <div>
                <p className="text-[9px] text-primary font-bold uppercase tracking-widest mb-1">Reprendre la lecture</p>
                <h3 className="text-white font-bold text-lg leading-tight">{lastReadSurah.englishName}</h3>
                <p className="text-slate-400 text-xs mt-1">{lastReadSurahNameFr} • Verset {lastRead?.ayahNumber}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors relative z-10">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </section>
      )}

      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-white font-bold tracking-wide">{t('todays_prayers')}</h3>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
            {location.city}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {prayers.map((prayer) => {
            const isNext = prayer.id === nextPrayer;
            return (
              <div 
                key={prayer.id} 
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                  isNext 
                    ? 'bg-gradient-to-r from-primary/20 to-card-dark border border-primary/30 shadow-[0_4px_20px_rgba(16,183,72,0.15)] scale-[1.02]' 
                    : 'bg-card-dark border border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                    isNext 
                      ? 'bg-primary text-black shadow-primary/50' 
                      : 'bg-white/5 text-slate-400 border border-white/5'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">
                      {prayer.icon}
                    </span>
                  </div>
                  <span className={`${isNext ? 'text-white font-bold text-lg' : 'text-slate-300 font-medium'}`}>
                    {prayer.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`${isNext ? 'text-primary' : 'text-slate-300'} font-bold font-mono text-lg`}>
                    {prayer.time}
                  </span>
                  <button className={`p-2 rounded-full transition-colors ${
                    isNext 
                      ? 'bg-black/20 text-primary hover:bg-black/40' 
                      : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 mb-8">
        <h3 className="text-white font-bold tracking-wide mb-4 px-1">{t('services')}</h3>
        <div className="grid grid-cols-4 gap-x-3 gap-y-6">
          {services.map((service) => (
            <Link key={service.name} to={service.path} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-[4.5rem] h-[4.5rem] rounded-[1.25rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/10 border-t-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:from-primary/20 group-hover:to-primary/5 group-hover:border-primary/30 group-hover:border-t-primary/40 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="material-symbols-outlined text-slate-200 text-[28px] group-hover:text-primary transition-colors relative z-10">{service.icon}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium text-center leading-tight group-hover:text-slate-200 transition-colors">{service.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPrayerTimes, formatTime } from '../utils/prayerTimes';
import { useSettingsStore } from '../store/useSettingsStore';
import { useQadaStore, PrayerType } from '../store/useQadaStore';
import { useTajwidStore } from '../store/useTajwidStore';
import { useQuranStore } from '../store/useQuranStore';
import { useProfileStore } from '../store/useProfileStore';
import { useGamificationStore, XP_VALUES } from '../store/useGamificationStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { getHolidayForDate } from '../utils/islamicEvents';
import { tajwidData } from '../data/tajwidData';
import { nawawiHadiths } from '../data/hadithData';
import { namesOfAllah } from '../data/namesData';
import { duasData } from '../data/duasData';
import { intervalToDuration, differenceInMinutes } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { surahNamesFr } from '../utils/surahNamesFr';
import moment from 'moment-hijri';
import 'moment/locale/fr';
import { motion } from 'motion/react';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const { location, hijriAdjustment } = useSettingsStore();
  
  const { intentionDate, setIntention, prayerStreak, dailyPrayers, markDailyPrayer } = useQadaStore();
  const { getCompletionPercentage } = useTajwidStore();
  const { lastRead, surahs } = useQuranStore();
  const { name, avatarUrl } = useProfileStore();
  const { level, experience } = useGamificationStore();
  const { getEventsForDate } = useCalendarStore();
  
  const nextLevelXp = 10 * Math.pow(level, 2);
  
  const totalLessons = tajwidData.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const tajwidProgress = getCompletionPercentage(totalLessons);
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  moment.locale('fr');
  const todayStr = moment(now).format('YYYY-MM-DD');
  const hijriDate = moment(now).add(hijriAdjustment, 'days').format('iD iMMMM iYYYY');
  const gregorianDate = moment(now).format('dddd D MMMM YYYY');

  const prayerTimes = getPrayerTimes(now);
  const nextPrayer = prayerTimes.nextPrayer();
  const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);

  const nextTime = nextPrayerTime || getPrayerTimes(new Date(now.getTime() + 86400000)).fajr;
  const nextName = nextPrayer !== 'none' ? nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1) : 'Fajr';

  const duration = intervalToDuration({ start: now, end: nextTime });
  const countdown = `${String(duration.hours || 0).padStart(2, '0')}:${String(duration.minutes || 0).padStart(2, '0')}:${String(duration.seconds || 0).padStart(2, '0')}`;

  // Dynamic Content Selection based on day
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  
  const dailyHadith = useMemo(() => nawawiHadiths[dayOfYear % nawawiHadiths.length], [dayOfYear]);
  const dailyDua = useMemo(() => {
    const allDuas = duasData.flatMap(c => c.duas);
    return allDuas[dayOfYear % allDuas.length];
  }, [dayOfYear]);
  const dailyName = useMemo(() => namesOfAllah[dayOfYear % namesOfAllah.length], [dayOfYear]);

  // Dynamic Background for Next Prayer
  const getPrayerGradient = (prayer: string) => {
    switch(prayer.toLowerCase()) {
      case 'fajr': return 'from-slate-900 via-indigo-900 to-slate-800';
      case 'dhuhr': return 'from-sky-400 via-blue-400 to-sky-300';
      case 'asr': return 'from-blue-500 via-orange-300 to-orange-200';
      case 'maghrib': return 'from-indigo-900 via-purple-800 to-orange-500';
      case 'isha': return 'from-slate-950 via-slate-900 to-indigo-950';
      default: return 'from-primary/20 via-card-dark to-card-dark';
    }
  };
  
  const nextPrayerGradient = getPrayerGradient(nextPrayer !== 'none' ? nextPrayer : 'fajr');

  const lastReadSurah = lastRead ? surahs.find(s => s.number === lastRead.surahId) : null;
  const lastReadSurahNameFr = lastReadSurah ? (surahNamesFr[lastReadSurah.number] || lastReadSurah.englishNameTranslation) : '';

  // Fasting Logic
  const isIntentionSet = intentionDate === moment().add(1, 'days').format('YYYY-MM-DD');
  const isFastingToday = intentionDate === todayStr;
  const todayHoliday = getHolidayForDate(todayStr, hijriAdjustment);
  const isRamadan = moment(now).add(hijriAdjustment, 'days').iMonth() === 8; // 8 is Ramadan (0-indexed)
  
  const isActuallyFasting = isFastingToday || isRamadan || (todayHoliday && todayHoliday.type === 'fasting');

  // Fasting Progress Calculation
  let fastingProgress = 0;
  let remainingFastingTime = '';
  if (isActuallyFasting) {
    const fajrTime = prayerTimes.fajr;
    const maghribTime = prayerTimes.maghrib;
    
    if (now >= fajrTime && now <= maghribTime) {
      const totalFastingMinutes = differenceInMinutes(maghribTime, fajrTime);
      const elapsedMinutes = differenceInMinutes(now, fajrTime);
      fastingProgress = Math.min(100, Math.max(0, (elapsedMinutes / totalFastingMinutes) * 100));
      
      const remainingDuration = intervalToDuration({ start: now, end: maghribTime });
      remainingFastingTime = `${String(remainingDuration.hours || 0).padStart(2, '0')}h ${String(remainingDuration.minutes || 0).padStart(2, '0')}m`;
    } else if (now > maghribTime) {
      fastingProgress = 100;
      remainingFastingTime = "Jeûne rompu";
    } else {
      fastingProgress = 0;
      const remainingDuration = intervalToDuration({ start: now, end: fajrTime });
      remainingFastingTime = `Débute dans ${String(remainingDuration.hours || 0).padStart(2, '0')}h ${String(remainingDuration.minutes || 0).padStart(2, '0')}m`;
    }
  }

  // Next Fasting Opportunity
  const nextFastingOpp = (() => {
    const today = moment();
    const adjustedToday = today.clone().add(hijriAdjustment, 'days');
    const dayOfWeek = today.day();
    
    let nextFast = null;
    let type = '';

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

    const daysToMon = (1 + 7 - dayOfWeek) % 7 || 7;
    const daysToThu = (4 + 7 - dayOfWeek) % 7 || 7;
    
    const nextMon = today.clone().add(daysToMon, 'days');
    const nextThu = today.clone().add(daysToThu, 'days');

    if (nextFast) {
      const diffWhite = nextFast.diff(today, 'days');
      if (diffWhite <= Math.min(daysToMon, daysToThu)) {
        return { date: nextFast, type, diff: diffWhite };
      }
    }

    if (daysToMon < daysToThu) {
      return { date: nextMon, type: 'Lundi (Sunnah)', diff: daysToMon };
    } else {
      return { date: nextThu, type: 'Jeudi (Sunnah)', diff: daysToThu };
    }
  })();

  const fastingDiffText = nextFastingOpp.diff === 0 ? "Aujourd'hui" : nextFastingOpp.diff === 1 ? "Demain" : `Dans ${nextFastingOpp.diff} jours`;

  const handleIntentionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    if (intentionDate === tomorrow) {
      setIntention('');
    } else {
      setIntention(tomorrow);
    }
  };

  // Timeline Generation
  const todayEvents = getEventsForDate(todayStr);
  
  const timelineItems = useMemo(() => {
    const items = [
      { id: 'fajr', type: 'prayer', time: formatTime(prayerTimes.fajr), title: 'Fajr', icon: 'wb_twilight', dateObj: prayerTimes.fajr },
      { id: 'sunrise', type: 'sun', time: formatTime(prayerTimes.sunrise), title: 'Lever du Soleil', icon: 'light_mode', dateObj: prayerTimes.sunrise },
      { id: 'dhuhr', type: 'prayer', time: formatTime(prayerTimes.dhuhr), title: 'Dhuhr', icon: 'light_mode', dateObj: prayerTimes.dhuhr },
      { id: 'asr', type: 'prayer', time: formatTime(prayerTimes.asr), title: 'Asr', icon: 'partly_cloudy_day', dateObj: prayerTimes.asr },
      { id: 'maghrib', type: 'prayer', time: formatTime(prayerTimes.maghrib), title: 'Maghrib', icon: 'wb_sunny', dateObj: prayerTimes.maghrib },
      { id: 'isha', type: 'prayer', time: formatTime(prayerTimes.isha), title: 'Isha', icon: 'bedtime', dateObj: prayerTimes.isha },
    ];

    todayEvents.forEach(event => {
      if (event.time) {
        const [hours, minutes] = event.time.split(':').map(Number);
        const eventDate = new Date(now);
        eventDate.setHours(hours, minutes, 0, 0);
        items.push({
          id: event.id,
          type: 'event',
          time: event.time,
          title: event.title,
          icon: event.type === 'quran' ? 'menu_book' : event.type === 'fasting' ? 'event_available' : 'event_note',
          dateObj: eventDate
        });
      }
    });

    return items.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [prayerTimes, todayEvents, now]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 overflow-y-auto pb-32 bg-[#050505] relative"
    >
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Header */}
      <motion.div variants={itemVariants} className="px-6 pt-8 pb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 w-full">
          <Link to="/hub" className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-primary to-emerald-400 shadow-lg shadow-primary/20 shrink-0 block">
            <div className="w-full h-full rounded-full bg-[#0a0a0a] overflow-hidden border-2 border-[#0a0a0a]">
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-lg font-black text-white tracking-tight truncate mr-2">Salam, {name || 'Ami'}</h1>
              <div className="flex items-center gap-1 text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <span className="material-symbols-outlined text-[12px] font-bold">local_fire_department</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{prayerStreak} Jours</span>
              </div>
            </div>
            
            <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden mb-1.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(experience / nextLevelXp) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
              <span>Niv. {level}</span>
              <span>{experience} / {nextLevelXp} XP</span>
            </div>
          </div>
          
          <Link to="/settings" className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white/10 transition-colors shrink-0 ml-2">
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </motion.div>

      {/* Contextual Banner (Holidays / Jumu'ah) */}
      {(todayHoliday || now.getDay() === 5) && (
        <motion.div variants={itemVariants} className="px-4 pb-4 relative z-10">
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-900/10 border border-amber-500/30 rounded-[2rem] p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <span className="material-symbols-outlined text-2xl">{todayHoliday ? 'celebration' : 'mosque'}</span>
            </div>
            <div>
              <h3 className="text-white font-black text-sm">{todayHoliday ? todayHoliday.name : 'Jumu\'ah Mubarak'}</h3>
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                {todayHoliday ? todayHoliday.description : 'N\'oubliez pas la sourate Al-Kahf et les prières sur le Prophète (ﷺ)'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Prayer Hero */}
      <motion.div variants={itemVariants} className="px-4 pb-6 relative z-10">
        <div className={`bg-gradient-to-br ${nextPrayerGradient} border border-white/10 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl transition-all duration-1000`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{gregorianDate} • {hijriDate}</p>
                <p className="text-white font-bold text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-white/80">location_on</span>
                  {location.city}
                </p>
              </div>
              <div className="bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                <span className="text-[9px] font-black text-white tracking-widest uppercase">{t('next_prayer')}</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-black text-white tracking-tight mb-1">{nextName}</h2>
                <p className="text-white/90 text-2xl font-mono font-medium tracking-tight">{countdown}</p>
              </div>
              <div className="text-right flex flex-col gap-2">
                <div>
                  <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-0.5">Imsak</p>
                  <p className="text-white font-bold text-sm">{formatTime(prayerTimes.fajr)}</p>
                </div>
                <div>
                  <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-0.5">Sunrise</p>
                  <p className="text-white font-bold text-sm">{formatTime(prayerTimes.sunrise)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Fasting Tracker (If Fasting Today) */}
      {isActuallyFasting && (
        <motion.section variants={itemVariants} className="px-4 mb-8 relative z-10">
          <div className="bg-card-dark border border-indigo-500/30 rounded-[2rem] p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <span className="material-symbols-outlined">restaurant_menu</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Jeûne en cours</h3>
                  <p className="text-indigo-400/80 text-[10px] font-bold uppercase tracking-wider">{isRamadan ? 'Ramadan' : 'Jeûne Volontaire'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono font-bold">{remainingFastingTime}</p>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Restant</p>
              </div>
            </div>
            <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${fastingProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-500 relative z-10">
              <span>Fajr {formatTime(prayerTimes.fajr)}</span>
              <span>Maghrib {formatTime(prayerTimes.maghrib)}</span>
            </div>
          </div>
        </motion.section>
      )}

      {/* Quick Actions Grid */}
      <motion.section variants={itemVariants} className="px-4 mb-8 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          <Link to="/qibla" className="bg-card-dark border border-white/5 rounded-3xl p-3 flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">explore</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">Qibla</span>
          </Link>
          <Link to="/mosques" className="bg-card-dark border border-white/5 rounded-3xl p-3 flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">mosque</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">Mosquées</span>
          </Link>
          <Link to="/calendar" className="bg-card-dark border border-white/5 rounded-3xl p-3 flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">calendar_month</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">Calendrier</span>
          </Link>
          <Link to="/zakat" className="bg-card-dark border border-white/5 rounded-3xl p-3 flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">calculate</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">Zakat</span>
          </Link>
        </div>
      </motion.section>

      {/* Agenda du Jour (Timeline) */}
      <motion.section variants={itemVariants} className="px-4 mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Agenda du Jour</h3>
          </div>
          <Link to="/calendar" className="text-[9px] uppercase tracking-widest text-emerald-500 font-black bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
            Gérer
          </Link>
        </div>
        
        <div className="bg-card-dark border border-white/5 rounded-[2rem] p-6 relative">
          <div className="absolute left-10 top-6 bottom-6 w-px bg-white/10"></div>
          
          <div className="flex flex-col gap-6">
            {timelineItems.map((item, index) => {
              const isPast = now > item.dateObj;
              const isNext = item.type === 'prayer' && item.id === nextPrayer;
              const isDone = item.type === 'prayer' && dailyPrayers[item.id as PrayerType];
              
              return (
                <div key={`${item.id}-${index}`} className={`flex items-start gap-4 relative z-10 ${isPast && !isDone && item.type === 'prayer' ? 'opacity-50' : ''}`}>
                  <div className="w-12 text-right pt-1 shrink-0">
                    <span className={`text-xs font-mono font-bold ${isNext ? 'text-emerald-400' : 'text-slate-400'}`}>{item.time}</span>
                  </div>
                  
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isDone 
                        ? 'bg-emerald-500 border-emerald-500 text-black' 
                        : isNext 
                          ? 'bg-card-dark border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                          : item.type === 'event'
                            ? 'bg-card-dark border-blue-500 text-blue-500'
                            : 'bg-card-dark border-white/10 text-slate-500'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {isDone ? 'check' : item.icon}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 pt-1 flex justify-between items-start">
                    <div>
                      <h4 className={`font-bold text-sm ${isNext || isDone ? 'text-white' : 'text-slate-300'} ${isDone ? 'line-through decoration-emerald-500/50' : ''}`}>
                        {item.title}
                      </h4>
                      {item.type === 'event' && (
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Événement</p>
                      )}
                    </div>
                    
                    {item.type === 'prayer' && (
                      <button 
                        onClick={() => !isDone && markDailyPrayer(item.id as PrayerType)}
                        disabled={isDone}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isDone
                            ? 'text-emerald-500 cursor-default'
                            : isNext 
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black' 
                              : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isDone ? 'task_alt' : 'check_circle'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Reprendre ma lecture */}
      {lastReadSurah && (
        <motion.section variants={itemVariants} className="px-4 mb-8 relative z-10">
          <div className="flex items-center gap-2 px-2 mb-4">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Reprendre la lecture</h3>
          </div>
          <Link 
            to={`/quran/${lastReadSurah.number}`}
            className="bg-card-dark border border-white/5 rounded-[2rem] p-5 flex items-center justify-between hover:border-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-primary/10 to-transparent"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-tight mb-1">{lastReadSurah.englishName}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{lastReadSurahNameFr} • Verset {lastRead?.ayahNumber}</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors relative z-10">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </Link>
        </motion.section>
      )}

      {/* Daily Goals Section - Horizontal Scroll */}
      <motion.section variants={itemVariants} className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-4 px-6">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Objectifs du Jour</h3>
          </div>
        </div>
        
        <div className="flex overflow-x-auto px-4 gap-4 pb-4 snap-x no-scrollbar">
          <Link to="/hadith" className="snap-center shrink-0 w-[240px] bg-card-dark border border-white/5 rounded-[2rem] p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all group relative overflow-hidden min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="relative z-10 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
                <span className="material-symbols-outlined">format_quote</span>
              </div>
              <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Hadith du Jour</span>
              <h4 className="text-white font-bold text-sm mt-1.5 line-clamp-2 leading-relaxed">{dailyHadith.title}</h4>
            </div>
            <div className="flex items-center justify-between mt-auto relative z-10">
              <span className="text-[10px] text-amber-400 font-black bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">+{XP_VALUES.DAILY_HADITH} XP</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          <Link to="/duas" className="snap-center shrink-0 w-[240px] bg-card-dark border border-white/5 rounded-[2rem] p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all group relative overflow-hidden min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors"></div>
            <div className="relative z-10 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-3">
                <span className="material-symbols-outlined">volunteer_activism</span>
              </div>
              <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Invocation</span>
              <h4 className="text-white font-bold text-sm mt-1.5 line-clamp-2 leading-relaxed">{dailyDua.title}</h4>
            </div>
            <div className="flex items-center justify-between mt-auto relative z-10">
              <span className="text-[10px] text-rose-400 font-black bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-full">+{XP_VALUES.DAILY_DUA} XP</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          <Link to="/names" className="snap-center shrink-0 w-[240px] bg-card-dark border border-white/5 rounded-[2rem] p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all group relative overflow-hidden min-h-[160px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="relative z-10 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest">Nom d'Allah</span>
              <h4 className="text-white font-bold text-xl mt-1.5 font-arabic">{dailyName.arabic}</h4>
              <p className="text-slate-400 text-xs mt-1 truncate">{dailyName.transliteration}</p>
            </div>
            <div className="flex items-center justify-between mt-auto relative z-10">
              <span className="text-[10px] text-blue-400 font-black bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">Méditer</span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>
        </div>
      </motion.section>

      {/* Fasting Opportunity Widget (If not fasting today) */}
      {!isActuallyFasting && (
        <motion.section variants={itemVariants} className="px-4 mb-8 relative z-10">
          <div className="flex items-center gap-2 px-2 mb-4">
            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Prochain Jeûne</h3>
          </div>
          <div 
            className="bg-card-dark border border-white/5 rounded-[2rem] p-5 flex items-center justify-between relative overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-colors" 
            onClick={() => navigate('/calendar?tab=fasting')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <div>
                <h3 className="text-white font-black text-sm mb-0.5">{nextFastingOpp.type}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{fastingDiffText} • {nextFastingOpp.date.format('D MMM')}</p>
              </div>
            </div>
            
            {nextFastingOpp.diff === 1 ? (
              <button 
                onClick={handleIntentionClick}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-20 ${
                  isIntentionSet 
                    ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {isIntentionSet ? 'Intention' : 'Définir'}
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors relative z-10">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            )}
          </div>
        </motion.section>
      )}

    </motion.div>
  );
}

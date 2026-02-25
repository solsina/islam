import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import moment from 'moment-hijri';
import 'moment/locale/fr';
import { useQadaStore } from '../store/useQadaStore';
import { getPrayerTimes, formatTime } from '../utils/prayerTimes';
import { intervalToDuration } from 'date-fns';
import { useSettingsStore } from '../store/useSettingsStore';
import { ISLAMIC_EVENTS } from '../utils/hijriEvents';

interface DayData {
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  gregorianDay: number;
  gregorianDate: moment.Moment;
  isToday: boolean;
  isFriday: boolean;
  isMonday: boolean;
  isThursday: boolean;
  isWhiteDay: boolean;
  isAshura: boolean;
  isArafat: boolean;
  isShawwalFasting: boolean;
  isRamadan: boolean;
  isEid: boolean;
  isVoluntaryFasted: boolean;
  isQadaFasted: boolean;
  hasIntention: boolean;
  events: string[];
  merits: string[];
}

export default function Calendar() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'fasting' ? 'fasting' : 'calendar';
  
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'fasting'>(initialTab);
  const { validateOneQada, validateOneFasting, fastingDebt, fastingCompleted, voluntaryFasts, qadaFasts, intentionDate, setIntention, adjustFastingDebt, adjustFastingCompleted } = useQadaStore();
  const { location, hijriAdjustment, setHijriAdjustment } = useSettingsStore();
  const [now, setNow] = useState(new Date());
  const [showFastingTypeModal, setShowFastingTypeModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Calculate Qada Progress
  const totalQadaTarget = fastingDebt + (fastingCompleted || 0);
  const qadaProgress = totalQadaTarget > 0 ? Math.round((fastingCompleted / totalQadaTarget) * 100) : 0;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Set locale to French
  moment.locale('fr');

  // Apply Hijri adjustment to the current date for display
  const adjustedCurrentDate = currentDate.clone().add(hijriAdjustment, 'days');
  const hijriMonthName = adjustedCurrentDate.format('iMMMM');
  const hijriYear = adjustedCurrentDate.format('iYYYY');
  const gregorianMonthYear = currentDate.format('MMMM YYYY');

  // Generate days for the current Hijri month
  const daysInMonth = moment.iDaysInMonth(adjustedCurrentDate.iYear(), adjustedCurrentDate.iMonth());
  
  // Find the day of the week for the 1st of the Hijri month
  const startOfMonth = adjustedCurrentDate.clone().iDate(1).subtract(hijriAdjustment, 'days');
  const startDayOfWeek = startOfMonth.day(); // 0 = Sunday, 1 = Monday, etc.

  const days = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - startDayOfWeek + 1;
      if (dayNum > 0 && dayNum <= daysInMonth) {
        // We need the gregorian date for this Hijri day
        const date = adjustedCurrentDate.clone().iDate(dayNum).subtract(hijriAdjustment, 'days');
        const adjustedDate = date.clone().add(hijriAdjustment, 'days');
        
        const hMonth = adjustedDate.iMonth(); // 0-indexed (0 = Muharram)
        const hDay = adjustedDate.iDate();
        const dayOfWeek = date.day();
        const dateStr = date.format('YYYY-MM-DD');

        const isWhiteDay = hDay === 13 || hDay === 14 || hDay === 15;
        const isAshura = hMonth === 0 && (hDay === 9 || hDay === 10);
        const isArafat = hMonth === 11 && hDay === 9;
        const isShawwalFasting = hMonth === 9 && hDay >= 2 && hDay <= 7;
        const isRamadan = hMonth === 8;
        
        const isVoluntaryFasted = voluntaryFasts.includes(dateStr);
        const isQadaFasted = qadaFasts?.includes(dateStr);
        const hasIntention = intentionDate === dateStr;

        const events: string[] = [];
        const merits: string[] = [];

        // Check for events from our reliable list
        const dayEvents = ISLAMIC_EVENTS.filter(e => e.hMonth === hMonth && e.hDay === hDay);
        dayEvents.forEach(e => events.push(e.title));

        if (dayOfWeek === 1) merits.push("Les actions sont présentées à Allah le Lundi.");
        if (dayOfWeek === 4) merits.push("Les actions sont présentées à Allah le Jeudi.");
        if (dayOfWeek === 5) merits.push("Jour de Joumoua, multiplier les prières sur le Prophète (ﷺ).");
        if (isWhiteDay) merits.push("Jour Blanc : Il est très recommandé de jeûner.");
        if (isAshura) merits.push("Le jeûne d'Achoura expie les péchés de l'année passée.");
        if (isArafat) merits.push("Le jeûne d'Arafat expie les péchés de l'année passée et future.");

        return {
          hijriDay: hDay,
          hijriMonth: hMonth,
          hijriYear: adjustedDate.iYear(),
          gregorianDay: date.date(),
          gregorianDate: date,
          isToday: date.isSame(moment(), 'day'),
          isFriday: dayOfWeek === 5,
          isMonday: dayOfWeek === 1,
          isThursday: dayOfWeek === 4,
          isWhiteDay,
          isAshura,
          isArafat,
          isShawwalFasting,
          isRamadan,
          isEid: dayEvents.some(e => e.id.includes('eid')),
          isVoluntaryFasted,
          isQadaFasted,
          hasIntention,
          events,
          merits,
        };
      }
      return null;
    });
  }, [currentDate, startDayOfWeek, daysInMonth, voluntaryFasts, hijriAdjustment]);

  // Calculate upcoming events dynamically
  const upcomingEvents = useMemo(() => {
    const eventsList = [];
    const today = moment();
    
    ISLAMIC_EVENTS.forEach(event => {
      // Calculate gregorian date for this event in current and next hijri year
      const currentHYear = adjustedCurrentDate.iYear();
      
      [currentHYear, currentHYear + 1].forEach(hYear => {
        const eventDate = moment(`${hYear}/${event.hMonth + 1}/${event.hDay}`, 'iYYYY/iM/iD').subtract(hijriAdjustment, 'days');
        const diffDays = eventDate.diff(today, 'days');
        
        if (diffDays >= 0 && diffDays <= 365) {
          eventsList.push({
            date: eventDate,
            title: event.title,
            desc: event.desc,
            diffDays,
            shortMonth: event.shortMonth,
            hDay: event.hDay
          });
        }
      });
    });

    return eventsList.sort((a, b) => a.diffDays - b.diffDays).slice(0, 3);
  }, [hijriAdjustment, adjustedCurrentDate]);

  const nextMonth = () => setCurrentDate(currentDate.clone().add(1, 'iMonth'));
  const prevMonth = () => setCurrentDate(currentDate.clone().subtract(1, 'iMonth'));

  const handleDayClick = (day: DayData | null) => {
    if (day) setSelectedDay(day);
  };

  const handleFastingAction = (type: 'qada' | 'voluntary') => {
    const dateStr = selectedDay ? selectedDay.gregorianDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    if (type === 'qada') {
      validateOneFasting(false, dateStr);
      alert("Jeûne de rattrapage enregistré !");
    } else {
      validateOneFasting(true, dateStr);
      alert("Jeûne surérogatoire enregistré ! Qu'Allah l'accepte.");
    }
    setShowFastingTypeModal(false);
    setSelectedDay(null);
  };

  const handlePrayerAction = () => {
    validateOneQada();
    alert("Prière rattrapée enregistrée !");
    setSelectedDay(null);
  };

  const toggleIntention = () => {
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    if (intentionDate === tomorrow) {
      setIntention('');
    } else {
      setIntention(tomorrow);
    }
  };

  // Fasting logic
  const todayPrayerTimes = getPrayerTimes(now);
  const iftarTime = todayPrayerTimes.maghrib;
  const imsakTime = todayPrayerTimes.fajr;

  let targetTime = iftarTime;
  let isAfterIftar = now > iftarTime;
  
  if (isAfterIftar) {
    const tomorrow = new Date(now.getTime() + 86400000);
    targetTime = getPrayerTimes(tomorrow).maghrib;
  }

  const duration = intervalToDuration({ start: now, end: targetTime });
  const hours = String(duration.hours || 0).padStart(2, '0');
  const minutes = String(duration.minutes || 0).padStart(2, '0');
  const seconds = String(duration.seconds || 0).padStart(2, '0');

  const weekSchedule = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(now.getTime() + i * 86400000);
    const times = getPrayerTimes(date);
    
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayNum = date.getDate();
    
    return {
      day: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum}${i === 0 ? ' (Auj.)' : ''}`,
      imsak: formatTime(times.fajr),
      iftar: formatTime(times.maghrib),
      isToday: i === 0
    };
  });

  const isIntentionSet = intentionDate === moment().add(1, 'days').format('YYYY-MM-DD');

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-transparent relative">
      <Header />

      <main className="px-4 pt-4">
        {/* Intention Card - Always Visible */}
        <div className="mb-6">
          <div className={`bg-card-dark border ${isIntentionSet ? 'border-primary/50 bg-primary/5' : 'border-white/5'} rounded-2xl p-5 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIntentionSet ? 'bg-primary text-black' : 'bg-white/5 text-slate-400'}`}>
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Intention (Niyyah)</h3>
                  <p className="text-xs text-slate-400">Pour le jeûne de demain</p>
                </div>
              </div>
              <button 
                onClick={toggleIntention}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  isIntentionSet 
                    ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {isIntentionSet ? 'Définie' : 'Définir'}
              </button>
            </div>
            {isIntentionSet && (
              <p className="text-sm text-slate-300 italic border-l-2 border-primary pl-3 py-1">
                "J'ai l'intention de jeûner demain pour Allah."
              </p>
            )}
          </div>
        </div>

        {/* Unified Calendar View */}
        <div className="flex items-center justify-between py-4">
          <button onClick={prevMonth} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="text-center cursor-pointer" onClick={() => setCurrentDate(moment())}>
            <h2 className="text-xl font-extrabold text-white capitalize">{hijriMonthName} {hijriYear}</h2>
            <p className="text-slate-400 text-sm font-medium capitalize flex items-center justify-center gap-1">
              {gregorianMonthYear}
              {!currentDate.isSame(moment(), 'month') && (
                <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded-full ml-1">Retour</span>
              )}
            </p>
          </div>
          <button onClick={nextMonth} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <div className="mb-6 bg-card-dark/40 rounded-xl p-2 border border-white/5">
          <div className="grid grid-cols-7 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-[10px] font-bold text-primary/60 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const isRecommendedFasting = day && !day.isEid && (day.isWhiteDay || day.isMonday || day.isThursday || day.isAshura || day.isArafat || day.isShawwalFasting);
              
              return (
                <div 
                  key={i} 
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-colors relative ${
                    day 
                      ? (day.isToday 
                          ? 'border-2 border-primary emerald-glow bg-primary/10 cursor-pointer' 
                          : 'hover:bg-white/5 cursor-pointer bg-white/[0.02]') 
                      : 'opacity-0'
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-xs ${day.isToday ? 'text-primary font-bold' : 'text-slate-500'}`}>{day.gregorianDay}</span>
                      <span className={`text-base font-semibold ${day.isToday ? 'text-white' : day.isFriday ? 'text-primary' : 'text-slate-200'}`}>
                        {day.hijriDay}
                      </span>
                      
                      {/* Indicators */}
                      <div className="absolute bottom-1 flex gap-1">
                        {day.isToday && <div className="w-1 h-1 bg-primary rounded-full"></div>}
                        {isRecommendedFasting && !day.isToday && <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>}
                        {day.isVoluntaryFasted && <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,183,72,0.8)]"></div>}
                        {day.isQadaFasted && <div className="w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>}
                        {day.hasIntention && <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>}
                      </div>
                      
                      {day.isFriday && !day.isToday && !isRecommendedFasting && <span className="text-[8px] uppercase font-bold text-primary absolute bottom-1">Joumoua</span>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-8 px-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-primary rounded-full"></div> Aujourd'hui
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div> Jeûne recommandé
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,183,72,0.8)]"></div> Jeûné (Sunnah)
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div> Jeûné (Qada)
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div> Intention
          </div>
        </div>

        {/* Fasting Stats & Countdown */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Fasting Debt Card with Progress */}
          <div className="bg-card-dark border border-white/5 rounded-xl p-4 relative overflow-hidden group col-span-2">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Suivi Rattrapage (Qada)</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowAdjustModal(true)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">settings</span>
                  </button>
                  <div className="bg-orange-500/20 px-2 py-0.5 rounded-full">
                    <span className="text-orange-400 text-[10px] font-bold">{qadaProgress}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end gap-3 mb-3">
                <div className="flex-1">
                  <span className="text-3xl font-extrabold text-white">{fastingDebt}</span>
                  <span className="text-xs text-slate-500 ml-1">jours restants</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-300">{fastingCompleted || 0}</span>
                  <span className="text-[10px] text-slate-500 ml-1 block">rattrapés</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${qadaProgress}%` }}
                ></div>
              </div>
              
              <p className="text-[10px] text-slate-500 mt-2 text-right">
                Total à faire : {totalQadaTarget} jours
              </p>
            </div>
          </div>

          {/* Voluntary Fasting Card */}
          <div className="bg-card-dark border border-white/5 rounded-xl p-4 relative overflow-hidden group col-span-2">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Surérogatoire (Sunnah)</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-extrabold text-white">{voluntaryFasts.length}</span>
                  <span className="text-[10px] text-slate-500 mb-1">jours jeûnés</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500">volunteer_activism</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card-dark border border-white/5 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Prochain Iftar</p>
                <h3 className="text-white font-bold text-lg">{formatTime(iftarTime)}</h3>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Temps Restant</p>
                <div className="flex gap-1 font-mono text-lg text-white">
                  <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
                </div>
              </div>
            </div>
            
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[70%]"></div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-white">Horaires de la semaine</h3>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {weekSchedule.map((day, i) => (
              <div 
                key={i} 
                className={`flex-shrink-0 w-28 snap-center rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                  day.isToday 
                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-card-dark border-white/5 text-slate-400'
                }`}
              >
                <p className={`text-xs font-bold uppercase tracking-wider ${day.isToday ? 'text-black/70' : 'text-slate-500'}`}>
                  {day.day.split(' ')[0]}
                </p>
                <p className={`text-xl font-extrabold ${day.isToday ? 'text-black' : 'text-white'}`}>
                  {day.day.split(' ')[1]}
                </p>
                
                <div className="w-full h-px bg-current opacity-10 my-1"></div>
                
                <div className="w-full flex justify-between text-[10px] font-medium uppercase tracking-wider opacity-80">
                  <span>Imsak</span>
                  <span>{day.imsak}</span>
                </div>
                <div className="w-full flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>Iftar</span>
                  <span>{day.iftar}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Événements à venir</h3>
          </div>
          
          {upcomingEvents.map((event, idx) => (
            <div key={idx} className="bg-card-dark border border-white/5 rounded-xl p-4 flex gap-4 items-center hover:border-primary/30 transition-colors cursor-pointer">
              <div className="w-14 h-14 bg-primary/20 rounded-lg flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary uppercase">{event.shortMonth}</span>
                <span className="text-xl font-bold text-primary">{event.hDay}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-100">{event.title}</h4>
                <p className="text-sm text-slate-400">{event.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500">
                  {event.diffDays === 0 ? "Aujourd'hui" : event.diffDays === 1 ? "Demain" : `Dans ${event.diffDays} jours`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Sheet for Day Details */}
      {selectedDay && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSelectedDay(null)}
          ></div>
          <div className="fixed bottom-0 left-0 right-0 bg-card-dark border-t border-white/10 rounded-t-3xl p-6 z-50 transform transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-1">
                {selectedDay.hijriDay} {moment.iMonths()[selectedDay.hijriMonth]} {selectedDay.hijriYear}
              </h3>
              <p className="text-slate-400 capitalize">
                {selectedDay.gregorianDate.format('dddd D MMMM YYYY')}
              </p>
            </div>

            {selectedDay.events.length > 0 && (
              <div className="mb-6 space-y-2">
                {selectedDay.events.map((ev, i) => (
                  <div key={i} className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3 text-primary">
                    <span className="material-symbols-outlined">event_star</span>
                    <span className="font-bold">{ev}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedDay.merits.length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Mérites du jour</h4>
                {selectedDay.merits.map((merit, i) => (
                  <div key={i} className="flex items-start gap-3 text-slate-300 bg-white/5 p-3 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">auto_awesome</span>
                    <p className="text-sm leading-relaxed">{merit}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 mt-8">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Actions Rapides</h4>
              <button 
                onClick={() => setShowFastingTypeModal(true)}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-primary">check_circle</span>
                J'ai jeûné ce jour
              </button>
              <button 
                onClick={handlePrayerAction}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-primary">check_circle</span>
                J'ai rattrapé une prière (Qada)
              </button>
            </div>
          </div>
        </>
      )}

      {/* Fasting Type Modal */}
      {showFastingTypeModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setShowFastingTypeModal(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-card-dark border border-white/10 rounded-3xl p-6 z-[70] shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Type de jeûne</h3>
            <p className="text-slate-400 text-sm text-center mb-6">Quel type de jeûne avez-vous effectué ?</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleFastingAction('voluntary')}
                className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-4 px-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                  <span className="material-symbols-outlined">volunteer_activism</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold group-hover:text-emerald-400 transition-colors">Surérogatoire (Sunnah)</p>
                  <p className="text-[10px] text-slate-400">Lundi, Jeudi, Jours Blancs...</p>
                </div>
              </button>

              <button 
                onClick={() => handleFastingAction('qada')}
                className="w-full py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center gap-4 px-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-black">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-bold group-hover:text-orange-400 transition-colors">Rattrapage (Qada)</p>
                  <p className="text-[10px] text-slate-400">Dette de Ramadan précédent</p>
                </div>
              </button>
            </div>
            
            <button 
              onClick={() => setShowFastingTypeModal(false)}
              className="mt-6 w-full py-3 text-slate-400 font-medium text-sm hover:text-white transition-colors"
            >
              Annuler
            </button>
          </div>
        </>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setShowAdjustModal(false)}
          ></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-card-dark border border-white/10 rounded-3xl p-6 z-[70] shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Ajuster ma progression</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Jours restants à rattraper</p>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                  <button onClick={() => adjustFastingDebt(-1)} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10">-</button>
                  <span className="text-2xl font-bold text-white">{fastingDebt}</span>
                  <button onClick={() => adjustFastingDebt(1)} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10">+</button>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Jours déjà rattrapés</p>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                  <button onClick={() => adjustFastingCompleted(-1)} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10">-</button>
                  <span className="text-2xl font-bold text-white">{fastingCompleted || 0}</span>
                  <button onClick={() => adjustFastingCompleted(1)} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10">+</button>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Ajustement Calendrier Hijri</p>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                  <button onClick={() => setHijriAdjustment(hijriAdjustment - 1)} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10">-</button>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-white">{hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment}</span>
                    <span className="text-[10px] text-slate-500 block">jours</span>
                  </div>
                  <button onClick={() => setHijriAdjustment(hijriAdjustment + 1)} className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10">+</button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center italic">Utilisez ceci si la date Hijri ne correspond pas à votre région.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAdjustModal(false)}
              className="mt-8 w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              Terminer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

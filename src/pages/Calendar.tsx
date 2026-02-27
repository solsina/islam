import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import moment from 'moment-hijri';
import 'moment/locale/fr';
import { useQadaStore } from '../store/useQadaStore';
import { getPrayerTimes, formatTime } from '../utils/prayerTimes';
import { intervalToDuration } from 'date-fns';
import { useSettingsStore } from '../store/useSettingsStore';
import { getHolidaysForGregorianYear } from '../utils/islamicEvents';
import { useCalendarStore, CalendarEvent } from '../store/useCalendarStore';
import { motion, AnimatePresence } from 'motion/react';

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
  userEvents: CalendarEvent[];
  merits: string[];
}

const ISLAMIC_MONTHS_FR = [
  "Mouharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Joumada al-Awwal",
  "Joumada al-Thani",
  "Rajab",
  "Cha'ban",
  "Ramadan",
  "Chawwal",
  "Dhou al-Qi'dah",
  "Dhou al-Hijjah"
];

export default function Calendar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'fasting' ? 'fasting' : 'calendar';
  
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'fasting'>(initialTab);
  const { validateOneQada, validateOneFasting, fastingDebt, fastingCompleted, voluntaryFasts, qadaFasts, intentionDate, setIntention, adjustFastingDebt, adjustFastingCompleted } = useQadaStore();
  const { location, hijriAdjustment, setHijriAdjustment } = useSettingsStore();
  const { events: allUserEvents, addEvent, removeEvent, getEventsForDate } = useCalendarStore();
  
  const [now, setNow] = useState(new Date());
  const [showFastingTypeModal, setShowFastingTypeModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  
  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventType, setNewEventType] = useState<'personal' | 'fasting' | 'reminder' | 'quran'>('personal');

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
    const currentGregorianYear = currentDate.year();
    const holidays = getHolidaysForGregorianYear(currentGregorianYear, hijriAdjustment);
    
    return Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - startDayOfWeek + 1;
      if (dayNum > 0 && dayNum <= daysInMonth) {
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

        // Check for holidays
        const dayHolidays = holidays.filter(h => h.gregorianDate === dateStr);
        dayHolidays.forEach(h => events.push(h.name));

        const userEvents = getEventsForDate(dateStr);

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
          isEid: dayHolidays.some(h => h.type === 'holiday'),
          isVoluntaryFasted,
          isQadaFasted,
          hasIntention,
          events,
          userEvents,
          merits,
        };
      }
      return null;
    });
  }, [currentDate, startDayOfWeek, daysInMonth, voluntaryFasts, hijriAdjustment, allUserEvents]);

  // Calculate upcoming events dynamically
  const upcomingEvents = useMemo(() => {
    const eventsList = [];
    const today = moment();
    const currentGregorianYear = today.year();
    
    // Get holidays for this year and next year
    const holidays = [
      ...getHolidaysForGregorianYear(currentGregorianYear, hijriAdjustment),
      ...getHolidaysForGregorianYear(currentGregorianYear + 1, hijriAdjustment)
    ];
    
    holidays.forEach(holiday => {
      const eventDate = moment(holiday.gregorianDate, 'YYYY-MM-DD');
      const diffDays = eventDate.diff(today, 'days');
      
      if (diffDays >= 0 && diffDays <= 365) {
        const hMonthIndex = moment(holiday.gregorianDate).add(hijriAdjustment, 'days').iMonth();
        const monthName = ISLAMIC_MONTHS_FR[hMonthIndex];
        eventsList.push({
          date: eventDate,
          title: holiday.name,
          desc: holiday.description,
          diffDays,
          shortMonth: monthName ? monthName.substring(0, 4) : '',
          hDay: moment(holiday.gregorianDate).add(hijriAdjustment, 'days').iDate()
        });
      }
    });

    return eventsList.sort((a, b) => a.diffDays - b.diffDays).slice(0, 3);
  }, [hijriAdjustment, currentDate]);

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
    
    // Update selected day to reflect changes immediately
    if (selectedDay) {
      setSelectedDay({
        ...selectedDay,
        isQadaFasted: type === 'qada' ? true : selectedDay.isQadaFasted,
        isVoluntaryFasted: type === 'voluntary' ? true : selectedDay.isVoluntaryFasted
      });
    }
  };

  const handlePrayerAction = () => {
    validateOneQada();
    alert("Prière rattrapée enregistrée !");
  };

  const toggleIntention = () => {
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
    if (intentionDate === tomorrow) {
      setIntention('');
    } else {
      setIntention(tomorrow);
    }
  };

  const handleAddEvent = () => {
    if (!selectedDay || !newEventTitle) return;
    
    addEvent({
      date: selectedDay.gregorianDate.format('YYYY-MM-DD'),
      title: newEventTitle,
      time: newEventTime || undefined,
      type: newEventType
    });
    
    setNewEventTitle('');
    setNewEventTime('');
    setShowAddEventModal(false);
    
    // Update selected day to reflect changes immediately
    setSelectedDay({
      ...selectedDay,
      userEvents: getEventsForDate(selectedDay.gregorianDate.format('YYYY-MM-DD'))
    });
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#050505] relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <Header leftIcon="arrow_back" onLeftClick={() => navigate('/learn')} title="Calendrier & Jeûne" rightIcon="tune" onRightClick={() => setShowAdjustModal(true)} />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-4 relative z-10"
      >
        {/* Intention Card - Always Visible */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className={`bg-card-dark border ${isIntentionSet ? 'border-primary/50 bg-primary/5' : 'border-white/5'} rounded-3xl p-5 transition-all backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isIntentionSet ? 'bg-primary text-black' : 'bg-white/5 text-slate-400'}`}>
                  <span className="material-symbols-outlined text-2xl">psychology</span>
                </div>
                <div>
                  <h3 className="text-white font-black text-sm uppercase tracking-wide">Intention (Niyyah)</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Pour le jeûne de demain</p>
                </div>
              </div>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={toggleIntention}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isIntentionSet 
                    ? 'bg-primary text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                }`}
              >
                {isIntentionSet ? 'Définie' : 'Définir'}
              </motion.button>
            </div>
            <AnimatePresence>
              {isIntentionSet && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-slate-300 italic border-l-2 border-primary pl-3 py-1"
                >
                  "J'ai l'intention de jeûner demain pour Allah."
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Unified Calendar View */}
        <motion.div variants={itemVariants} className="flex items-center justify-between py-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </motion.button>
          <div className="text-center cursor-pointer" onClick={() => setCurrentDate(moment())}>
            <h2 className="text-xl font-black text-white capitalize tracking-tight">{hijriMonthName} {hijriYear}</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mt-1">
              {gregorianMonthYear}
              {!currentDate.isSame(moment(), 'month') && (
                <span className="bg-primary/20 text-primary text-[8px] px-2 py-0.5 rounded-full">Retour</span>
              )}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6 bg-card-dark/40 rounded-3xl p-3 border border-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-7 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-[9px] font-black text-primary/60 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const isRecommendedFasting = day && !day.isEid && (day.isWhiteDay || day.isMonday || day.isThursday || day.isAshura || day.isArafat || day.isShawwalFasting);
              
              return (
                <motion.div 
                  key={i} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative ${
                    day 
                      ? (day.isToday 
                          ? 'border border-primary bg-primary/10 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                          : 'hover:bg-white/5 cursor-pointer bg-white/[0.02] border border-transparent') 
                      : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-[9px] font-bold ${day.isToday ? 'text-primary' : 'text-slate-500'}`}>{day.gregorianDay}</span>
                      <span className={`text-sm font-black ${day.isToday ? 'text-white' : day.isFriday ? 'text-primary' : 'text-slate-200'}`}>
                        {day.hijriDay}
                      </span>
                      
                      {/* Indicators */}
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        {day.isToday && <div className="w-1 h-1 bg-primary rounded-full"></div>}
                        {isRecommendedFasting && !day.isToday && <div className="w-1 h-1 bg-white/50 rounded-full"></div>}
                        {day.isVoluntaryFasted && <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,183,72,0.8)]"></div>}
                        {day.isQadaFasted && <div className="w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]"></div>}
                        {day.hasIntention && <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>}
                        {day.userEvents.length > 0 && <div className="w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.8)]"></div>}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8 px-2 justify-center">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Auj.
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div> Recommandé
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Sunnah
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Qada
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> Événement
          </div>
        </motion.div>

        {/* Fasting Stats & Countdown */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-4">
          {/* Fasting Debt Card with Progress */}
          <div className="bg-card-dark border border-white/5 rounded-[2rem] p-5 relative overflow-hidden group col-span-2">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl transition-all group-hover:bg-orange-500/20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Suivi Rattrapage (Qada)</p>
                <div className="flex items-center gap-2">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAdjustModal(true)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">settings</span>
                  </motion.button>
                  <div className="bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/20">
                    <span className="text-orange-400 text-[10px] font-black">{qadaProgress}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end gap-3 mb-4">
                <div className="flex-1">
                  <span className="text-4xl font-black text-white tracking-tighter">{fastingDebt}</span>
                  <span className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">jours restants</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-300">{fastingCompleted || 0}</span>
                  <span className="text-[9px] font-bold text-slate-500 ml-1 block uppercase tracking-wider">rattrapés</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${qadaProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                ></motion.div>
              </div>
              
              <p className="text-[9px] font-bold text-slate-500 mt-2 text-right uppercase tracking-wider">
                Total à faire : {totalQadaTarget} jours
              </p>
            </div>
          </div>

          {/* Voluntary Fasting Card */}
          <div className="bg-card-dark border border-white/5 rounded-[2rem] p-5 relative overflow-hidden group col-span-2">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl transition-all group-hover:bg-emerald-500/20"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Surérogatoire (Sunnah)</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-white tracking-tighter">{voluntaryFasts.length}</span>
                  <span className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">jours jeûnés</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <span className="material-symbols-outlined text-emerald-500">volunteer_activism</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card-dark border border-white/5 rounded-[2rem] p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">Prochain Iftar</p>
                <h3 className="text-white font-black text-2xl tracking-tight">{formatTime(iftarTime)}</h3>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Temps Restant</p>
                <div className="flex gap-1 font-mono text-xl font-bold text-white">
                  <span>{hours}</span><span className="text-slate-600">:</span><span>{minutes}</span><span className="text-slate-600">:</span><span>{seconds}</span>
                </div>
              </div>
            </div>
            
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[70%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4 mb-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Horaires de la semaine</h3>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
            {weekSchedule.map((day, i) => (
              <div 
                key={i} 
                className={`flex-shrink-0 w-28 snap-center rounded-2xl border p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                  day.isToday 
                    ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' 
                    : 'bg-card-dark border-white/5 text-slate-400'
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest ${day.isToday ? 'text-black/70' : 'text-slate-500'}`}>
                  {day.day.split(' ')[0]}
                </p>
                <p className={`text-2xl font-black ${day.isToday ? 'text-black' : 'text-white'}`}>
                  {day.day.split(' ')[1]}
                </p>
                
                <div className="w-full h-px bg-current opacity-10 my-1"></div>
                
                <div className="w-full flex justify-between text-[9px] font-bold uppercase tracking-wider opacity-80">
                  <span>Imsak</span>
                  <span>{day.imsak}</span>
                </div>
                <div className="w-full flex justify-between text-[9px] font-black uppercase tracking-wider">
                  <span>Iftar</span>
                  <span>{day.iftar}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4 mb-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Événements à venir</h3>
          </div>
          
          {upcomingEvents.map((event, idx) => (
            <div key={idx} className="bg-card-dark border border-white/5 rounded-2xl p-4 flex gap-4 items-center hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex flex-col items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <span className="text-[9px] font-black text-primary uppercase tracking-wider">{event.shortMonth}</span>
                <span className="text-xl font-black text-white">{event.hDay}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-100">{event.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{event.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-full uppercase tracking-wider">
                  {event.diffDays === 0 ? "Aujourd'hui" : event.diffDays === 1 ? "Demain" : `J-${event.diffDays}`}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.main>

      {/* Bottom Sheet for Day Details */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setSelectedDay(null)}
            ></motion.div>
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-card-dark border-t border-white/10 rounded-t-[2rem] p-6 z-50 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8"></div>
              
              <div className="text-center mb-8">
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">
                  {selectedDay.hijriDay} {ISLAMIC_MONTHS_FR[selectedDay.hijriMonth]} {selectedDay.hijriYear}
                </h3>
                <p className="text-slate-400 font-medium capitalize">
                  {selectedDay.gregorianDate.format('dddd D MMMM YYYY')}
                </p>
              </div>

              {selectedDay.events.length > 0 && (
                <div className="mb-6 space-y-2">
                  {selectedDay.events.map((ev, i) => (
                    <div key={i} className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3 text-primary">
                      <span className="material-symbols-outlined">event_star</span>
                      <span className="font-bold">{ev}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedDay.userEvents.length > 0 && (
                <div className="mb-6 space-y-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mes Événements</h4>
                  {selectedDay.userEvents.map((ev, i) => (
                    <div key={i} className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between text-purple-400">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">
                          {ev.type === 'quran' ? 'menu_book' : ev.type === 'fasting' ? 'event_available' : 'event_note'}
                        </span>
                        <span className="font-bold">{ev.title}</span>
                      </div>
                      {ev.time && <span className="text-xs font-mono font-bold bg-purple-500/20 px-2 py-1 rounded-md">{ev.time}</span>}
                    </div>
                  ))}
                </div>
              )}

              {selectedDay.merits.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mérites du jour</h4>
                  {selectedDay.merits.map((merit, i) => (
                    <div key={i} className="flex items-start gap-3 text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">auto_awesome</span>
                      <p className="text-sm leading-relaxed font-medium">{merit}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 mt-8">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Actions Rapides</h4>
                
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddEventModal(true)}
                  className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl font-bold text-purple-400 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-purple-400">add_circle</span>
                  Ajouter un événement
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFastingTypeModal(true)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  J'ai jeûné ce jour
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrayerAction}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-primary">history</span>
                  J'ai rattrapé une prière (Qada)
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEventModal && selectedDay && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
              onClick={() => setShowAddEventModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-card-dark border border-white/10 rounded-[2rem] p-6 z-[70] shadow-2xl"
            >
              <h3 className="text-xl font-black text-white mb-6 text-center uppercase tracking-tight">Nouvel Événement</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Titre de l'événement</label>
                  <input 
                    type="text" 
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Ex: Lire Sourate Al-Kahf"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Heure (Optionnel)</label>
                  <input 
                    type="time" 
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setNewEventType('personal')}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-colors ${newEventType === 'personal' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">event_note</span> Personnel
                    </button>
                    <button 
                      onClick={() => setNewEventType('quran')}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-colors ${newEventType === 'quran' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">menu_book</span> Coran
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors bg-white/5 rounded-xl"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddEvent}
                  disabled={!newEventTitle}
                  className="flex-1 py-3 bg-primary text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fasting Type Modal */}
      <AnimatePresence>
        {showFastingTypeModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
              onClick={() => setShowFastingTypeModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-card-dark border border-white/10 rounded-[2rem] p-6 z-[70] shadow-2xl"
            >
              <h3 className="text-xl font-black text-white mb-4 text-center uppercase tracking-tight">Type de jeûne</h3>
              <p className="text-slate-400 text-sm text-center mb-6 font-medium">Quel type de jeûne avez-vous effectué ?</p>
              
              <div className="space-y-3">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFastingAction('voluntary')}
                  className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center gap-4 px-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,183,72,0.4)]">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold group-hover:text-emerald-400 transition-colors">Surérogatoire (Sunnah)</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Lundi, Jeudi, Jours Blancs...</p>
                  </div>
                </motion.button>

                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFastingAction('qada')}
                  className="w-full py-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-2xl flex items-center gap-4 px-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    <span className="material-symbols-outlined">history</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold group-hover:text-orange-400 transition-colors">Rattrapage (Qada)</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Dette de Ramadan précédent</p>
                  </div>
                </motion.button>
              </div>
              
              <button 
                onClick={() => setShowFastingTypeModal(false)}
                className="mt-6 w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
              >
                Annuler
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Adjust Modal */}
      <AnimatePresence>
        {showAdjustModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
              onClick={() => setShowAdjustModal(false)}
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-card-dark border border-white/10 rounded-[2rem] p-6 z-[70] shadow-2xl"
            >
              <h3 className="text-xl font-black text-white mb-6 text-center uppercase tracking-tight">Ajuster ma progression</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Jours restants à rattraper</p>
                  <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2 border border-white/10">
                    <button onClick={() => adjustFastingDebt(-1)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="text-2xl font-black text-white">{fastingDebt}</span>
                    <button onClick={() => adjustFastingDebt(1)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Jours déjà rattrapés</p>
                  <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2 border border-white/10">
                    <button onClick={() => adjustFastingCompleted(-1)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="text-2xl font-black text-white">{fastingCompleted || 0}</span>
                    <button onClick={() => adjustFastingCompleted(1)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Ajustement Calendrier Hijri</p>
                  <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2 border border-white/10">
                    <button onClick={() => setHijriAdjustment(hijriAdjustment - 1)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="text-center">
                      <span className="text-2xl font-black text-white">{hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment}</span>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">jours</span>
                    </div>
                    <button onClick={() => setHijriAdjustment(hijriAdjustment + 1)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 text-center font-medium">Utilisez ceci si la date Hijri ne correspond pas à votre région.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowAdjustModal(false)}
                className="mt-8 w-full py-4 bg-primary text-black font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:bg-primary/90 transition-all"
              >
                Terminer
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

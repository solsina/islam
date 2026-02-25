import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useQadaStore, PrayerType } from '../store/useQadaStore';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Qada() {
  const { t } = useTranslation();
  const { 
    initialQadaSet,
    totalDebt,
    dailyPrayers,
    lifetimePrayerScore,
    setInitialQada, 
    markDailyPrayer,
    validateDoubleShot,
    validateOneQada,
    getEstimatedCompletionDate
  } = useQadaStore();

  const [showInitialSetup, setShowInitialSetup] = useState(!initialQadaSet);
  
  // Questionnaire State
  const [currentAge, setCurrentAge] = useState(20);
  const [pubertyAge, setPubertyAge] = useState(13);
  const [regularity, setRegularity] = useState(50);
  const [safetyMargin, setSafetyMargin] = useState(false);
  const [isFemale, setIsFemale] = useState(false);

  // Dashboard State
  const [dailyRate, setDailyRate] = useState(1); // Estimated daily catch-up rate

  useEffect(() => {
    if (!initialQadaSet) {
      setShowInitialSetup(true);
    }
  }, [initialQadaSet]);

  const prayers: { id: PrayerType; name: string; icon: string }[] = [
    { id: 'fajr', name: t('fajr'), icon: 'wb_twilight' },
    { id: 'dhuhr', name: t('dhuhr'), icon: 'wb_sunny' },
    { id: 'asr', name: t('asr'), icon: 'wb_sunny' },
    { id: 'maghrib', name: t('maghrib'), icon: 'nights_stay' },
    { id: 'isha', name: t('isha'), icon: 'bedtime' },
  ];

  const handleSetInitialQada = () => {
    setInitialQada({
      currentAge,
      pubertyAge,
      regularity,
      safetyMargin,
      isFemale
    });
    setShowInitialSetup(false);
  };

  const estimatedDate = getEstimatedCompletionDate(dailyRate);
  const isDailyFull = Object.values(dailyPrayers).every(Boolean);

  if (showInitialSetup) {
    return (
      <div className="flex-1 overflow-y-auto pb-24 bg-transparent flex flex-col items-center justify-center p-4 min-h-screen z-50 fixed inset-0">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-0"></div>
        
        <div className="relative z-10 w-full max-w-md bg-card-dark border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 emerald-glow">
              <span className="material-symbols-outlined text-primary text-2xl">calculate</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Précision Chirurgicale</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">Calculons ensemble ton parcours de rattrapage (Prières & Jeûne).</p>

          <div className="space-y-6">
            {/* Age Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Âge Actuel</label>
                <input 
                  type="number" 
                  value={currentAge} 
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold text-center focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Âge Puberté</label>
                <input 
                  type="number" 
                  value={pubertyAge} 
                  onChange={(e) => setPubertyAge(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold text-center focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Regularity Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Régularité Passée</label>
                <span className="text-primary font-bold">{regularity}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={regularity} 
                onChange={(e) => setRegularity(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-xs text-slate-500 italic">0% = Jamais pratiqué, 100% = Toujours pratiqué</p>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer border border-white/5 hover:border-white/10 transition-colors">
                <span className="text-sm text-slate-300">Exemption Menstruations (-7j/mois)</span>
                <input 
                  type="checkbox" 
                  checked={isFemale} 
                  onChange={(e) => setIsFemale(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer border border-white/5 hover:border-white/10 transition-colors">
                <span className="text-sm text-slate-300">Marge de Sécurité (+10%)</span>
                <input 
                  type="checkbox" 
                  checked={safetyMargin} 
                  onChange={(e) => setSafetyMargin(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded"
                />
              </label>
            </div>
          </div>

          <button 
            onClick={handleSetInitialQada}
            className="w-full mt-8 py-4 rounded-xl bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            Calculer ma Dette
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
      <Header />

      <div className="px-4 pt-2 pb-6 space-y-8">
        
        {/* Section Aujourd'hui */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Aujourd'hui</h3>
            {isDailyFull && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full animate-pulse">
                Journée Complète !
              </span>
            )}
          </div>
          
          <div className={`grid grid-cols-5 gap-2 ${isDailyFull ? 'emerald-glow border-primary/30' : 'border-white/5'} bg-card-dark border rounded-2xl p-4 transition-all duration-500`}>
            {prayers.map((prayer) => (
              <button
                key={prayer.id}
                onClick={() => markDailyPrayer(prayer.id)}
                className={`aspect-square rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  dailyPrayers[prayer.id]
                    ? 'bg-primary text-black shadow-[0_0_15px_rgba(16,183,72,0.4)] scale-105'
                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{prayer.icon}</span>
                <span className="text-[9px] font-bold uppercase">{prayer.name.substring(0, 3)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section Dette (Qada Vault) */}
        <section>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 px-1">Coffre-Fort Qada</h3>
          
          <div className="bg-card-dark border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center mb-8">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Dette Restante</p>
              <h2 className="text-5xl font-bold text-white tracking-tight">
                {totalDebt.toLocaleString()}
              </h2>
              <p className="text-primary text-sm font-medium mt-2">Prières à rattraper</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={validateOneQada}
                className="bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">check</span>
                </div>
                <span className="text-sm font-bold text-white">Rattrapage Rapide</span>
                <span className="text-[10px] text-slate-500">-1 Dette</span>
              </button>

              <button 
                onClick={() => {
                  validateOneQada(); 
                }}
                className="bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-black font-bold">all_inclusive</span>
                </div>
                <span className="text-sm font-bold text-white">Double Shot</span>
                <span className="text-[10px] text-primary/80">-1 Dette + Bonus</span>
              </button>
            </div>

            {/* Projection */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-slate-400 text-xs mb-2">
                Rythme actuel : <span className="text-white font-bold">{dailyRate} rattrapage(s) / jour</span>
              </p>
              {estimatedDate && (
                <div className="inline-block bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                  <p className="text-xs text-slate-300">
                    Estimation de fin : <span className="text-primary font-bold">{format(estimatedDate, 'd MMMM yyyy', { locale: fr })}</span>
                  </p>
                </div>
              )}
              
              {/* Slider to adjust daily rate simulation */}
              <div className="mt-4 px-4">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={dailyRate} 
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Rapides */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-card-dark border border-white/5 rounded-xl p-4">
            <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Score de Vie</p>
            <p className="text-2xl font-bold text-white">{lifetimePrayerScore}</p>
          </div>
          <div className="bg-card-dark border border-white/5 rounded-xl p-4">
            <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Constance</p>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm">local_fire_department</span>
              <p className="text-xl font-bold text-white">3 Jours</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SALAH_STEPS } from '../data/prayerGuideData';

import { useGamificationStore } from '../store/useGamificationStore';

export default function SalahGuide() {
  const navigate = useNavigate();
  const { completeGuide } = useGamificationStore();
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const steps = selectedPrayer ? SALAH_STEPS[selectedPrayer] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const speak = async (text: string) => {
    if (!text || isSpeaking) return;
    
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => voice.lang.startsWith('ar'));
      if (arabicVoice) utterance.voice = arabicVoice;
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeGuide('salah');
      navigate('/learn');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!selectedPrayer) {
    const prayers = [
      { id: 'fajr', name: 'Fajr', rakat: 2, icon: 'wb_twilight', color: 'bg-sky-500' },
      { id: 'dhuhr', name: 'Dhuhr', rakat: 4, icon: 'light_mode', color: 'bg-amber-500' },
      { id: 'asr', name: 'Asr', rakat: 4, icon: 'wb_sunny', color: 'bg-orange-500' },
      { id: 'maghrib', name: 'Maghrib', rakat: 3, icon: 'nights_stay', color: 'bg-indigo-500' },
      { id: 'isha', name: 'Isha', rakat: 4, icon: 'bedtime', color: 'bg-purple-500' }
    ];

    return (
      <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <button onClick={() => navigate('/learn')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-xs font-bold">Retour</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Guide de la Prière</h2>
          <p className="text-slate-400 mb-8">Quelle prière souhaitez-vous accomplir ?</p>
          <div className="grid gap-4">
            {prayers.map((prayer, index) => (
              <motion.button
                key={prayer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPrayer(prayer.id)}
                className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex items-center gap-5 group hover:bg-white/[0.05] hover:border-white/10 transition-all text-left"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${prayer.color}`}>
                  <span className="material-symbols-outlined text-3xl">{prayer.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{prayer.name}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{prayer.rakat} Rak'at</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-600 group-hover:text-white transition-colors">chevron_right</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary shadow-[0_0_10px_rgba(0,230,118,0.5)]"
          />
        </div>
        <div className="flex justify-between items-center">
          <button onClick={() => setSelectedPrayer(null)} className="flex items-center gap-1 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
            <span>{selectedPrayer}</span>
          </button>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{step.title}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="w-full max-w-md space-y-6 text-center"
          >
            <div className="relative group mx-auto w-64 h-64">
              <motion.div 
                className="w-full h-full bg-gradient-to-b from-[#0a1f1c] to-[#050505] rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20 text-emerald-500"></div>
                <span className="material-symbols-outlined text-8xl text-white drop-shadow-2xl">
                  {step.title.includes('Sujud') ? 'keyboard_double_arrow_down' : 
                   step.title.includes('Ruku') ? 'keyboard_arrow_down' : 
                   step.title.includes('Taslim') ? 'sync_alt' : 
                   step.title.includes('Qiyam') || step.title.includes('Rak\'ah') ? 'accessibility_new' : 'person'}
                </span>
              </motion.div>

              {step.recitation && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => speak(step.recitation!)}
                  disabled={isSpeaking}
                  className="absolute -bottom-6 right-6 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-[0_10px_30px_rgba(0,230,118,0.3)] border-4 border-[#050505] z-20"
                >
                  <span className="material-symbols-outlined text-3xl font-black">
                    {isSpeaking ? 'graphic_eq' : 'play_arrow'}
                  </span>
                </motion.button>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{step.action}</h2>
              <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
            </div>

            {step.recitation && (
              <motion.div 
                className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 mt-6 space-y-4"
              >
                <p className="text-xl font-arabic text-primary leading-relaxed" dir="rtl">
                  {step.recitation}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-300 italic">
                    "{step.transliteration}"
                  </p>
                  <p className="text-xs text-slate-500">
                    {step.translation}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-20 flex gap-4">
        <button 
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex-1 py-4 rounded-[1.5rem] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <button 
          onClick={nextStep}
          className="flex-[2] py-4 rounded-[1.5rem] bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:bg-primary/90 transition-all"
        >
          {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
        </button>
      </div>
    </div>
  );
}

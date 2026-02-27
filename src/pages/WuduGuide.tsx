import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { WUDU_STEPS } from '../data/prayerGuideData';

import { useGamificationStore } from '../store/useGamificationStore';

export default function WuduGuide() {
  const navigate = useNavigate();
  const { completeGuide } = useGamificationStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (currentStep < WUDU_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeGuide('wudu');
      navigate('/learn');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = WUDU_STEPS[currentStep];
  const progress = ((currentStep + 1) / WUDU_STEPS.length) * 100;

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden relative">
      {/* Top Progress Bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary shadow-[0_0_10px_rgba(0,230,118,0.5)]"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Étape {currentStep + 1} / {WUDU_STEPS.length}</span>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{step.title}</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="w-full max-w-md space-y-6 text-center"
          >
            {/* Tags */}
            <div className="flex justify-center gap-3">
              {step.type && (
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${step.type === 'Obligatoire' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {step.type}
                </span>
              )}
              {step.repetitions && (
                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                  {step.repetitions} Fois
                </span>
              )}
            </div>

            {/* Central Visual */}
            <div className="relative group mx-auto w-64 h-64">
              <motion.div 
                className="w-full h-full bg-gradient-to-b from-[#0a1f1c] to-[#050505] rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20 text-emerald-500"></div>
                <span className="material-symbols-outlined text-8xl text-white drop-shadow-2xl">
                  {step.title.includes('mains') ? 'back_hand' : 
                   step.title.includes('bouche') ? 'face' : 
                   step.title.includes('nez') ? 'air' : 
                   step.title.includes('visage') ? 'face' : 
                   step.title.includes('bras') ? 'architecture' : 
                   step.title.includes('tête') ? 'person' : 
                   step.title.includes('oreilles') ? 'hearing' : 
                   step.title.includes('pieds') ? 'steps' : 'water_drop'}
                </span>
              </motion.div>

              {/* Play Button Overlay */}
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

            {/* Title & Description */}
            <div className="space-y-4 pt-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{step.title}</h2>
              <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-xs mx-auto">{step.action}</p>
            </div>

            {/* Tip Card */}
            {step.tip && (
              <div className="bg-[#1a1205] border border-amber-900/30 rounded-2xl p-4 flex items-start gap-4 text-left max-w-sm mx-auto">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-400 text-lg">lightbulb</span>
                </div>
                <div>
                  <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Conseil</h4>
                  <p className="text-amber-100/80 text-xs leading-relaxed">{step.tip}</p>
                </div>
              </div>
            )}

            {/* Invocation Card */}
            {step.recitation && (
              <div className="bg-[#050c1a] border border-white/5 rounded-3xl p-6 space-y-3 max-w-sm mx-auto">
                <p className="text-xl font-arabic text-primary leading-loose">{step.recitation}</p>
                <div className="h-px w-12 bg-white/10 mx-auto"></div>
                <p className="text-xs text-slate-400 font-medium italic">"{step.translation}"</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
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
          {currentStep === WUDU_STEPS.length - 1 ? 'Terminer' : 'Suivant'}
        </button>
      </div>
    </div>
  );
}

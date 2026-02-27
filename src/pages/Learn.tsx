import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'motion/react';
import { useTajwidStore } from '../store/useTajwidStore';
import { useProphetsStore } from '../store/useProphetsStore';
import { useGamificationStore } from '../store/useGamificationStore';
import { prophetsData } from '../data/prophetsData';

export default function Learn() {
  const { completedLessons } = useTajwidStore();
  const { completedStories } = useProphetsStore();
  const { wuduCompleted, salahCompleted, zakatCalculated } = useGamificationStore();

  const tajwidProgress = Math.round((completedLessons.length / 30) * 100); // Assuming 30 lessons
  const prophetsProgress = Math.round((completedStories.length / prophetsData.length) * 100);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#050505] relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <Header title="Apprendre & Découvrir" />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 pt-4 pb-8 space-y-8 relative z-10"
      >
        
        {/* Parcours d'Apprentissage */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Parcours d'Apprentissage</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <Link to="/tajwid" className="bg-card-dark border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4 group relative overflow-hidden hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                  <span className="material-symbols-outlined text-3xl">record_voice_over</span>
                </div>
                {tajwidProgress > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-400">{tajwidProgress}%</span>
                  </div>
                )}
              </div>
              
              <div className="relative z-10">
                <h4 className="text-white font-black text-xl mb-1">Tajwid</h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">Maîtrisez les règles de récitation du Saint Coran avec des exercices interactifs et une reconnaissance vocale.</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${tajwidProgress}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{completedLessons.length}/30 Leçons</span>
                </div>
              </div>
            </Link>

            <Link to="/prophets" className="bg-card-dark border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4 group relative overflow-hidden hover:border-amber-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors duration-500"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                  <span className="material-symbols-outlined text-3xl">auto_stories</span>
                </div>
                {prophetsProgress > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-amber-400">{prophetsProgress}%</span>
                  </div>
                )}
              </div>
              
              <div className="relative z-10">
                <h4 className="text-white font-black text-xl mb-1">Histoires des Prophètes</h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">Découvrez la vie, les épreuves et les miracles des messagers d'Allah à travers des récits immersifs.</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${prophetsProgress}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{completedStories.length}/{prophetsData.length} Histoires</span>
                </div>
              </div>
            </Link>
          </div>
        </motion.section>

        {/* Fondamentaux */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Fondamentaux</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/wudu-guide" className={`bg-card-dark border ${wuduCompleted ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5'} rounded-3xl p-5 flex flex-col gap-3 group hover:border-blue-500/50 transition-colors relative overflow-hidden`}>
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${wuduCompleted ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20'}`}>
                  <span className="material-symbols-outlined">water_drop</span>
                </div>
                {wuduCompleted && <span className="material-symbols-outlined text-blue-500 text-sm">check_circle</span>}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-0.5">Ablutions</h4>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Guide pas à pas</p>
              </div>
            </Link>

            <Link to="/salah-guide" className={`bg-card-dark border ${salahCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'} rounded-3xl p-5 flex flex-col gap-3 group hover:border-emerald-500/50 transition-colors relative overflow-hidden`}>
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${salahCompleted ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20'}`}>
                  <span className="material-symbols-outlined">mosque</span>
                </div>
                {salahCompleted && <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-0.5">Prière</h4>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Guide interactif</p>
              </div>
            </Link>

            <Link to="/zakat" className={`bg-card-dark border ${zakatCalculated ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5'} rounded-3xl p-5 flex flex-col gap-3 group hover:border-amber-500/50 transition-colors relative overflow-hidden col-span-2`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${zakatCalculated ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20'}`}>
                  <span className="material-symbols-outlined text-xl">calculate</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-white font-bold text-sm mb-0.5">Zakat Al-Maal</h4>
                    {zakatCalculated && <span className="material-symbols-outlined text-amber-500 text-sm">check_circle</span>}
                  </div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Calculateur & Nisab</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.section>

        {/* Ressources Quotidiennes */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Ressources Quotidiennes</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/duas" className="bg-card-dark border border-white/5 rounded-3xl p-4 flex items-center gap-3 group hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500/20 transition-colors">
                <span className="material-symbols-outlined">volunteer_activism</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Duas</h4>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Invocations</p>
              </div>
            </Link>

            <Link to="/hadith" className="bg-card-dark border border-white/5 rounded-3xl p-4 flex items-center gap-3 group hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500/20 transition-colors">
                <span className="material-symbols-outlined">format_quote</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Hadith</h4>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Nawawi</p>
              </div>
            </Link>

            <Link to="/calendar" className="bg-card-dark border border-white/5 rounded-3xl p-4 flex items-center gap-3 group hover:border-white/10 transition-colors col-span-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Calendrier Hégirien</h4>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Événements & Jeûnes</p>
              </div>
            </Link>
          </div>
        </motion.section>

        {/* Outils de Localisation */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <span className="w-1 h-4 bg-slate-500 rounded-full"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Localisation</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/qibla" className="bg-card-dark border border-white/5 rounded-3xl p-4 flex items-center gap-3 group hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">explore</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Qibla</h4>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">Boussole</p>
              </div>
            </Link>

            <Link to="/mosques" className="bg-card-dark border border-white/5 rounded-3xl p-4 flex items-center gap-3 group hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">mosque</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Mosquées</h4>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider font-bold">À proximité</p>
              </div>
            </Link>
          </div>
        </motion.section>

      </motion.main>
    </div>
  );
}

import Header from '../components/Header';
import { motion } from 'motion/react';

export default function Prayer() {
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
    <div className="flex-1 overflow-y-auto pb-24 bg-[#050505] relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <Header title="Prières" leftIcon="arrow_back" onLeftClick={() => window.history.back()} />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 py-6 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <span className="material-symbols-outlined text-primary text-5xl">mosque</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Horaires de Prière</h2>
          <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto leading-relaxed">
            Retrouvez les horaires détaillés et le calendrier mensuel dans la section <span className="text-primary font-bold">Calendrier</span>.
          </p>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/calendar'}
            className="mt-8 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold uppercase tracking-wider text-xs hover:bg-white/10 transition-all flex items-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined">calendar_month</span>
            Voir le Calendrier
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <div className="bg-card-dark border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
            <span className="material-symbols-outlined text-primary text-3xl mb-4">notifications_active</span>
            <h3 className="font-bold text-white mb-1">Adhan</h3>
            <p className="text-xs text-slate-400">Configurez les appels à la prière</p>
          </div>

          <div className="bg-card-dark border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
            <span className="material-symbols-outlined text-blue-500 text-3xl mb-4">settings</span>
            <h3 className="font-bold text-white mb-1">Calcul</h3>
            <p className="text-xs text-slate-400">Méthodes de calcul & Asr</p>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}

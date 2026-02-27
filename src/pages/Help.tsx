import Header from '../components/Header';
import { motion } from 'motion/react';

export default function Help() {
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

      <Header title="Aide" leftIcon="arrow_back" onLeftClick={() => window.history.back()} />

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        <motion.div variants={itemVariants} className="px-4 pt-2 pb-6 text-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">Emerald Islam v1.0</span>
        </motion.div>

        <motion.div variants={itemVariants} className="px-4 py-2 mb-6">
          <label className="relative block group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4">
              <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            </span>
            <input 
              type="text" 
              placeholder="Comment pouvons-nous vous aider ?" 
              className="w-full bg-card-dark border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-lg font-medium text-sm"
            />
          </label>
        </motion.div>

        <motion.section variants={itemVariants} className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Tutoriels rapides</h2>
            <button className="text-primary text-[10px] font-bold uppercase tracking-wider">Voir tout</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <motion.div whileTap={{ scale: 0.95 }} className="min-w-[240px] bg-card-dark border border-white/10 rounded-3xl p-4 flex flex-col gap-3 group cursor-pointer">
              <div className="w-full h-32 bg-primary/10 rounded-2xl flex items-center justify-center relative overflow-hidden border border-primary/10 group-hover:border-primary/30 transition-colors">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                <span className="material-symbols-outlined text-primary text-4xl relative z-10 group-hover:scale-110 transition-transform">play_circle</span>
              </div>
              <div>
                <p className="font-bold text-sm text-white mb-1">Configurer la Qibla</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">2 min • Guide visuel</p>
              </div>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="min-w-[240px] bg-card-dark border border-white/10 rounded-3xl p-4 flex flex-col gap-3 group cursor-pointer">
              <div className="w-full h-32 bg-blue-500/10 rounded-2xl flex items-center justify-center relative overflow-hidden border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                <span className="material-symbols-outlined text-blue-500 text-4xl relative z-10 group-hover:scale-110 transition-transform">menu_book</span>
              </div>
              <div>
                <p className="font-bold text-sm text-white mb-1">Lire le Coran en audio</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">3 min • Guide texte</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="px-4 mb-8">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 px-1">Questions fréquentes</h2>
          <div className="space-y-3">
            <details className="group bg-card-dark border border-white/10 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none transition-colors hover:bg-white/5">
                <span className="text-sm font-bold text-slate-200">Comment activer les notifications ?</span>
                <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                Allez dans Paramètres &gt; Notifications et assurez-vous que les autorisations système sont activées pour Emerald Islam.
              </div>
            </details>

            <details className="group bg-card-dark border border-white/10 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none transition-colors hover:bg-white/5">
                <span className="text-sm font-bold text-slate-200">Où trouver les horaires de prière ?</span>
                <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                Les horaires sont automatiquement détectés en fonction de votre position GPS. Vous pouvez les ajuster manuellement dans l'onglet Prière.
              </div>
            </details>

            <details className="group bg-card-dark border border-white/10 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none transition-colors hover:bg-white/5">
                <span className="text-sm font-bold text-slate-200">L'application est-elle gratuite ?</span>
                <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                Emerald Islam propose une version gratuite avec toutes les fonctionnalités essentielles et une version Premium sans publicités.
              </div>
            </details>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="px-4 mb-12">
          <div className="bg-card-dark border border-white/10 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative z-10">
              <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Besoin d'aide supplémentaire ?</h3>
              <p className="text-slate-400 text-sm mb-8 px-4 font-medium">Nos experts sont disponibles pour répondre à toutes vos questions.</p>
              
              <div className="flex flex-col gap-3">
                <motion.button whileTap={{ scale: 0.98 }} className="bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] uppercase tracking-wider text-xs">
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Contacter le Support
                </motion.button>
                <motion.button whileTap={{ scale: 0.98 }} className="bg-white/5 text-white border border-white/10 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-wider text-xs">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  Chat en direct
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}

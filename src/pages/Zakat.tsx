import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useGamificationStore } from '../store/useGamificationStore';
import { motion } from 'motion/react';

export default function Zakat() {
  const navigate = useNavigate();
  const { incrementCounter } = useGamificationStore();
  const [cash, setCash] = useState<string>('');
  const [gold, setGold] = useState<string>('');
  const [investments, setInvestments] = useState<string>('');

  const nisab = 5430.00; // Fixed value for demo, could be fetched from an API

  const calculateZakat = () => {
    const totalWealth = (parseFloat(cash) || 0) + (parseFloat(gold) || 0) + (parseFloat(investments) || 0);
    if (totalWealth >= nisab) {
      const amount = totalWealth * 0.025;
      if (amount > 0) {
        incrementCounter('zakat');
      }
      return amount;
    }
    return 0;
  };

  const zakatAmount = calculateZakat();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-[#050505] relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <Header leftIcon="arrow_back" onLeftClick={() => navigate('/learn')} rightIcon="help_outline" title="Zakat" />

      <main className="px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-6 rounded-3xl bg-card-dark border border-white/5 flex items-center justify-between relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Seuil du Nisab (Or/Argent)</p>
            <p className="text-2xl font-black text-primary tracking-tight">{nisab.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
          </div>
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 relative z-10">
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 space-y-6"
        >
          <div className="flex items-center gap-2 px-1">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            <h2 className="text-xs font-black text-white uppercase tracking-widest">Saisie de vos avoirs</h2>
          </div>
          
          <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-card-dark border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-primary">
                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
              </div>
              <h3 className="font-bold text-white text-sm">Espèces et épargne</h3>
            </div>
            <div className="relative group">
              <input 
                type="number" 
                placeholder="0.00" 
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 focus:ring-1 focus:ring-primary focus:border-primary text-white placeholder:text-slate-700 transition-all font-mono text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-card-dark border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-amber-500">
                <span className="material-symbols-outlined text-xl">diamond</span>
              </div>
              <h3 className="font-bold text-white text-sm">Or et bijoux</h3>
            </div>
            <div className="relative group">
              <input 
                type="number" 
                placeholder="0.00" 
                value={gold}
                onChange={(e) => setGold(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-white placeholder:text-slate-700 transition-all font-mono text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-card-dark border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 text-blue-500">
                <span className="material-symbols-outlined text-xl">trending_up</span>
              </div>
              <h3 className="font-bold text-white text-sm">Actions et investissements</h3>
            </div>
            <div className="relative group">
              <input 
                type="number" 
                placeholder="0.00" 
                value={investments}
                onChange={(e) => setInvestments(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-slate-700 transition-all font-mono text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-8 rounded-[2rem] bg-card-dark border border-primary/30 relative overflow-hidden text-center space-y-2 group"
        >
          <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Montant total de la Zakat (2.5%)</p>
            <p className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
              {zakatAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
            <div className="pt-6 flex justify-center">
              <div className="px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Calculé selon le Nisab</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

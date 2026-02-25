import { useState } from 'react';
import Header from '../components/Header';

export default function Zakat() {
  const [cash, setCash] = useState<string>('');
  const [gold, setGold] = useState<string>('');
  const [investments, setInvestments] = useState<string>('');

  const nisab = 5430.00; // Fixed value for demo, could be fetched from an API

  const calculateZakat = () => {
    const totalWealth = (parseFloat(cash) || 0) + (parseFloat(gold) || 0) + (parseFloat(investments) || 0);
    if (totalWealth >= nisab) {
      return totalWealth * 0.025;
    }
    return 0;
  };

  const zakatAmount = calculateZakat();

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-transparent">
      <Header leftIcon="arrow_back" rightIcon="help_outline" />

      <main className="px-4">
        <div className="mt-2 p-4 rounded-xl bg-card-dark border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Seuil du Nisab (Or/Argent)</p>
            <p className="text-xl font-bold text-primary">{nisab.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
          </div>
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">payments</span>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-1">Saisie de vos avoirs</h2>
          
          <div className="p-5 rounded-xl bg-card-dark border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
              <h3 className="font-bold">Espèces et épargne</h3>
            </div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0.00" 
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 placeholder:text-slate-600"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card-dark border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">diamond</span>
              <h3 className="font-bold">Or et bijoux</h3>
            </div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0.00" 
                value={gold}
                onChange={(e) => setGold(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 placeholder:text-slate-600"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card-dark border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">trending_up</span>
              <h3 className="font-bold">Actions et investissements</h3>
            </div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0.00" 
                value={investments}
                onChange={(e) => setInvestments(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg py-3 px-4 focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 placeholder:text-slate-600"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-card-dark border border-primary/30 emerald-glow text-center space-y-2">
          <p className="text-slate-400 text-sm font-medium">Montant total de la Zakat (2.5%)</p>
          <p className="text-4xl font-extrabold text-primary">{zakatAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
          <div className="pt-4 flex justify-center">
            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Conforme Emerald Islam v1.0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

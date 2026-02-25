import React from 'react';
import Home from './Home';
import Calendar from './Calendar';
import Qada from './Qada';

export default function Showcase() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#050505] p-4 space-y-10">
      <div className="py-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">Emerald Islam - Real Render</h1>
        <p className="text-slate-400 text-sm">Ceci est le rendu direct de votre code.</p>
      </div>

      <div className="space-y-20">
        <section>
          <h2 className="text-primary font-bold mb-4 uppercase tracking-widest text-xs">01. Accueil & Prières</h2>
          <div className="border border-white/10 rounded-3xl overflow-hidden bg-main-dark max-h-[600px] overflow-y-auto shadow-2xl">
            <Home />
          </div>
        </section>

        <section>
          <h2 className="text-primary font-bold mb-4 uppercase tracking-widest text-xs">02. Calendrier & Événements</h2>
          <div className="border border-white/10 rounded-3xl overflow-hidden bg-main-dark max-h-[600px] overflow-y-auto shadow-2xl">
            <Calendar />
          </div>
        </section>

        <section>
          <h2 className="text-primary font-bold mb-4 uppercase tracking-widest text-xs">03. Suivi du Qada</h2>
          <div className="border border-white/10 rounded-3xl overflow-hidden bg-main-dark max-h-[600px] overflow-y-auto shadow-2xl">
            <Qada />
          </div>
        </section>
      </div>
    </div>
  );
}

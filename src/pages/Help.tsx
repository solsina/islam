import Header from '../components/Header';

export default function Help() {
  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
      <Header title="Aide" leftIcon="arrow_back" />

      <div className="px-4 pt-2 pb-6 text-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest bg-border-dark px-3 py-1 rounded-full">Emerald Islam v1.0</span>
      </div>

      <div className="px-4 py-6">
        <label className="relative block group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          </span>
          <input 
            type="text" 
            placeholder="Comment pouvons-nous vous aider ?" 
            className="w-full bg-card-dark border border-border-dark rounded-xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-lg"
          />
        </label>
      </div>

      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Tutoriels rapides</h2>
          <button className="text-primary text-sm font-semibold">Voir tout</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          <div className="min-w-[240px] bg-card-dark border border-border-dark rounded-xl p-4 flex flex-col gap-3">
            <div className="w-full h-32 bg-primary/10 rounded-lg flex items-center justify-center relative overflow-hidden">
              <span className="material-symbols-outlined text-primary text-4xl">play_circle</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <p className="font-bold text-sm">Configurer la Qibla</p>
            <p className="text-xs text-slate-400">2 min • Guide visuel</p>
          </div>
          <div className="min-w-[240px] bg-card-dark border border-border-dark rounded-xl p-4 flex flex-col gap-3">
            <div className="w-full h-32 bg-primary/10 rounded-lg flex items-center justify-center relative overflow-hidden">
              <span className="material-symbols-outlined text-primary text-4xl">menu_book</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <p className="font-bold text-sm">Lire le Coran en audio</p>
            <p className="text-xs text-slate-400">3 min • Guide texte</p>
          </div>
        </div>
      </section>

      <section className="px-4 mb-8">
        <h2 className="text-lg font-bold mb-4">Questions fréquentes</h2>
        <div className="space-y-3">
          <details className="group bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none transition-colors hover:bg-white/5">
              <span className="text-sm font-medium">Comment activer les notifications d'Adhan ?</span>
              <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-border-dark pt-3">
              Allez dans Paramètres &gt; Notifications et assurez-vous que les autorisations système sont activées pour Emerald Islam.
            </div>
          </details>

          <details className="group bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none transition-colors hover:bg-white/5">
              <span className="text-sm font-medium">Où trouver les horaires de prière ?</span>
              <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-slate-400 border-t border-border-dark pt-3">
              Les horaires sont automatiquement détectés en fonction de votre position GPS. Vous pouvez les ajuster manuellement dans l'onglet Prière.
            </div>
          </details>

          <details className="group bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none transition-colors hover:bg-white/5">
              <span className="text-sm font-medium">L'application est-elle gratuite ?</span>
              <span className="material-symbols-outlined text-slate-500 group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="px-4 pb-4 text-sm text-slate-400 border-t border-border-dark pt-3">
              Emerald Islam propose une version gratuite avec toutes les fonctionnalités essentielles et une version Premium sans publicités.
            </div>
          </details>
        </div>
      </section>

      <section className="px-4 mb-12">
        <div className="bg-card-dark border border-border-dark rounded-2xl p-6 text-center shadow-xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Besoin d'aide supplémentaire ?</h3>
          <p className="text-slate-400 text-sm mb-6 px-4">Nos experts sont disponibles pour répondre à toutes vos questions concernant Emerald Islam.</p>
          <div className="flex flex-col gap-3">
            <button className="bg-primary text-background-dark font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95">
              <span className="material-symbols-outlined text-background-dark">mail</span>
              Contacter le Support
            </button>
            <button className="bg-transparent text-primary border border-primary/30 font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary/10 transition-all">
              <span className="material-symbols-outlined">chat_bubble</span>
              Chat en direct
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

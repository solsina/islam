import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { nawawiHadiths, Hadith as HadithType } from '../data/hadithData';

export default function Hadith() {
  const [activeHadith, setActiveHadith] = useState<HadithType | null>(null);
  const [hadiths, setHadiths] = useState<HadithType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHadiths = async () => {
      try {
        const [frRes, arRes] = await Promise.all([
          fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/fra-nawawi.json'),
          fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.json')
        ]);
        
        const frData = await frRes.json();
        const arData = await arRes.json();

        const mergedHadiths = frData.hadiths.map((h: any, i: number) => {
          // Find local hadith to get the nice title
          const localHadith = nawawiHadiths.find(lh => lh.id === h.hadithnumber);
          
          return {
            id: h.hadithnumber,
            title: localHadith ? localHadith.title : `Hadith ${h.hadithnumber}`,
            arabic: arData.hadiths[i]?.text || '',
            translation: h.text,
            narrator: 'An-Nawawi',
            reference: '40 Hadith Nawawi'
          };
        });
        
        setHadiths(mergedHadiths);
      } catch (error) {
        console.error("Erreur lors du chargement des hadiths", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHadiths();
  }, []);

  const handleBack = () => {
    setActiveHadith(null);
  };

  if (activeHadith) {
    return (
      <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
        <Header leftIcon="arrow_back" onLeftClick={handleBack} rightIcon="share" />

        <main className="flex-1 overflow-y-auto px-6 pt-2 pb-32">
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <div className="inline-block px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Hadith {activeHadith.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                {activeHadith.title}
              </h1>
            </div>

            <div className="bg-card-dark/50 rounded-2xl p-6 border border-white/5">
              <p className="font-arabic text-3xl leading-[2.5] text-white text-right" dir="rtl">
                {activeHadith.arabic}
              </p>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="text-slate-200 text-lg leading-relaxed space-y-4">
              {activeHadith.translation.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-center text-slate-500 text-sm">
              <span className="material-symbols-outlined text-base mr-2">menu_book</span>
              {activeHadith.reference}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-transparent">
      <Header />

      <section className="px-4 pt-2 pb-6">
        <div className="bg-card-dark border border-white/5 rounded-xl p-6 relative overflow-hidden emerald-glow mb-6">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-white font-bold text-lg mb-2">L'Imam An-Nawawi</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Une compilation des 40 hadiths les plus importants de l'Islam, couvrant les fondements de la religion, de la loi et de la morale islamique.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 text-sm">Chargement des hadiths...</p>
            </div>
          ) : (
            hadiths.map((hadith) => (
              <div 
                key={hadith.id}
                onClick={() => setActiveHadith(hadith)}
                className="bg-card-dark border border-white/5 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-lg">{hadith.id}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-100 line-clamp-1">{hadith.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {hadith.translation.substring(0, 60)}...
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useQuranStore } from '../store/useQuranStore';

export default function SurahReader() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [arabicData, setArabicData] = useState<any>(null);
  const [frenchData, setFrenchData] = useState<any>(null);
  const [phoneticData, setPhoneticData] = useState<any>(null);
  
  const { setLastRead, lastRead } = useQuranStore();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const convertToFrenchPhonetic = (text: string) => {
    if (!text) return '';
    return text
      .replace(/sh/g, 'ch').replace(/Sh/g, 'Ch')
      .replace(/oo/g, 'oû')
      .replace(/ee/g, 'î')
      .replace(/aa/g, 'â')
      .replace(/u/g, 'ou')
      .replace(/j/g, 'dj').replace(/J/g, 'Dj');
  };

  useEffect(() => {
    const fetchSurah = async () => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,fr.hamidullah,en.transliteration`);
        const json = await res.json();
        if (json.code === 200) {
          setArabicData(json.data[0]);
          setFrenchData(json.data[1]);
          setPhoneticData(json.data[2]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la sourate", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurah();
  }, [id]);

  // Setup Intersection Observer to track reading progress
  useEffect(() => {
    if (loading || !arabicData) return;

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const ayahNumber = parseInt(entry.target.getAttribute('data-ayah') || '1', 10);
          if (id) {
            setLastRead(parseInt(id, 10), ayahNumber);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when ayah is in the upper middle of the screen
      threshold: 0.1
    });

    const elements = document.querySelectorAll('.ayah-container');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, arabicData, id, setLastRead]);

  // Scroll to last read ayah if returning to this surah
  useEffect(() => {
    if (!loading && arabicData && lastRead && lastRead.surahId === parseInt(id || '0', 10)) {
      const element = document.querySelector(`[data-ayah="${lastRead.ayahNumber}"]`);
      if (element) {
        // Add a small delay to ensure rendering is complete
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [loading, arabicData, id]); // Only run once when data is loaded

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Chargement..." leftIcon="arrow_back" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-sm">Chargement des versets...</p>
        </div>
      </div>
    );
  }

  if (!arabicData || !frenchData || !phoneticData) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Erreur" leftIcon="arrow_back" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Impossible de charger la sourate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
      <Header leftIcon="arrow_back" />
      
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-6">
        <div className="text-center mb-8 bg-card-dark border border-white/5 rounded-2xl p-6 emerald-glow relative overflow-hidden">
          <div className="absolute -right-12 -top-12 size-32 bg-primary/10 rounded-full blur-3xl"></div>
          <h1 className="text-4xl font-arabic text-primary mb-3">{arabicData.name}</h1>
          <p className="text-slate-300 font-bold mb-1">{frenchData.englishNameTranslation}</p>
          <p className="text-slate-500 text-xs uppercase tracking-widest">{arabicData.revelationType} • {arabicData.numberOfAyahs} versets</p>
        </div>
        
        {/* Display Bismillah for all surahs except At-Tawbah (9) and Al-Fatihah (1, already included in ayah 1) */}
        {id !== '1' && id !== '9' && (
          <div className="text-center py-4 mb-4">
            <p className="font-arabic text-3xl text-white opacity-90">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          </div>
        )}

        <div className="space-y-6">
          {arabicData.ayahs.map((ayah: any, index: number) => {
            // The API often prepends Bismillah to the first ayah of every surah.
            // We strip it here for cleaner display since we show it standalone above.
            let arabicText = ayah.text;
            const bismillah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ';
            if (id !== '1' && index === 0 && arabicText.startsWith(bismillah)) {
              arabicText = arabicText.replace(bismillah, '');
            }

            const isLastRead = lastRead?.surahId === parseInt(id || '0', 10) && lastRead?.ayahNumber === ayah.numberInSurah;

            return (
              <div 
                key={ayah.numberInSurah} 
                data-ayah={ayah.numberInSurah}
                className={`ayah-container bg-card-dark border rounded-xl p-5 space-y-5 transition-colors ${isLastRead ? 'border-primary/50 emerald-glow' : 'border-white/5 hover:border-primary/30'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border mt-1 ${isLastRead ? 'bg-primary text-black border-primary' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    <span className="text-sm font-bold">{ayah.numberInSurah}</span>
                  </div>
                  <p className="font-arabic text-3xl leading-loose text-white text-right flex-1" dir="rtl">
                    {arabicText}
                  </p>
                </div>
                <div className="border-t border-white/5 pt-4">
                  <p className="text-slate-300 text-sm leading-relaxed mb-2">
                    {frenchData.ayahs[index].text}
                  </p>
                  <p className="text-primary/70 text-xs italic leading-relaxed">
                    {convertToFrenchPhonetic(phoneticData.ayahs[index].text)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

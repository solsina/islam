import { useState } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useSettingsStore } from '../store/useSettingsStore';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { name, setName, completeOnboarding } = useProfileStore();
  const { 
    location, 
    setLocation, 
    calculationMethod,
    setCalculationMethod
  } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSearchCity = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Erreur de recherche:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCity = (result: any) => {
    const city = result.name || result.display_name.split(',')[0];
    const country = result.display_name.split(',').pop()?.trim() || '';
    setLocation({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      city,
      country
    });
    setSearchResults([]);
    setSearchQuery('');
    setStep(3); // Automatically advance to next step after selection
  };

  return (
    <div className="fixed inset-0 z-50 bg-background-dark flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md bg-card-dark border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="animate-fade-in text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 emerald-glow mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-4xl">waving_hand</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Bienvenue</h2>
            <p className="text-slate-400 mb-8 text-sm">Comment souhaitez-vous qu'on vous appelle ?</p>
            
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre prénom"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold text-center focus:border-primary focus:outline-none transition-colors text-lg mb-8"
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="animate-fade-in text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 emerald-glow mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-4xl">location_on</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Votre Position</h2>
            <p className="text-slate-400 mb-6 text-sm">Pour calculer avec précision les horaires de prière.</p>
            
            <div className="space-y-4 text-left">
              <div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchCity()}
                    placeholder="Rechercher une ville (ex: Paris)..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-colors text-sm"
                    autoFocus
                  />
                  <button 
                    onClick={handleSearchCity}
                    disabled={isSearching}
                    className="bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl px-6 flex items-center justify-center transition-colors"
                  >
                    {isSearching ? (
                      <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-primary">search</span>
                    )}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 bg-background-dark border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto shadow-xl">
                    {searchResults.map((result, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectCity(result)}
                        className="w-full text-left p-4 text-sm text-slate-300 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-center gap-3"
                      >
                        <span className="material-symbols-outlined text-slate-500">location_city</span>
                        {result.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {location.city && (
                <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <div>
                    <p className="text-xs text-slate-400">Ville sélectionnée :</p>
                    <p className="text-base font-bold text-white">{location.city}, {location.country}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Calculation Method */}
        {step === 3 && (
          <div className="animate-fade-in text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 emerald-glow mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-4xl">schedule</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Méthode de Calcul</h2>
            <p className="text-slate-400 mb-8 text-sm">Choisissez la convention pour les horaires de prière.</p>
            
            <div className="text-left space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Convention</label>
              <select 
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-colors appearance-none"
              >
                <option value="MuslimWorldLeague">Ligue Musulmane Mondiale (MWL)</option>
                <option value="Egyptian">Autorité Générale Égyptienne</option>
                <option value="Karachi">Université Islamique de Karachi</option>
                <option value="UmmAlQura">Umm Al-Qura, Makkah</option>
                <option value="Dubai">Dubaï</option>
                <option value="MoonsightingCommittee">Moonsighting Committee</option>
                <option value="NorthAmerica">ISNA (Amérique du Nord)</option>
                <option value="Kuwait">Koweït</option>
                <option value="Qatar">Qatar</option>
                <option value="Singapore">Singapour (MUIS)</option>
                <option value="Tehran">Institut de Géophysique (Téhéran)</option>
                <option value="Turkey">Diyanet (Turquie)</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                En France, la Ligue Musulmane Mondiale (18°) ou une méthode proche du 12° (UOIF) est souvent privilégiée.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="py-4 px-6 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
            >
              Retour
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={step === 1 && !name.trim()}
            className="flex-1 py-4 rounded-xl bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? "Commencer" : "Continuer"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import { useQadaStore } from '../store/useQadaStore';
import { useTajwidStore } from '../store/useTajwidStore';
import { useProfileStore } from '../store/useProfileStore';

export default function Profile() {
  const navigate = useNavigate();
  const { location } = useSettingsStore();
  const { lifetimePrayerScore, totalDebt } = useQadaStore();
  const { completedLessons } = useTajwidStore();
  const { name, avatarUrl, setName, setAvatarUrl, resetProfile } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editAvatar, setEditAvatar] = useState(avatarUrl);

  const handleSaveProfile = () => {
    setName(editName);
    setAvatarUrl(editAvatar);
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      resetProfile();
      navigate('/');
    }
  };

  // Dynamic Gamification
  const hasTajwidBadge = completedLessons.length > 0;
  const hasHasanatBadge = lifetimePrayerScore >= 10;

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-transparent">
      <Header 
        rightIcon="settings" 
        onRightClick={() => navigate('/settings')} 
      />

      <div className="flex flex-col items-center mt-2 mb-8">
        <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
          <div className="w-32 h-32 rounded-full p-1 emerald-gradient emerald-glow transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center overflow-hidden">
              <img 
                src={avatarUrl} 
                alt="Avatar utilisateur" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-primary w-8 h-8 rounded-full border-4 border-background-dark flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-black text-xs font-bold">edit</span>
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-extrabold text-white">{name}</h2>
        <div className="flex items-center gap-1 mt-1 text-slate-400">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <p className="text-sm font-medium">{location.city}, {location.country}</p>
        </div>
      </div>

      {/* Statistiques Globales */}
      <div className="px-4 mb-8">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 px-2">Statistiques Globales</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-primary text-xl">workspace_premium</span>
            </div>
            <span className="text-white font-bold text-xl">{lifetimePrayerScore}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Hasanat</span>
          </div>
          
          <div className="bg-card-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-primary text-xl">mic</span>
            </div>
            <span className="text-white font-bold text-xl">{completedLessons.length}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Leçons Tajwid</span>
          </div>

          <div className="bg-card-dark border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-primary text-xl">history</span>
            </div>
            <span className="text-white font-bold text-xl">{totalDebt}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Dettes Qada</span>
          </div>
        </div>
      </div>

      {/* Badges & Récompenses (Gamification) */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Badges Récent</h3>
          <span className="text-primary text-xs font-bold cursor-pointer hover:underline">Voir tout</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          <div className="min-w-[100px] bg-card-dark border border-primary/20 rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5"></div>
            <span className="material-symbols-outlined text-primary text-3xl mb-2 relative z-10">local_fire_department</span>
            <span className="text-white text-xs font-bold relative z-10">3 Jours</span>
            <span className="text-[9px] text-slate-400 relative z-10">Constance</span>
          </div>
          
          <div className={`min-w-[100px] bg-card-dark border ${hasHasanatBadge ? 'border-primary/20' : 'border-white/5'} rounded-2xl p-3 flex flex-col items-center text-center ${!hasHasanatBadge && 'opacity-50 grayscale'} relative overflow-hidden`}>
            {hasHasanatBadge && <div className="absolute inset-0 bg-primary/5"></div>}
            <span className={`material-symbols-outlined ${hasHasanatBadge ? 'text-primary' : 'text-slate-400'} text-3xl mb-2 relative z-10`}>workspace_premium</span>
            <span className="text-white text-xs font-bold relative z-10">10 Hasanat</span>
            <span className="text-[9px] text-slate-400 relative z-10">Score de vie</span>
          </div>

          <div className={`min-w-[100px] bg-card-dark border ${hasTajwidBadge ? 'border-primary/20' : 'border-white/5'} rounded-2xl p-3 flex flex-col items-center text-center ${!hasTajwidBadge && 'opacity-50 grayscale'} relative overflow-hidden`}>
            {hasTajwidBadge && <div className="absolute inset-0 bg-primary/5"></div>}
            <span className={`material-symbols-outlined ${hasTajwidBadge ? 'text-primary' : 'text-slate-400'} text-3xl mb-2 relative z-10`}>mic</span>
            <span className="text-white text-xs font-bold relative z-10">1ère Leçon</span>
            <span className="text-[9px] text-slate-400 relative z-10">Tajwid</span>
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      <div className="px-4 space-y-3">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 px-2">Paramètres</h3>
        
        <button 
          onClick={() => setIsEditing(true)}
          className="w-full bg-card-dark border border-white/5 rounded-xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all hover:border-primary/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">person</span>
            </div>
            <span className="text-sm font-bold text-slate-200">Informations Personnelles</span>
          </div>
          <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
        </button>
        
        <button 
          onClick={() => navigate('/settings')}
          className="w-full bg-card-dark border border-white/5 rounded-xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all hover:border-primary/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">schedule</span>
            </div>
            <span className="text-sm font-bold text-slate-200">Préférences de Prière</span>
          </div>
          <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
        </button>
        
        <button 
          onClick={() => navigate('/settings')}
          className="w-full bg-card-dark border border-white/5 rounded-xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all hover:border-primary/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">settings</span>
            </div>
            <span className="text-sm font-bold text-slate-200">Paramètres de l'Application</span>
          </div>
          <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
        </button>
        
        <button 
          onClick={() => navigate('/help')}
          className="w-full bg-card-dark border border-white/5 rounded-xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all hover:border-primary/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">help</span>
            </div>
            <span className="text-sm font-bold text-slate-200">Aide & Support</span>
          </div>
          <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">chevron_right</span>
        </button>
      </div>

      <div className="mt-10 flex justify-center px-4">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 h-14 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-red-500">logout</span>
          <span className="text-red-500 font-bold text-sm">Se Déconnecter</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card-dark border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Modifier le Profil</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom d'utilisateur</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none transition-colors"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">URL de l'Avatar</label>
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none transition-colors"
                  placeholder="https://..."
                />
                <p className="text-[10px] text-slate-500 mt-1">Collez l'URL d'une image pour votre avatar.</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveProfile}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

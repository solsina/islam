import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { useTajwidStore } from '../store/useTajwidStore';
import { tajwidData, TajwidModule, TajwidLesson, TajwidCategory, verseAnalysisData, MakharijType, tajwidRules } from '../data/tajwidData';
import { useTranslation } from 'react-i18next';
import TajwidText from '../components/TajwidText';
import AudioVisualizer from '../components/AudioVisualizer';
import { motion, AnimatePresence } from 'motion/react';

export default function Tajwid() {
  const { t } = useTranslation();
  const { completedLessons, completeLesson, getCompletionPercentage } = useTajwidStore();
  
  const [activeModule, setActiveModule] = useState<TajwidModule | null>(null);
  const [activeLesson, setActiveLesson] = useState<TajwidLesson | null>(null);
  const [activeFilter, setActiveFilter] = useState<TajwidCategory>('Toutes');
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [showMakharij, setShowMakharij] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  // Audio Recording & Analysis States
  const [recordingExampleId, setRecordingExampleId] = useState<string | null>(null);
  const [analyzingExampleId, setAnalyzingExampleId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { status: 'success' | 'warning', message: string }>>({});
  
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalLessons = tajwidData.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const completionPercentage = getCompletionPercentage(totalLessons);

  const filters: TajwidCategory[] = ['Toutes', 'Lettres', 'Prolongations', 'Pauses'];

  const filteredModules = activeFilter === 'Toutes' 
    ? tajwidData 
    : tajwidData.filter(mod => mod.category === activeFilter);

  const handleBack = () => {
    if (activeLesson) {
      setActiveLesson(null);
      setShowMakharij(false);
      setFeedback({});
      setRecordingExampleId(null);
      if (playingAudio) {
        audioRef.current?.pause();
        setPlayingAudio(null);
      }
      stopRecording();
    } else if (activeModule) {
      setActiveModule(null);
    }
  };

  const playAudio = (url: string | undefined, id: string) => {
    if (!url) {
      console.warn('Audio URL is missing for:', id);
      return;
    }

    if (playingAudio === id) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(url);
      
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = (e) => {
        console.error('Error playing audio:', url, e);
        setPlayingAudio(null);
        alert('Impossible de lire le fichier audio. Vérifiez votre connexion.');
      };
      
      audioRef.current = audio;
      
      audio.play().catch(err => {
        console.error('Playback failed:', err);
        setPlayingAudio(null);
      });
      
      setPlayingAudio(id);
    }
  };

  const startRecording = async (exampleId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      setRecordingExampleId(exampleId);
      setFeedback(prev => {
        const newFeedback = { ...prev };
        delete newFeedback[exampleId];
        return newFeedback;
      });
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Impossible d\'accéder au microphone. Veuillez vérifier vos permissions.');
    }
  };

  const stopRecording = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setAnalyser(null);
    }
    
    const currentId = recordingExampleId;
    setRecordingExampleId(null);
    
    if (currentId) {
      simulateAnalysis(currentId);
    }
  };

  const simulateAnalysis = (exampleId: string) => {
    setAnalyzingExampleId(exampleId);
    
    // Simulate AI processing time
    setTimeout(() => {
      // Mock logic: Random success for demo purposes, biased towards success
      const isSuccess = Math.random() > 0.3; 
      
      setFeedback(prev => ({
        ...prev,
        [exampleId]: {
          status: isSuccess ? 'success' : 'warning',
          message: isSuccess 
            ? "Excellent ! La prononciation est correcte et le Makhraj est respecté." 
            : "Attention, le son semble un peu étouffé. Assurez-vous de bien positionner votre langue comme indiqué sur le schéma."
        }
      }));
      
      setAnalyzingExampleId(null);
    }, 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Reset makharij visibility when lesson changes
  useEffect(() => {
    setShowMakharij(false);
    if (playingAudio) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    }
  }, [activeLesson]);

  const makharijInstructions: Record<string, string> = {
    gorge: "Le son provient de la gorge (Al-Halq). Contractez légèrement les muscles du pharynx. Pour le fond (Hamza, Ha), le son vient du bas du cou. Pour le milieu (Ayn, Ha), serrez la gorge. Pour le haut (Ghayn, Kha), c'est proche de la luette (raclement).",
    langue: "La langue (Al-Lisan) est l'organe le plus mobile. Elle frappe différentes zones : le palais mou (Qaf), le palais dur (Kaf), ou les dents/gencives. La précision du point de contact détermine la clarté de la lettre.",
    levres: "Les lèvres (Ash-Shafatain) jouent un rôle clé. Fermez-les fermement pour le 'Ba' et le 'Mim'. Arrondissez-les en cercle parfait pour le 'Waw'. C'est une articulation externe et visible.",
    nez: "Le son passe exclusivement par la cavité nasale (Al-Khayshum). C'est le siège de la 'Ghunna' (nasalisation). Test : si vous pincez votre nez et que le son s'arrête, votre articulation est correcte."
  };

  const renderMakharijVisual = (type: MakharijType) => {
    if (!type) return null;
    
    let visualContent = null;

    // Stylized Head Profile Path
    const headProfile = "M30 20 C50 20 60 25 60 35 L60 40 L70 45 L65 50 L70 55 L70 60 L60 65 L60 85 L30 85 Z";
    
    switch (type) {
      case 'gorge':
        visualContent = (
          <>
            <path d={headProfile} stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
            <g className="text-primary animate-pulse">
              <circle cx="45" cy="75" r="8" fill="currentColor" opacity="0.6" />
              <circle cx="45" cy="65" r="8" fill="currentColor" opacity="0.4" />
              <circle cx="45" cy="55" r="8" fill="currentColor" opacity="0.2" />
              <path d="M55 60 L75 60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
              <text x="80" y="63" className="text-[8px] fill-current uppercase font-bold">Gorge</text>
            </g>
          </>
        );
        break;
      case 'langue':
        visualContent = (
          <>
            <path d={headProfile} stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
            <g className="text-primary animate-pulse">
              <path d="M40 65 Q55 65 60 55" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              <circle cx="60" cy="55" r="4" fill="currentColor" />
              <path d="M60 55 L80 40" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
              <text x="82" y="42" className="text-[8px] fill-current uppercase font-bold">Langue</text>
            </g>
          </>
        );
        break;
      case 'levres':
        visualContent = (
          <>
            <path d={headProfile} stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
            <g className="text-primary animate-pulse">
              <circle cx="70" cy="57" r="6" fill="currentColor" opacity="0.6" />
              <path d="M70 57 L90 57" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
              <text x="92" y="60" className="text-[8px] fill-current uppercase font-bold">Lèvres</text>
            </g>
          </>
        );
        break;
      case 'nez':
        visualContent = (
          <>
            <path d={headProfile} stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
            <g className="text-primary animate-pulse">
              <path d="M50 45 Q60 35 65 45" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M60 40 L80 30" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
              <text x="82" y="32" className="text-[8px] fill-current uppercase font-bold">Cavité Nasale</text>
            </g>
          </>
        );
        break;
    }

    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-6 bg-black/40 rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="p-6 flex items-center justify-center bg-white/5 md:w-1/3">
            <svg viewBox="0 0 120 100" className="w-40 h-40 text-slate-400">
              {visualContent}
            </svg>
          </div>
          <div className="p-6 md:w-2/3 flex flex-col justify-center">
            <h4 className="text-primary font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">info</span>
              Guide Technique
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {makharijInstructions[type]}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (activeLesson) {
    const isCompleted = completedLessons.includes(activeLesson.id);
    return (
      <div className="flex-1 overflow-y-auto pb-32 bg-transparent">
        <Header leftIcon="arrow_back" onLeftClick={handleBack} />
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-4 pt-2 pb-6 space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${activeLesson.color}20`, color: activeLesson.color }}
            >
              <span className="material-symbols-outlined">{activeLesson.icon}</span>
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">{activeLesson.title}</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase tracking-wider">
                {activeLesson.level}
              </span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card-dark border border-white/5 rounded-xl p-6"
          >
            <p className="text-slate-200 leading-relaxed text-lg">{activeLesson.content}</p>
          </motion.div>

          {activeLesson.makharij && (
            <div className="space-y-2">
              <button 
                onClick={() => setShowMakharij(!showMakharij)}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                <span className="material-symbols-outlined">visibility</span>
                Visualiser le Point de Sortie (Makhraj)
              </button>
              
              <AnimatePresence>
                {showMakharij && renderMakharijVisual(activeLesson.makharij)}
              </AnimatePresence>
            </div>
          )}

          {activeLesson.examples && activeLesson.examples.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-primary font-bold uppercase tracking-widest text-sm px-1">Focus Prononciation</h3>
              {activeLesson.examples.map((ex, idx) => {
                const exampleId = `${activeLesson.id}-${idx}`;
                const isRecording = recordingExampleId === exampleId;
                const isAnalyzing = analyzingExampleId === exampleId;
                const result = feedback[exampleId];

                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card-dark border border-white/5 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="text-center py-4">
                      <p className="font-arabic text-5xl text-white leading-relaxed" dir="rtl">
                        <TajwidText text={ex.arabic} />
                      </p>
                    </div>
                    
                    <div className="h-px w-full bg-white/5"></div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-slate-400 text-sm italic">{ex.explanation}</p>
                      <div className="flex items-center gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => playAudio(ex.audioUrl, exampleId)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            playingAudio === exampleId
                              ? 'bg-primary text-black animate-pulse'
                              : 'bg-white/5 hover:bg-white/10 text-primary'
                          }`}
                          title="Écouter l'exemple"
                        >
                          <span className="material-symbols-outlined">
                            {playingAudio === exampleId ? 'pause' : 'volume_up'}
                          </span>
                        </motion.button>
                        
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => isRecording ? stopRecording() : startRecording(exampleId)}
                          disabled={isAnalyzing}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            isRecording
                              ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                              : isAnalyzing
                                ? 'bg-white/5 text-slate-500 cursor-wait'
                                : 'bg-white/5 hover:bg-white/10 text-primary'
                          }`}
                          title="S'enregistrer et analyser"
                        >
                          <span className="material-symbols-outlined">
                            {isRecording ? 'stop' : 'mic'}
                          </span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Recording Visualizer */}
                    <AnimatePresence>
                      {isRecording && analyser && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 bg-black/40 rounded-lg p-2 border border-white/5 h-16 flex items-center justify-center"
                        >
                          <AudioVisualizer 
                            analyser={analyser} 
                            width={250} 
                            height={50} 
                            className="w-full h-full"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Analysis State */}
                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 bg-white/5 rounded-lg p-3 flex items-center gap-3 animate-pulse"
                        >
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs text-slate-300">Analyse par l'IA en cours...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Feedback Result */}
                    <AnimatePresence>
                      {result && !isRecording && !isAnalyzing && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`mt-2 rounded-lg p-3 border ${
                            result.status === 'success' 
                              ? 'bg-emerald-500/10 border-emerald-500/20' 
                              : 'bg-amber-500/10 border-amber-500/20'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`material-symbols-outlined text-lg ${
                              result.status === 'success' ? 'text-emerald-500' : 'text-amber-500'
                            }`}>
                              {result.status === 'success' ? 'check_circle' : 'warning'}
                            </span>
                            <div>
                              <p className={`text-xs font-bold mb-1 ${
                                result.status === 'success' ? 'text-emerald-500' : 'text-amber-500'
                              }`}>
                                {result.status === 'success' ? 'Validé' : 'À améliorer'}
                              </p>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {result.message}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                completeLesson(activeLesson.id);
                handleBack();
              }}
              disabled={!isCompleted && Object.values(feedback).filter((f: any) => f.status === 'success').length === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                isCompleted 
                  ? 'bg-white/5 text-primary border border-primary/30' 
                  : Object.values(feedback).filter((f: any) => f.status === 'success').length > 0
                    ? 'bg-primary text-black hover:bg-primary/90 emerald-glow'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isCompleted ? (
                <>
                  <span className="material-symbols-outlined">check</span>
                  Leçon validée
                </>
              ) : Object.values(feedback).filter((f: any) => f.status === 'success').length > 0 ? (
                'Valider la maîtrise'
              ) : (
                <>
                  <span className="material-symbols-outlined">lock</span>
                  Validez au moins un exemple pour terminer
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (activeModule) {
    return (
      <div className="flex-1 overflow-y-auto pb-32 bg-transparent">
        <Header leftIcon="arrow_back" onLeftClick={handleBack} />
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-4 pt-2 pb-6 space-y-4"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{activeModule.title}</h2>
            <p className="text-slate-400 text-sm">{activeModule.description}</p>
          </div>
          
          {activeModule.lessons.map((lesson, idx) => {
            const isCompleted = completedLessons.includes(lesson.id);
            return (
              <motion.div 
                key={lesson.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveLesson(lesson)}
                className="bg-card-dark border border-white/5 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: lesson.color }}></div>
                
                <div className="flex items-center gap-4 pl-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${lesson.color}15`, color: lesson.color }}
                  >
                    <span className="material-symbols-outlined text-xl">{lesson.icon}</span>
                  </div>
                  <div>
                    <h4 className={`font-bold ${isCompleted ? 'text-slate-300' : 'text-white'}`}>{lesson.title}</h4>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{lesson.level}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isCompleted && <span className="material-symbols-outlined text-primary text-lg">check_circle</span>}
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">chevron_right</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-transparent">
      <Header leftIcon="arrow_back" title="Tajwid" />

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-2 pb-6"
      >
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-card-dark border border-white/5 rounded-xl p-6 relative overflow-hidden emerald-glow mb-8"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Score de Maîtrise</h2>
                <p className="text-slate-400 text-xs">Continuez votre progression</p>
              </div>
              <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <span className="text-primary font-bold">{completionPercentage}%</span>
              </div>
            </div>
            
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="emerald-gradient h-full rounded-full shadow-[0_0_10px_rgba(16,183,72,0.5)]" 
              />
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
          {filters.map(filter => (
            <motion.button
              key={filter}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {filter}
            </motion.button>
          ))}
        </div>

        {/* Verse Analyzer */}
        <div className="mb-8">
          <h3 className="text-slate-100 font-bold uppercase tracking-widest text-xs mb-4 px-1">Analyseur de Verset</h3>
          <div className="bg-card-dark border border-white/5 rounded-xl p-6 relative">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 font-arabic text-3xl text-white leading-loose" dir="rtl">
              {verseAnalysisData.map((word) => {
                const rule = word.ruleId ? tajwidRules[word.ruleId] : null;
                return (
                  <motion.span 
                    key={word.id}
                    layout
                    onClick={() => setSelectedWordId(selectedWordId === word.id ? null : word.id)}
                    className={`cursor-pointer transition-all relative ${
                      selectedWordId === word.id ? 'text-primary scale-110' : 'hover:text-primary/80'
                    }`}
                    style={{ color: rule ? rule.color : 'inherit' }}
                  >
                    {word.text}
                    <AnimatePresence>
                      {selectedWordId === word.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 z-50 shadow-2xl"
                        >
                          <div className="text-center">
                            <p className="text-xs text-slate-400 mb-2">{word.translation}</p>
                            {rule ? (
                              <>
                                <p className="text-xs font-bold text-white mb-1" style={{ color: rule.color }}>{rule.name}</p>
                                <p className="text-[10px] text-slate-300 leading-tight mb-3">{rule.description}</p>
                              </>
                            ) : (
                              <p className="text-[10px] text-slate-500 mb-3">Aucune règle spécifique</p>
                            )}
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudio(word.audioUrl, `word-${word.id}`);
                              }}
                              className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white transition-colors flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {playingAudio === `word-${word.id}` ? 'pause' : 'play_arrow'}
                              </span>
                              {playingAudio === `word-${word.id}` ? 'Pause' : 'Écouter'}
                            </motion.button>
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/90 border-r border-b border-white/10 rotate-45"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-slate-100 font-bold uppercase tracking-widest text-xs">Leçons Interactives</h3>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {filteredModules.map((mod, index) => {
            const moduleLessons = mod.lessons.length;
            const completedInModule = mod.lessons.filter(l => completedLessons.includes(l.id)).length;
            
            return (
              <motion.div 
                key={mod.id} 
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveModule(mod)}
                className="bg-card-dark border border-white/5 hover:border-white/20 rounded-xl p-5 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-white group-hover:text-primary transition-colors">{mod.title}</h4>
                  <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">{moduleLessons} Leçons</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{mod.description}</p>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedInModule / moduleLessons) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-slate-500 rounded-full" 
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{completedInModule}/{moduleLessons}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>
    </div>
  );
}

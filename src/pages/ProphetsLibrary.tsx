import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { prophetsData, ProphetStory } from '../data/prophetsData';
import { useProphetsStore } from '../store/useProphetsStore';
import { generateStoryAudio } from '../services/audioService';
import { motion, AnimatePresence } from 'motion/react';

export default function ProphetsLibrary() {
  const navigate = useNavigate();
  const { isStoryCompleted, markStoryAsCompleted } = useProphetsStore();
  
  const [currentStory, setCurrentStory] = useState<ProphetStory | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'reader'>('list');
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  // Ambient Sound URLs (Nature/Atmospheric)
  const AMBIENT_URL = "https://assets.mixkit.co/sfx/preview/mixkit-forest-at-night-with-crickets-and-birds-2486.mp3";
  const CLICK_SFX = "https://assets.mixkit.co/sfx/preview/mixkit-selection-item-selection-2481.mp3";
  const SUCCESS_SFX = "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3";

  const playSfx = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = 0.15;
      if (ambientEnabled) {
        ambientRef.current.play().catch(() => {
          console.log("Ambient autoplay blocked or failed");
          setAmbientEnabled(false);
        });
      } else {
        ambientRef.current.pause();
      }
    }
  }, [ambientEnabled]);

  const handlePlayStory = async (story: ProphetStory) => {
    playSfx(CLICK_SFX);
    if (currentStory?.id === story.id && audioUrl) {
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(false);
      setIsLoadingAudio(true);
      setCurrentStory(story);
      setAudioUrl(null);
      
      const url = await generateStoryAudio(story.storyText);
      if (url) {
        setAudioUrl(url);
        setIsPlaying(true);
      } else {
        alert("Erreur lors de la génération de l'audio. Veuillez réessayer.");
      }
      setIsLoadingAudio(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    const controlPlayback = async () => {
      if (isPlaying) {
        try {
          await audioRef.current?.play();
        } catch (e) {
          console.error("Playback failed:", e instanceof Error ? e.message : String(e));
          setIsPlaying(false);
        }
      } else {
        audioRef.current?.pause();
      }
    };
    controlPlayback();
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
      
      if (current >= duration && duration > 0) {
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      audioRef.current.currentTime = (seekTo / 100) * duration;
      setProgress(seekTo);
    }
  };

  const startQuiz = (story: ProphetStory) => {
    setCurrentStory(story);
    setQuizStep(0);
    setQuizScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowResult(false);
    setShowQuiz(true);
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null || !currentStory) return;
    
    setSelectedOption(optionIndex);
    const correct = optionIndex === currentStory.quiz[quizStep].correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setQuizScore(prev => prev + 1);
      playSfx(SUCCESS_SFX);
      if ('vibrate' in navigator) navigator.vibrate(50);
    }

    setTimeout(() => {
      if (quizStep < currentStory.quiz.length - 1) {
        setQuizStep(prev => prev + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        if (quizScore + (correct ? 1 : 0) === currentStory.quiz.length) {
          markStoryAsCompleted(currentStory.id, currentStory.title);
        }
      }
    }, 1500);
  };

  const openReader = (story: ProphetStory) => {
    playSfx(CLICK_SFX);
    setCurrentStory(story);
    setViewMode('reader');
    if (currentStory?.id !== story.id) {
      handlePlayStory(story);
    }
  };

  const closeReader = () => {
    playSfx(CLICK_SFX);
    setViewMode('list');
  };

  return (
    <div className="flex-1 overflow-y-auto pb-40 bg-[#050505] relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <Header 
        leftIcon="arrow_back" 
        onLeftClick={viewMode === 'reader' ? closeReader : () => navigate('/learn')} 
      />

      {/* Ambient Sound Toggle */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 items-end">
        <button 
          onClick={() => setAmbientEnabled(!ambientEnabled)}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${ambientEnabled ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-slate-500'}`}
        >
          <span className="material-symbols-outlined text-xl">
            {ambientEnabled ? 'volume_up' : 'volume_off'}
          </span>
        </button>
        {!ambientEnabled && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl"
          >
            <p className="text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">Activer l'ambiance</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 pt-4 space-y-12 relative z-10"
          >
            {/* Hero Section - Recipe 2 Style */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-px bg-primary"></span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Bibliothèque Sacrée</span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                Récits des <br />
                <span className="text-primary">Prophètes</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Une immersion sonore et visuelle dans l'histoire de l'humanité. Apprenez, écoutez et méditez.
              </p>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 gap-6">
              {prophetsData.map((story, idx) => {
                const completed = isStoryCompleted(story.id);
                const isCurrent = currentStory?.id === story.id;

                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => openReader(story)}
                    className="relative group cursor-pointer"
                  >
                    <div className="relative h-64 rounded-[2.5rem] overflow-hidden border border-white/10">
                      <img 
                        src={story.illustrationUrl} 
                        alt={story.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      
                      <div className="absolute top-6 right-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 ${isCurrent ? 'bg-primary text-black' : 'bg-black/40 text-white'}`}>
                          <span className="material-symbols-outlined">{story.icon}</span>
                        </div>
                      </div>

                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {completed && (
                                <span className="bg-primary text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Complété</span>
                              )}
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{story.duration} d'écoute</span>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight leading-none">{story.title}</h3>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                            <span className="material-symbols-outlined">arrow_forward</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="reader"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10"
          >
            {currentStory && (
              <div className="flex flex-col min-h-screen">
                {/* Immersive Header Image */}
                <div className="h-[40vh] relative overflow-hidden">
                  <img 
                    src={currentStory.backgroundUrl} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                  
                  <div className="absolute bottom-8 left-6 right-6">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-1 rounded-full border border-primary/20 uppercase tracking-widest">Narration Audio</span>
                        <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">{currentStory.duration}</span>
                      </div>
                      <h2 className="text-5xl font-black text-white tracking-tighter leading-none">{currentStory.title}</h2>
                    </motion.div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="px-6 py-8 space-y-10">
                  {/* Story Text */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-px bg-primary/30"></span>
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Le Récit</h3>
                    </div>
                    <p className="text-xl text-slate-200 leading-relaxed font-serif italic opacity-90">
                      {currentStory.storyText}
                    </p>
                  </div>

                  {/* Lessons Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-px bg-primary/30"></span>
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Enseignements</h3>
                    </div>
                    <div className="grid gap-4">
                      {currentStory.lessons.map((lesson, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary font-black text-xs">0{i+1}</span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{lesson}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quiz CTA */}
                  <div className="pt-8 pb-20">
                    <button 
                      onClick={() => startQuiz(currentStory)}
                      className="w-full py-5 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-outlined">quiz</span>
                      Valider mes connaissances
                    </button>
                  </div>
                </div>

                {/* Floating Audio Player */}
                <div className="fixed bottom-24 left-4 right-4 z-50">
                  <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center gap-4">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shrink-0 shadow-lg shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {isLoadingAudio ? 'hourglass_top' : (isPlaying ? 'pause' : 'play_arrow')}
                      </span>
                    </button>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[150px]">{currentStory.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {audioRef.current ? `${Math.floor(audioRef.current.currentTime / 60)}:${Math.floor(audioRef.current.currentTime % 60).toString().padStart(2, '0')}` : '0:00'}
                        </span>
                      </div>
                      <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={progress} 
                          onChange={handleSeek}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Elements */}
      {audioUrl && (
        <audio 
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <audio 
        ref={ambientRef}
        src={AMBIENT_URL}
        loop
      />

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && currentStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !showResult && setShowQuiz(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 overflow-hidden"
            >
              {!showResult ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Question {quizStep + 1} sur {currentStory.quiz.length}</p>
                      <h4 className="text-xl font-bold text-white tracking-tight">{currentStory.title}</h4>
                    </div>
                    <button onClick={() => setShowQuiz(false)} className="text-slate-500 hover:text-white">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-slate-200 leading-relaxed">
                      {currentStory.quiz[quizStep].question}
                    </h3>

                    <div className="space-y-3">
                      {currentStory.quiz[quizStep].options.map((option, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrectAnswer = idx === currentStory.quiz[quizStep].correctIndex;
                        
                        let bgColor = 'bg-white/5 border-white/10';
                        if (isSelected) {
                          bgColor = isCorrect ? 'bg-primary/20 border-primary/50' : 'bg-red-500/20 border-red-500/50';
                        }

                        return (
                          <button
                            key={idx}
                            disabled={selectedOption !== null}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all duration-300 flex items-center justify-between ${bgColor} ${selectedOption === null ? 'hover:bg-white/10' : ''}`}
                          >
                            <span className={isSelected ? (isCorrect ? 'text-primary' : 'text-red-400') : 'text-slate-300'}>
                              {option}
                            </span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-lg">
                                {isCorrect ? 'check_circle' : 'cancel'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-8 py-4">
                  <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${quizScore === currentStory.quiz.length ? 'bg-primary/20 border-2 border-primary/50 emerald-glow' : 'bg-white/5 border-2 border-white/10'}`}>
                    <span className={`material-symbols-outlined text-5xl ${quizScore === currentStory.quiz.length ? 'text-primary' : 'text-slate-500'}`}>
                      {quizScore === currentStory.quiz.length ? 'workspace_premium' : 'sentiment_dissatisfied'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {quizScore === currentStory.quiz.length ? 'Félicitations !' : 'Presque...'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Vous avez obtenu un score de <span className="text-white font-bold">{quizScore} / {currentStory.quiz.length}</span>.
                    </p>
                  </div>

                  {quizScore === currentStory.quiz.length && (
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-2">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Badge Débloqué</p>
                      <p className="text-white font-bold text-sm">Gardien de l'histoire de {currentStory.title}</p>
                    </div>
                  )}

                  <button 
                    onClick={() => setShowQuiz(false)}
                    className="w-full py-4 rounded-2xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    {quizScore === currentStory.quiz.length ? 'Terminer' : 'Réessayer'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

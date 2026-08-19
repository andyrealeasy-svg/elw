import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  ChevronRight, 
  ChevronLeft,
  Swords, 
  HelpCircle, 
  MessageSquare, 
  Lock, 
  CheckCircle2, 
  Gem, 
  Zap, 
  Sparkles, 
  Flame, 
  Award, 
  ScrollText, 
  Play, 
  Volume2,
  List
} from 'lucide-react';
import { PlayerProfile, StoryChapter, StoryStage } from '../types';
import { STORY_CHAPTERS, getCharSplash, getCharEmoji } from '../data';

interface Props {
  profile: PlayerProfile;
  updateProfile: (updater: (p: PlayerProfile) => PlayerProfile) => void;
  onBack: () => void;
  onStartStage: (stage: StoryStage) => void;
}

export default function StoryMenu({ profile, updateProfile, onBack, onStartStage }: Props) {
  const storyProgress = profile.storyProgress || { unlockedChapters: ['chap1'], completedStages: [] };

  const isStageCompleted = (stageId: string) => (storyProgress.completedStages || []).includes(stageId);
  
  const isChapterUnlocked = (chapterId: string) => {
    if (chapterId === 'chap1') return true;
    if ((storyProgress.unlockedChapters || []).includes(chapterId)) return true;

    // Dynamically unlock if prior chapter is completed
    const chapIndex = STORY_CHAPTERS.findIndex(c => c.id === chapterId);
    if (chapIndex > 0) {
      const prevChapter = STORY_CHAPTERS[chapIndex - 1];
      const allPrevDone = prevChapter.stages.every(s => (storyProgress.completedStages || []).includes(s.id));
      if (allPrevDone) return true;
    }
    return false;
  };

  // Find the active chapter: the first unlocked chapter that has incomplete stages, or the last unlocked chapter
  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(() => {
    const activeChap = STORY_CHAPTERS.find(c => {
      const unlocked = isChapterUnlocked(c.id);
      const hasIncomplete = c.stages.some(s => !isStageCompleted(s.id));
      return unlocked && hasIncomplete;
    });
    return activeChap || STORY_CHAPTERS[0];
  });
  const [selectedStage, setSelectedStage] = useState<StoryStage | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState<number>(0);
  const [showFullDialogueLog, setShowFullDialogueLog] = useState<boolean>(false);
  const [riddleAnswer, setRiddleAnswer] = useState<number | null>(null);
  const [showRiddleFeedback, setShowRiddleFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleStageClick = (stage: StoryStage) => {
    if (stage.type === 'DIALOGUE') {
      setSelectedStage(stage);
      setDialogueIndex(0);
      setShowFullDialogueLog(false);
    } else if (stage.type === 'RIDDLE') {
      setSelectedStage(stage);
      setRiddleAnswer(null);
      setShowRiddleFeedback(null);
      setShowHint(false);
    } else {
      onStartStage(stage);
    }
  };

  const completeNonBattleStage = (stage: StoryStage) => {
    updateProfile(p => {
      const progress = p.storyProgress || { unlockedChapters: ['chap1'], completedStages: [] };
      const completedStages = progress.completedStages.includes(stage.id)
        ? progress.completedStages
        : [...progress.completedStages, stage.id];

      const unlockedChapters = new Set(progress.unlockedChapters || ['chap1']);
      unlockedChapters.add('chap1');

      const chap1 = STORY_CHAPTERS.find(c => c.id === 'chap1');
      if (chap1 && chap1.stages.every(s => completedStages.includes(s.id))) {
        unlockedChapters.add('chap2');
      }
      const chap2 = STORY_CHAPTERS.find(c => c.id === 'chap2');
      if (chap2 && chap2.stages.every(s => completedStages.includes(s.id))) {
        unlockedChapters.add('chap3');
      }

      return {
        ...p,
        gems: p.gems + (stage.reward.gems || 0),
        gold: p.gold + (stage.reward.gold || 0),
        heroExp: p.heroExp + (stage.reward.exp || 0),
        storyProgress: {
          unlockedChapters: Array.from(unlockedChapters),
          completedStages
        }
      };
    });
    setSelectedStage(null);
  };

  const handleRiddleSubmit = (stage: StoryStage, index: number) => {
    setRiddleAnswer(index);
    if (index === stage.riddle?.correctIndex) {
      setShowRiddleFeedback('CORRECT');
      setTimeout(() => completeNonBattleStage(stage), 1200);
    } else {
      setShowRiddleFeedback('WRONG');
      setTimeout(() => setShowRiddleFeedback(null), 900);
    }
  };

  // Helper for speaker aura color & char mapping
  const getSpeakerMetadata = (speakerName: string, charId?: string) => {
    const id = charId || speakerName.toLowerCase();
    const splash = getCharSplash(id);
    const emoji = getCharEmoji(id);

    let color = 'from-amber-500 to-orange-500 text-amber-300 border-amber-500/40';
    if (['selina', 'asher', 'blaze', 'ineffa'].includes(id)) {
      color = 'from-rose-500 to-red-600 text-rose-300 border-rose-500/40';
    } else if (['krona', 'glacier'].includes(id)) {
      color = 'from-cyan-500 to-blue-600 text-cyan-300 border-cyan-500/40';
    } else if (['zephyr', 'selva', 'spark', 'pulse'].includes(id)) {
      color = 'from-yellow-400 to-amber-500 text-yellow-300 border-yellow-500/40';
    } else if (['maestro', 'neuron', 'raven'].includes(id)) {
      color = 'from-purple-500 to-indigo-600 text-purple-300 border-purple-500/40';
    } else if (['fenris', 'aelita', 'gaia'].includes(id)) {
      color = 'from-emerald-500 to-teal-600 text-emerald-300 border-emerald-500/40';
    } else if (['aurum', 'moyan'].includes(id)) {
      color = 'from-amber-600 to-yellow-700 text-amber-300 border-amber-500/40';
    }

    return { splash, emoji, color };
  };

  const totalCompletedStages = storyProgress.completedStages.length;
  const totalStagesInAllChapters = STORY_CHAPTERS.reduce((acc, c) => acc + c.stages.length, 0);

  return (
    <div className="w-full max-w-6xl h-[90vh] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
      {/* Top Bar Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Book className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase">Летопись Мира</h2>
            <p className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span>Сюжетная Сага</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">Прогресс: {totalCompletedStages} / {totalStagesInAllChapters}</span>
            </p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all active:scale-95 border border-slate-700 text-xs sm:text-sm"
        >
          Назад в Хаб
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chapter Selection Column */}
        <div className="w-full md:w-80 border-b-2 md:border-b-0 md:border-r border-slate-900 bg-slate-900/30 p-3 sm:p-4 overflow-y-auto shrink-0 max-h-[35vh] md:max-h-none space-y-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">Хроники и Главы</h3>
            <span className="text-[10px] font-mono text-amber-500">3 ГЛАВЫ</span>
          </div>

          <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
            {STORY_CHAPTERS.map((chapter, index) => {
              const unlocked = isChapterUnlocked(chapter.id);
              const completedCount = chapter.stages.filter(s => isStageCompleted(s.id)).length;
              const isAllDone = completedCount === chapter.stages.length;
              const isSelected = selectedChapter?.id === chapter.id;

              return (
                <button
                  key={chapter.id}
                  onClick={() => unlocked && setSelectedChapter(chapter)}
                  disabled={!unlocked}
                  className={`min-w-[200px] md:min-w-0 text-left p-3.5 rounded-xl border-2 transition-all relative overflow-hidden group shrink-0 ${
                    isSelected
                      ? 'border-amber-500 bg-gradient-to-br from-amber-500/15 to-slate-900 shadow-lg shadow-amber-500/10'
                      : unlocked 
                        ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/80' 
                        : 'border-slate-900 bg-slate-950/60 opacity-50 grayscale cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                      ГЛАВА {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      {!unlocked && <Lock className="w-3 h-3 text-slate-600" />}
                      {unlocked && isAllDone && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-950/60 px-1.5 py-0.5 rounded border border-green-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Пройдена
                        </span>
                      )}
                      {unlocked && !isAllDone && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {completedCount}/{chapter.stages.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                    {chapter.title}
                  </h4>
                  {chapter.subtitle && (
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {chapter.subtitle}
                    </p>
                  )}

                  <div className="mt-3 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" 
                      style={{ width: `${(completedCount / chapter.stages.length) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Chapter Stages Column */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-950/60 flex flex-col">
          {selectedChapter ? (
            <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto w-full pb-10">
              {/* Chapter Banner */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-slate-800 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-widest mb-1 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{selectedChapter.subtitle || 'Сюжетная хроника'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black italic text-white mb-2">
                  {selectedChapter.title}
                </h3>
                <p className="text-slate-300 font-mono text-xs sm:text-sm leading-relaxed max-w-2xl">
                  {selectedChapter.description}
                </p>
              </div>

              {/* Stage Cards */}
              <div className="space-y-2.5 sm:space-y-3">
                {selectedChapter.stages.map((stage, idx) => {
                  const completed = isStageCompleted(stage.id);
                  const previousStage = idx > 0 ? selectedChapter.stages[idx - 1] : null;
                  const unlocked = !previousStage || isStageCompleted(previousStage.id);

                  let typeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
                  let typeLabel = 'ДИАЛОГ';
                  if (stage.type === 'BATTLE') {
                    typeColor = stage.isBoss 
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/40' 
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                    typeLabel = stage.isBoss ? 'БОСС БОЙ' : 'БОЙ';
                  } else if (stage.type === 'RIDDLE') {
                    typeColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
                    typeLabel = 'ЗАГАДКА';
                  }

                  return (
                    <div 
                      key={stage.id}
                      className={`relative p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                        unlocked 
                          ? 'border-slate-800/90 bg-slate-900/70 group cursor-pointer hover:border-amber-500/40 hover:bg-slate-800/70' 
                          : 'border-slate-900 bg-slate-950/40 opacity-40 cursor-not-allowed'
                      }`}
                      onClick={() => unlocked && handleStageClick(stage)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        {/* Icon */}
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shrink-0 ${
                          completed 
                            ? 'bg-green-500/10 border-green-500/40 text-green-400' 
                            : unlocked 
                              ? typeColor 
                              : 'bg-slate-950 border-slate-900 text-slate-700'
                        }`}>
                          {stage.type === 'BATTLE' && <Swords className="w-5 h-5" />}
                          {stage.type === 'RIDDLE' && <HelpCircle className="w-5 h-5" />}
                          {stage.type === 'DIALOGUE' && <MessageSquare className="w-5 h-5" />}
                        </div>

                        {/* Title & Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${typeColor}`}>
                              {typeLabel}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold">
                              УР. {stage.level}
                            </span>
                            <h5 className="font-bold text-sm sm:text-base text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                              {stage.name}
                            </h5>
                            {completed && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-400 font-mono line-clamp-1 mt-0.5">
                            {stage.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Action & Rewards Preview */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-2">
                          {stage.reward.gems && (
                            <span className="text-xs text-pink-400 font-bold flex items-center gap-1 bg-pink-950/40 px-2 py-1 rounded border border-pink-500/30">
                              <Gem className="w-3 h-3" />+{stage.reward.gems}
                            </span>
                          )}
                          {stage.reward.exp && (
                            <span className="text-xs text-cyan-400 font-bold flex items-center gap-1 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30">
                              <Zap className="w-3 h-3" />+{stage.reward.exp} EXP
                            </span>
                          )}
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${unlocked ? 'text-slate-500 group-hover:translate-x-1 group-hover:text-amber-400' : 'text-slate-800'}`} />
                      </div>

                      {!unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl backdrop-blur-[1px]">
                          <Lock className="w-4 h-4 text-slate-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* All Stages in Chapter Completed Banner */}
              {selectedChapter.stages.every(s => isStageCompleted(s.id)) && (() => {
                const currentIdx = STORY_CHAPTERS.findIndex(c => c.id === selectedChapter.id);
                const nextChapter = currentIdx < STORY_CHAPTERS.length - 1 ? STORY_CHAPTERS[currentIdx + 1] : null;
                
                if (nextChapter) {
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 border-2 border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-amber-500/10"
                    >
                      <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                          <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span>Глава {currentIdx + 1} завершена!</span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-0.5">
                            Разблокирована {nextChapter.title}
                          </h4>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedChapter(nextChapter)}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 shrink-0"
                      >
                        <span>Перейти к Главе {currentIdx + 2}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-green-950/30 border border-green-500/40 text-center flex items-center justify-center gap-2 text-green-300 font-mono text-xs sm:text-sm font-bold"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span>Все доступные сюжетные хроники успешно завершены! Ждите новых обновлений.</span>
                    </motion.div>
                  );
                }
              })()}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-700">
              <Book className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-mono uppercase tracking-widest text-sm">Выберите главу для начала</p>
            </div>
          )}
        </div>
      </div>

      {/* Visual Novel Dialogue & Riddle Modal */}
      <AnimatePresence>
        {selectedStage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden shadow-amber-500/10 flex flex-col max-h-[85vh]"
            >
              {/* DIALOGUE STAGE OVERLAY */}
              {selectedStage.type === 'DIALOGUE' && selectedStage.dialogue && (
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Dialogue Header */}
                  <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <h3 className="font-black text-sm sm:text-base text-white uppercase tracking-tight">
                        {selectedStage.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFullDialogueLog(!showFullDialogueLog)}
                        className={`px-2.5 py-1 rounded text-xs font-mono border transition-all flex items-center gap-1 ${
                          showFullDialogueLog 
                            ? 'bg-blue-600 text-white border-blue-400' 
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>{showFullDialogueLog ? 'Интерактив' : 'Весь лог'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dialogue Content */}
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    {showFullDialogueLog ? (
                      /* Full Script View */
                      <div className="space-y-4">
                        {selectedStage.dialogue.map((line, i) => {
                          const meta = getSpeakerMetadata(line.speaker, line.charId);
                          return (
                            <div key={i} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-base">{meta.emoji}</span>
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">{line.speaker}</span>
                              </div>
                              <p className="text-slate-300 font-mono text-sm leading-relaxed">{line.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Visual Novel Step-by-Step Interactive View */
                      (() => {
                        const currentLine = selectedStage.dialogue[dialogueIndex];
                        const meta = getSpeakerMetadata(currentLine.speaker, currentLine.charId);
                        const isLastLine = dialogueIndex === selectedStage.dialogue.length - 1;

                        return (
                          <div className="flex flex-col items-center justify-between min-h-[320px] space-y-4">
                            {/* Speaker Header Card */}
                            <div className="w-full flex items-center gap-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                              {meta.splash ? (
                                <img 
                                  src={meta.splash} 
                                  alt={currentLine.speaker} 
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-amber-500/40 shadow-md shrink-0" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl border-2 border-slate-700 shrink-0">
                                  {meta.emoji}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wide">
                                    {currentLine.speaker}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    Реплика {dialogueIndex + 1} / {selectedStage.dialogue?.length}
                                  </span>
                                </div>
                                <div className="mt-1 h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-500 transition-all duration-300"
                                    style={{ width: `${((dialogueIndex + 1) / (selectedStage.dialogue?.length || 1)) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Speech Bubble */}
                            <div className="w-full flex-1 p-5 sm:p-6 bg-slate-950 rounded-2xl border border-slate-800 relative flex items-center">
                              <p className="text-slate-200 text-sm sm:text-base font-mono leading-relaxed italic">
                                "{currentLine.text}"
                              </p>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* Dialogue Footer Controls */}
                  <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDialogueIndex(prev => Math.max(0, prev - 1))}
                        disabled={dialogueIndex === 0 || showFullDialogueLog}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" /> Назад
                      </button>
                      <button
                        onClick={() => setDialogueIndex((selectedStage.dialogue?.length || 1) - 1)}
                        disabled={showFullDialogueLog || dialogueIndex === (selectedStage.dialogue?.length || 1) - 1}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-mono rounded-lg text-xs transition-all"
                      >
                        Пропустить
                      </button>
                    </div>

                    {dialogueIndex < (selectedStage.dialogue.length - 1) && !showFullDialogueLog ? (
                      <button
                        onClick={() => setDialogueIndex(prev => prev + 1)}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg shadow-blue-500/20"
                      >
                        <span>Далее</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => completeNonBattleStage(selectedStage)}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg shadow-green-500/20"
                      >
                        <span>Завершить и Получить Награду</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* RIDDLE STAGE OVERLAY */}
              {selectedStage.type === 'RIDDLE' && (
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <HelpCircle className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{selectedStage.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mb-6">
                    Выберите правильный ответ, чтобы открыть врата дальше
                  </p>
                  
                  <div className="p-5 sm:p-6 bg-slate-950 rounded-2xl border border-slate-800 mb-6 text-center shadow-inner">
                    <p className="text-base sm:text-lg text-amber-200 italic font-serif leading-relaxed">
                      "{selectedStage.riddle?.question}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 mb-6">
                    {selectedStage.riddle?.options.map((option, i) => {
                      const isCorrect = i === selectedStage.riddle?.correctIndex;
                      const isSelected = riddleAnswer === i;
                      
                      let btnStyle = 'bg-slate-800/80 border-slate-700 hover:border-amber-500/60 hover:bg-slate-800 text-slate-200';
                      if (showRiddleFeedback && isSelected) {
                        btnStyle = showRiddleFeedback === 'CORRECT' 
                          ? 'bg-green-600 border-green-400 text-white animate-pulse' 
                          : 'bg-red-600 border-red-400 text-white';
                      }

                      return (
                        <button
                          key={i}
                          disabled={showRiddleFeedback !== null}
                          onClick={() => handleRiddleSubmit(selectedStage, i)}
                          className={`w-full p-3.5 text-left rounded-xl border-2 font-bold transition-all text-xs sm:text-sm ${btnStyle}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showRiddleFeedback && isCorrect && isSelected && <CheckCircle2 className="w-5 h-5 text-green-200" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs font-mono text-amber-400 hover:text-amber-300 underline"
                    >
                      {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
                    </button>
                    <button 
                      onClick={() => setSelectedStage(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-all"
                    >
                      Отмена
                    </button>
                  </div>

                  {showHint && selectedStage.riddle?.hint && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="mt-3 p-3 bg-amber-950/40 rounded-lg border border-amber-500/30 text-amber-300 font-mono text-xs"
                    >
                      Подсказка: {selectedStage.riddle.hint}
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

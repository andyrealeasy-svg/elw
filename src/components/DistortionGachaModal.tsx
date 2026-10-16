import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, CheckCircle2, Zap, User, Gem, Award } from 'lucide-react';
import { characterBlueprints, charRarity, getCharSplash } from '../data';
import { cn } from '../lib/utils';
import { CosmicComet } from './CosmicComet';

interface DistortionGachaModalProps {
  charId: string;
  level: number;
  isNew: boolean;
  constellation: number;
  isMaxConstellation?: boolean;
  onComplete: () => void;
}

export const DistortionGachaModal: React.FC<DistortionGachaModalProps> = ({
  charId,
  level,
  isNew,
  constellation,
  isMaxConstellation = false,
  onComplete
}) => {
  const [stage, setStage] = useState<'METEOR' | 'FLASH' | 'REVEAL'>('METEOR');

  const charBlueprint = characterBlueprints[charId]?.('temp', 1, 0);
  const charName = charBlueprint?.name || charId;
  const element = charBlueprint?.element || 'Physical';
  const splash = getCharSplash(charId);

  const handleImpact = () => {
    setStage('FLASH');
    setTimeout(() => setStage('REVEAL'), 180);
  };

  const handleSkip = () => {
    setStage('FLASH');
    setTimeout(() => setStage('REVEAL'), 100);
  };

  const getElementColor = (el: string) => {
    switch (el) {
      case 'Pyro': return 'text-orange-400 bg-orange-950/60 border-orange-500/50';
      case 'Hydro': return 'text-blue-400 bg-blue-950/60 border-blue-500/50';
      case 'Cryo': return 'text-cyan-300 bg-cyan-950/60 border-cyan-500/50';
      case 'Electro': return 'text-purple-400 bg-purple-950/60 border-purple-500/50';
      case 'Dendro': return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50';
      case 'Geo': return 'text-amber-400 bg-amber-950/60 border-amber-500/50';
      default: return 'text-slate-300 bg-slate-900/60 border-slate-500/50';
    }
  };

  const isAlreadyMax = isMaxConstellation || constellation > 6 || (constellation === 6 && isMaxConstellation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden font-sans">
      {/* 1. Realistic Cosmic Comet Falling Phase */}
      {stage === 'METEOR' && (
        <CosmicComet 
          theme="DISTORTION"
          subtitle={`Призыв из Искажения • Награда Ур. ${level}`}
          onImpact={handleImpact}
          onSkip={handleSkip}
        />
      )}

      {/* 2. Radiant Supernova Flash */}
      {stage === 'FLASH' && (
        <motion.div 
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white z-50 pointer-events-none"
        />
      )}

      {/* 3. Character Reveal Phase */}
      {stage === 'REVEAL' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-10 z-40 bg-[#06070d] overflow-y-auto"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,_rgba(147,51,234,0.18)_0%,_transparent_65%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_rgba(6,182,212,0.12)_0%,_transparent_55%)]"></div>
          </div>

          {/* Top Header Banner */}
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="z-10 flex flex-col items-center text-center mt-1 sm:mt-2"
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-black tracking-widest uppercase mb-1.5 sm:mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Награда Уровня {level} • Искажение</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.3 }}
                >
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-blue-400 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Showcase: Splash Art */}
          <div className="relative z-10 my-auto flex flex-col items-center max-w-xl w-full py-2">
            {splash ? (
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] bg-[#0d0f18] group max-h-[42vh] sm:max-h-none"
              >
                <img 
                  src={splash} 
                  alt={charName}
                  className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06070d] via-[#06070d]/30 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#06070d]/60 via-transparent to-transparent"></div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-900/60 to-indigo-950/80 border-2 border-purple-500/40 flex items-center justify-center shadow-2xl mb-2 sm:mb-4"
              >
                <User className="w-20 h-20 sm:w-24 sm:h-24 text-purple-300" />
              </motion.div>
            )}

            {/* Character Identity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-3 sm:mt-6 flex flex-col items-center text-center"
            >
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <span className={cn("text-xs font-black uppercase px-2.5 py-0.5 rounded-md border", getElementColor(element))}>
                  {element}
                </span>
                <span className="flex items-center gap-1 text-xs font-black uppercase px-2.5 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/40 text-blue-300">
                  <span>B-Ранг</span>
                  <div className="flex">
                    <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                    <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                    <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                  </div>
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black italic tracking-tight text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                {charName}
              </h2>

              <div className="mt-2 sm:mt-3">
                {isNew ? (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-xs uppercase tracking-wider animate-pulse">
                    <CheckCircle2 className="w-4 h-4" />
                    Новый персонаж открыт!
                  </span>
                ) : isAlreadyMax ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Макс. созвездие (C6) уже получено!
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 font-mono text-xs font-bold">
                      +80 <Gem className="w-3 h-3 text-pink-400" /> возврат
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 font-black text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-purple-400" />
                    Созвездие повышено: C{Math.min(6, constellation)}
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Confirm Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="z-10 w-full max-w-sm mt-2 sm:mt-4 mb-2"
          >
            <button
              onClick={onComplete}
              className="w-full py-3.5 sm:py-4 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:via-indigo-400 hover:to-cyan-400 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              Принять в отряд
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};


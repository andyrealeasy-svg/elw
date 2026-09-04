import React, { useState, useImperativeHandle, forwardRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "../lib/utils";

export interface EffectsOverlayRef {
  addFloatText: (targetUid: string, text: string, color: string) => void;
  playEffect: (targetUid: string, type: string) => void;
}

export const EffectsOverlay = memo(forwardRef<EffectsOverlayRef, { unitId: string }>((props, ref) => {
  const [floatingTexts, setFloatingTexts] = useState<{ id: string, text: string, color: string }[]>([]);
  const [visualEffects, setVisualEffects] = useState<{ id: string, type: string }[]>([]);

  useImperativeHandle(ref, () => ({
    addFloatText: (targetUid: string, text: string, color: string) => {
      if (targetUid !== props.unitId) return;
      const id = Math.random().toString();
      setFloatingTexts(prev => [...prev, { id, text, color }]);
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 1500);
    },
    playEffect: (targetUid: string, type: string) => {
      if (targetUid !== props.unitId) return;
      const id = Math.random().toString();
      setVisualEffects(prev => [...prev, { id, type }]);
      const duration = type.includes("ultimate") ? 2000 : 1000;
      setTimeout(() => {
        setVisualEffects(prev => prev.filter(ve => ve.id !== id));
      }, duration);
    }
  }));

  return (
    <>
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-40 overflow-visible">
        {visualEffects.map((ve) => (
          <React.Fragment key={ve.id}>
            {ve.type === "Physical" && <motion.div initial={{scale:0, rotate: -45}} animate={{scale:[0, 2, 0], opacity:[1,1,0]}} transition={{duration: 0.4}} className="absolute text-4xl">⚔️</motion.div>}
            {ve.type === "Hydro" && <motion.div initial={{scale:0}} animate={{scale:[0, 3, 1], opacity:[0,1,0]}} transition={{duration: 0.5}} className="absolute text-blue-500 text-6xl opacity-80 ">🌊</motion.div>}
            {ve.type === "Pyro" && <motion.div initial={{scale:0}} animate={{scale:[0.5, 3.5, 1], opacity:[0,1,0]}} transition={{duration: 0.5}} className="absolute text-red-500 text-7xl ">🔥</motion.div>}
            {ve.type === "Electro" && <motion.div initial={{scale:0, rotate: 15}} animate={{scale:[1, 4.5, 1.5], opacity:[0,1,0]}} transition={{duration: 0.4}} className="absolute text-purple-400 text-7xl  ">⚡</motion.div>}
            {ve.type === "Cryo" && <motion.div initial={{scale:0, rotate: -25}} animate={{scale:[1, 3.5, 1], opacity:[0,1,0]}} transition={{duration: 0.5}} className="absolute text-cyan-200 text-6xl ">❄️</motion.div>}
            {ve.type === "Dendro" && <motion.div initial={{scale:0}} animate={{scale:[0, 2.5, 1], opacity:[0,1,0]}} transition={{duration: 0.5}} className="absolute text-green-400 text-6xl">🌿</motion.div>}
            {ve.type === "Geo" && <motion.div initial={{y:-100, opacity:0}} animate={{y:0, opacity:[0, 1, 0], scale:[1,1, 2]}} transition={{duration: 0.6}} className="absolute text-orange-500 text-8xl ">☄️</motion.div>}
            
            {ve.type === "selina_rose" && (
              <motion.div initial={{ scale: 0, rotate: 180 }} animate={{ scale: [0, 4, 3, 0], rotate: [180, 0, -10, 0], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.2 }} className="absolute flex items-center justify-center">
                <span className="text-8xl  ">🌹</span>
                <motion.div animate={{ scale: [1, 2], opacity: [0, 0.5, 0] }} transition={{ duration: 0.6, repeat: 2 }} className="absolute w-32 h-32 rounded-full border-4 border-rose-500/30 " />
              </motion.div>
            )}
            {ve.type === "asher_nature" && (
                <motion.div className="absolute flex items-center justify-center">
                  <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: [0, 5, 0], y: [50, 0, -20] }} transition={{ duration: 0.8 }} className="absolute text-8xl  opacity-20">⚒️</motion.div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 4, 0], rotate: 360 }} transition={{ duration: 1 }} className="absolute text-7xl">🌳</motion.div>
                  {[...Array(4)].map((_, i) => (
                    <motion.div key={i} initial={{ x: 0, y: 0 }} animate={{ x: Math.sin(i*45) * 90, y: Math.cos(i*45) * 90, opacity: [1, 0], scale: [1, 0] }} transition={{ duration: 0.6, delay: i * 0.05 }} className="absolute text-xl">🌱</motion.div>
                  ))}
                </motion.div>
            )}
            {ve.type === "krona_ice" && (
                <motion.div className="absolute flex items-center justify-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 6, 4.5, 0], rotate: 45 }} transition={{ duration: 1 }} className="absolute text-8xl ">❄️</motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.4, 0], scale: [1, 2] }} transition={{ duration: 0.5 }} className="absolute w-40 h-40 bg-cyan-400/20 rounded-full " />
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={i} initial={{ x: 0, y: 0 }} animate={{ x: Math.sin(i*60) * 110, y: Math.cos(i*60) * 110, opacity: [1, 0], scale: [1.2, 0.5], rotate: 180 }} transition={{ duration: 0.7, delay: i * 0.05 }} className="absolute text-lg">💎</motion.div>
                  ))}
                </motion.div>
            )}
            {ve.type === "ultimate_aoe" && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 10, 15], opacity: [0, 0.4, 0] }} transition={{ duration: 1 }} className="absolute w-20 h-20 bg-white rounded-full  z-[60]" />
            )}
            {ve.type === "heal" && <motion.div initial={{y:20, opacity:0}} animate={{y:-50, opacity:[0, 1, 0]}} transition={{duration: 0.8}} className="absolute text-6xl">💚</motion.div>}
            {ve.type === "shield" && <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:2.5, opacity:[0, 0.8, 0]}} transition={{duration: 0.5}} className="absolute text-emerald-300 text-7xl opacity-50">🛡️</motion.div>}
            {ve.type === "buff" && <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:2, opacity:[0, 1, 0]}} transition={{duration: 0.6}} className="absolute text-yellow-300 text-6xl">✨</motion.div>}
            {ve.type === "kairen_frost" && (
                <motion.div className="absolute flex items-center justify-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 6, 4.5, 0], rotate: 45 }} transition={{ duration: 1 }} className="absolute text-8xl ">❄️</motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.4, 0], scale: [1, 2] }} transition={{ duration: 0.5 }} className="absolute w-40 h-40 bg-cyan-400/20 rounded-full " />
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={i} initial={{ x: 0, y: 0 }} animate={{ x: Math.sin(i*60) * 110, y: Math.cos(i*60) * 110, opacity: [1, 0], scale: [1.2, 0.5], rotate: 180 }} transition={{ duration: 0.7, delay: i * 0.05 }} className="absolute text-lg">💎</motion.div>
                  ))}
                </motion.div>
            )}            {ve.type === "aveline_nature" && (
                <motion.div className="absolute flex items-center justify-center">
                  <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: [0, 5, 0], y: [50, 0, -20] }} transition={{ duration: 0.8 }} className="absolute text-8xl  opacity-20">💧</motion.div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 4, 0], rotate: 360 }} transition={{ duration: 1 }} className="absolute text-7xl">🌸</motion.div>
                  {[...Array(5)].map((_, i) => (
                    <motion.div key={i} initial={{ x: 0, y: 0 }} animate={{ x: Math.sin(i*72) * 100, y: Math.cos(i*72) * 100, opacity: [1, 0], scale: [1, 0] }} transition={{ duration: 0.6, delay: i * 0.05 }} className="absolute text-xl">🌺</motion.div>
                  ))}
                </motion.div>
            )}            {ve.type === "hit" && <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 2, 0], opacity: [1, 1, 0] }} transition={{ duration: 0.3 }} className="absolute text-6xl">💥</motion.div>}
          </React.Fragment>
        ))}
      </div>
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center z-50">
        {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.9], y: [10, -20, -40, -60] }}
              transition={{ duration: 1.2, times: [0, 0.1, 0.8, 1], ease: "easeOut" }}
              className={cn("absolute font-black text-lg sm:text-2xl  whitespace-nowrap", ft.color)} 
              style={{ textShadow: "0 2px 4px rgba(0,0,0,1)" }}>
              {ft.text}
            </motion.div>
        ))}
      </div>
    </>
  );
}));

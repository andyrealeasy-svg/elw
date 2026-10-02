import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface UltimateAftermathData {
  charId: string;
  charName: string;
  element: string;
  skillName: string;
  title: string;
  timestamp: number;
}

export const UltimateAftermathField: React.FC<{
  aftermath: UltimateAftermathData | null;
}> = React.memo(({ aftermath }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-15">
      <AnimatePresence>
        {aftermath && (
          <motion.div
            key={`aftermath-action-${aftermath.charId}-${aftermath.timestamp}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(4px)' }}
            transition={{ 
              duration: 0.25,
              ease: "easeOut"
            }}
            className="absolute inset-0"
          >
            
            {/* 1. VOLTA: High-Voltage Lightning Ground Burst & Plasma Shockwave */}
            {aftermath.charId === 'volta' && (
              <div className="absolute inset-0">
                {/* Rapid expanding high-voltage shockwave */}
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full border-4 border-yellow-300 shadow-[0_0_35px_rgba(253,224,71,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-28 rounded-full border-2 border-purple-400 shadow-[0_0_30px_rgba(192,132,252,1)]"
                />
                {/* Ground lightning arcs */}
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-yellow-500/35 via-purple-900/25 to-transparent" />
                <div className="absolute bottom-6 left-4 right-4 h-[3px] bg-gradient-to-r from-transparent via-yellow-300 to-transparent shadow-[0_0_20px_rgba(253,224,71,1)]" />
                {/* Fast explosive electric sparks */}
                <motion.div 
                  initial={{ y: 20, x: -60, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, x: -120, scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-12 left-1/3 text-2xl text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,1)] font-black"
                >⚡</motion.div>
                <motion.div 
                  initial={{ y: 20, x: 60, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, x: 130, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-12 right-1/3 text-2xl text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,1)] font-black"
                >⚡</motion.div>
                <motion.div 
                  initial={{ y: 0, scale: 0.6, opacity: 1 }}
                  animate={{ y: -110, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 text-3xl text-yellow-100 drop-shadow-[0_0_16px_rgba(253,224,71,1)] font-black"
                >⚡</motion.div>
              </div>
            )}

            {/* 2. AVELINE: Tidal Lotus Eruption & Aqua Shockwave */}
            {aftermath.charId === 'aveline' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[520px] h-32 rounded-full border-4 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full border-2 border-fuchsia-400 shadow-[0_0_30px_rgba(244,114,182,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-sky-500/30 via-fuchsia-500/20 to-transparent" />
                <motion.div 
                  initial={{ y: 20, scale: 0.6, opacity: 1 }}
                  animate={{ y: -80, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-12 left-1/4 text-2xl text-pink-300 drop-shadow-[0_0_12px_rgba(244,114,182,1)]"
                >🌸</motion.div>
                <motion.div 
                  initial={{ y: 20, scale: 0.6, opacity: 1 }}
                  animate={{ y: -90, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-12 right-1/4 text-2xl text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]"
                >💧</motion.div>
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.8 }}
                  animate={{ scale: 1.5, rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="75" stroke="#f472b6" strokeWidth="3" strokeDasharray="8 6" />
                    <polygon points="100,20 125,75 180,100 125,125 100,180 75,125 20,100 75,75" stroke="#38bdf8" strokeWidth="3" fill="rgba(244,114,182,0.25)" />
                  </svg>
                </motion.div>
              </div>
            )}

            {/* 3. KAIREN: Glacial Spike Eruption & Frost Shockwave */}
            {aftermath.charId === 'kairen' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[500px] h-32 rounded-full border-4 border-cyan-300 shadow-[0_0_35px_rgba(103,232,249,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-sky-600/35 via-blue-950/25 to-transparent" />
                {/* Rapid ice spikes bursting upwards */}
                <motion.div 
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
                >
                  <svg className="w-full h-full opacity-60" viewBox="0 0 800 120" preserveAspectRatio="none" fill="none">
                    <polygon points="60,120 90,10 120,120" fill="rgba(186,230,253,0.7)" stroke="#ffffff" strokeWidth="2" />
                    <polygon points="220,120 250,25 280,120" fill="rgba(56,189,248,0.6)" stroke="#38bdf8" strokeWidth="2" />
                    <polygon points="400,120 430,5 460,120" fill="rgba(224,242,254,0.8)" stroke="#ffffff" strokeWidth="2.5" />
                    <polygon points="570,120 600,15 630,120" fill="rgba(186,230,253,0.7)" stroke="#ffffff" strokeWidth="2" />
                    <polygon points="710,120 740,30 770,120" fill="rgba(56,189,248,0.6)" stroke="#38bdf8" strokeWidth="2" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-12 left-1/3 text-2xl text-cyan-200 drop-shadow-[0_0_12px_rgba(103,232,249,1)]"
                >❄️</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
                  className="absolute bottom-12 right-1/3 text-2xl text-white drop-shadow-[0_0_14px_rgba(255,255,255,1)]"
                >✨</motion.div>
              </div>
            )}

            {/* 4. CYRUS: Blazing Crimson Cross Cleave & Blade Embers */}
            {aftermath.charId === 'cyrus' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-32 rounded-full border-4 border-red-500 shadow-[0_0_40px_rgba(239,68,68,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-red-600/35 via-rose-950/25 to-transparent" />
                {/* Fast glowing cross cleave slash lines */}
                <motion.div 
                  initial={{ scaleX: 0.1, opacity: 1 }}
                  animate={{ scaleX: 1.4, opacity: 0 }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                  className="absolute bottom-8 left-6 right-6 h-[4px] bg-gradient-to-r from-transparent via-red-400 to-transparent shadow-[0_0_24px_rgba(239,68,68,1)]"
                />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,1)] font-bold"
                >⚔️</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-rose-300 drop-shadow-[0_0_14px_rgba(244,63,94,1)] font-bold"
                >✦</motion.div>
              </div>
            )}

            {/* 5. RAVEN: Abyssal Shadow Nova & Dark Feather Cyclone */}
            {aftermath.charId === 'raven' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1, rotate: 0 }}
                  animate={{ scale: 2.3, opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[500px] h-32 rounded-full border-4 border-purple-500 shadow-[0_0_35px_rgba(168,85,247,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-purple-900/40 via-indigo-950/30 to-transparent" />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/4 text-2xl text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,1)]"
                >🪶</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/4 text-2xl text-indigo-300 drop-shadow-[0_0_12px_rgba(129,140,248,1)]"
                >🌑</motion.div>
              </div>
            )}

            {/* 6. NEREUS: Ocean Geyser Tidal Burst & Hydro Shockwave */}
            {aftermath.charId === 'nereus' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-teal-700/35 via-cyan-950/30 to-transparent" />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,1)]"
                >🫧</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -95, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,1)]"
                >🌊</motion.div>
              </div>
            )}

            {/* 7. IVA: World Tree Roots Explosive Bloom & Emerald Leaf Whirlwind */}
            {aftermath.charId === 'iva' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[500px] h-32 rounded-full border-4 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-emerald-700/35 via-green-950/25 to-transparent" />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/4 text-2xl text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,1)]"
                >🍃</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/4 text-2xl text-green-200 drop-shadow-[0_0_12px_rgba(34,197,94,1)]"
                >🌿</motion.div>
              </div>
            )}

            {/* 8. AELITA: Botanical Hexagram Laser Blast & Prismatic Matrix */}
            {aftermath.charId === 'aelita' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.3, opacity: 1, rotate: 0 }}
                  animate={{ scale: 2.2, opacity: 0, rotate: 120 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[480px] h-32 rounded-full border-4 border-lime-400 shadow-[0_0_35px_rgba(163,230,53,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-lime-600/30 via-emerald-950/25 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.9 }}
                  animate={{ scale: 1.6, rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <circle cx="100" cy="100" r="80" stroke="#34d399" strokeWidth="3" strokeDasharray="8 6" />
                    <polygon points="100,20 170,140 30,140" stroke="#6ee7b7" strokeWidth="3" fill="rgba(52,211,153,0.2)" />
                    <polygon points="100,180 30,60 170,60" stroke="#a7f3d0" strokeWidth="2.5" fill="rgba(110,231,183,0.15)" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-lime-300 drop-shadow-[0_0_12px_rgba(163,230,53,1)]"
                >📐</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,1)]"
                >✧</motion.div>
              </div>
            )}

            {/* 9. MAESTRO: Supersonic Resonance Pulse & Bursting Musical Staves */}
            {aftermath.charId === 'maestro' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-32 rounded-full border-4 border-purple-400 shadow-[0_0_35px_rgba(192,132,252,1)]"
                />
                <motion.div 
                  initial={{ scale: 0.1, opacity: 1 }}
                  animate={{ scale: 2.1, opacity: 0 }}
                  transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[440px] h-28 rounded-full border-2 border-fuchsia-400 shadow-[0_0_30px_rgba(232,121,249,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-purple-800/35 via-fuchsia-950/25 to-transparent" />
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/4 text-2xl text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,1)] font-bold"
                >♪</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -90, scale: 1.9, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/4 text-3xl text-fuchsia-300 drop-shadow-[0_0_14px_rgba(232,121,249,1)] font-bold"
                >♫</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 text-2xl text-purple-200 drop-shadow-[0_0_12px_rgba(192,132,252,1)] font-bold"
                >♬</motion.div>
              </div>
            )}

            {/* 10. INEFFA: Solar Corona Eruption & Prismatic Mirror Shard Blast */}
            {aftermath.charId === 'ineffa' && (
              <div className="absolute inset-0">
                <motion.div 
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[520px] h-36 rounded-full border-4 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,1)]"
                />
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-rose-600/35 via-amber-600/25 to-transparent" />
                <motion.div 
                  initial={{ scale: 0.4, rotate: 0, opacity: 0.9 }}
                  animate={{ scale: 1.6, rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                >
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <polygon points="100,10 125,75 190,100 125,125 100,190 75,125 10,100 75,75" stroke="#f59e0b" strokeWidth="3" fill="rgba(244,63,94,0.25)" />
                  </svg>
                </motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -80, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-10 left-1/3 text-2xl text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,1)]"
                >🪞</motion.div>
                <motion.div 
                  initial={{ y: 10, scale: 0.5, opacity: 1 }}
                  animate={{ y: -85, scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                  className="absolute bottom-10 right-1/3 text-2xl text-rose-300 drop-shadow-[0_0_14px_rgba(244,63,94,1)]"
                >☀️</motion.div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

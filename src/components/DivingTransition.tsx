import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const DivingTransition: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 0.4 + 0.4,
      delay: Math.random() * 0.4,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 850);

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0%,transparent_70%)]" />
      
      {/* Faster Tunnel Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            x: `${p.x}vw`, 
            y: `${p.y}vh`, 
            scale: 0, 
            opacity: 0,
            zIndex: 0 
          }}
          animate={{ 
            scale: 25, 
            opacity: [0, 1, 0],
            zIndex: 50
          }}
          transition={{ 
            duration: p.duration * 0.6, 
            delay: p.delay * 0.5,
            repeat: 0,
            ease: "easeIn"
          }}
          className="absolute w-1 h-1 bg-indigo-400 rounded-full blur-[1px]"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {/* Warp Lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`line-${i}`}
          initial={{ rotate: (i * 18), scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: [0, 2, 0], 
            opacity: [0, 0.5, 0],
            x: [0, (i % 2 === 0 ? 1000 : -1000)] 
          }}
          transition={{ 
            duration: 0.8, 
            delay: Math.random() * 0.5,
            repeat: Infinity,
            ease: "circIn"
          }}
          className="absolute w-64 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent origin-left"
          style={{ left: '50%', top: '50%' }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-[100] text-center"
      >
        <h2 className="text-2xl sm:text-4xl font-black italic text-white uppercase tracking-tighter animate-pulse">
          Погружение...
        </h2>
        <div className="mt-4 flex gap-2 justify-center">
          {[0, 1, 2].map(i => (
            <motion.div 
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
              className="w-2 h-2 bg-indigo-500 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

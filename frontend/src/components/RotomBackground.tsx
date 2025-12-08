import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function RotomBackground() {
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-400" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-40">
        {/* Horizontal lines */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Diagonal light streaks */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-[200%] h-full"
          style={{
            background: 'linear-gradient(60deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 60%)',
          }}
        />
      </div>

      {/* Animated particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-white/40 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-white/40 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-white/40 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-white/40 rounded-br-lg" />

      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent" />
    </div>
  );
}

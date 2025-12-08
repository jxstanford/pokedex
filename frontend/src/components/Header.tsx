import { Zap, Wifi, Battery } from 'lucide-react';
import { motion } from 'motion/react';

export function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 relative overflow-hidden"
    >
      {/* Digital grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-1 text-white/80 text-xs">
          <Wifi className="w-3 h-3" />
          <span>12:34</span>
        </div>
        <div className="flex items-center gap-1 text-white/80 text-xs">
          <Battery className="w-4 h-4" />
          <span>85%</span>
        </div>
      </div>
      
      {/* Main header */}
      <div className="flex items-center gap-3 relative z-10">
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 5, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg relative"
        >
          <Zap className="w-6 h-6 text-orange-600 fill-orange-600" />
          <div className="absolute inset-0 bg-white/30 rounded-lg animate-pulse" />
        </motion.div>
        <div>
          <h1 className="text-2xl text-white tracking-wide rotom-screen-title">
            ROTOM-DEX
          </h1>
          <p className="text-xs text-orange-100">SCANNING MODE</p>
        </div>
      </div>
    </motion.header>
  );
}
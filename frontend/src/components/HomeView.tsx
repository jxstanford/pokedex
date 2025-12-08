import { motion } from 'motion/react';
import { Camera, Upload, Zap } from 'lucide-react';
import type { ViewMode } from '../App';

interface HomeViewProps {
  onViewChange: (view: ViewMode) => void;
}

export function HomeView({ onViewChange }: HomeViewProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
          <Zap className="w-14 h-14 text-yellow-300 fill-yellow-300" />
        </div>
        <h1 className="text-4xl text-white mb-2 rotom-screen-title">ROTOM-DEX</h1>
        <p className="text-cyan-100 text-lg">Pokémon Identification System</p>
        <p className="text-white/70 text-sm mt-2">CLIP Vector Search + pgvector</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-6 max-w-md">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onViewChange('camera')}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 rounded-2xl p-6 transition-all group"
        >
          <Camera className="w-12 h-12 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-white">Live Capture</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => onViewChange('upload')}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 rounded-2xl p-6 transition-all group"
        >
          <Upload className="w-12 h-12 text-white mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-white">Upload Image</p>
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-white/60 text-sm text-center"
      >
        Select a mode to begin scanning
      </motion.div>
    </div>
  );
}

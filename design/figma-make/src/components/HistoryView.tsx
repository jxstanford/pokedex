import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { Analysis } from '../App';

interface HistoryViewProps {
  analyses: Analysis[];
}

export function HistoryView({ analyses }: HistoryViewProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  if (analyses.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-xl">No history yet</p>
          <p className="text-white/40 mt-2">Your scanned Pokémon will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-2">
      <h2 className="text-2xl text-white mb-4 tracking-wider">SCAN HISTORY</h2>
      <div className="space-y-3">
        {analyses.map((analysis, index) => (
          <motion.button
            key={analysis.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-2xl p-4 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-white text-lg truncate group-hover:text-cyan-200 transition-colors">
                  {analysis.pokemonName}
                </p>
                <p className="text-sm text-white/60 mt-1 font-mono">
                  {formatTimestamp(analysis.timestamp)}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-cyan-200 transition-colors flex-shrink-0" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { Clock, ChevronRight } from 'lucide-react';
import type { Analysis } from '../App';

interface RecentAnalysesProps {
  analyses: Analysis[];
}

export function RecentAnalyses({ analyses }: RecentAnalysesProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative"
    >
      {/* Holographic border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-2xl opacity-50 blur-sm" />
      
      <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-green-500/30 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 px-4 py-3 border-b border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Clock className="w-4 h-4 text-green-400" />
              <h2 className="text-green-100 tracking-wider text-sm">HISTORY LOG</h2>
            </div>
            <span className="text-xs text-green-400 font-mono">{analyses.length}</span>
          </div>
        </div>

        <div className="p-4 space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
          {analyses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-xs tracking-wide">NO DATA RECORDED</p>
            </div>
          ) : (
            analyses.map((analysis, index) => (
              <motion.button
                key={analysis.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 hover:from-green-900/50 hover:to-emerald-900/50 rounded-xl p-3 border border-slate-600/50 hover:border-green-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-cyan-100 truncate text-sm tracking-wide">
                      {analysis.pokemonName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {formatTimestamp(analysis.timestamp)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-green-400 transition-colors flex-shrink-0" />
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
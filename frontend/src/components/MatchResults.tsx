import { motion } from "motion/react";
import { Zap, Trophy } from "lucide-react";
import type { PokemonMatch } from "../types";

interface MatchResultsProps {
  matches: PokemonMatch[];
  onPokemonSelect: (pokemon: PokemonMatch) => void;
}

export function MatchResults({ matches, onPokemonSelect }: MatchResultsProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fighting: 'bg-red-600',
      dragon: 'bg-purple-600',
      electric: 'bg-yellow-500',
      fire: 'bg-orange-600',
      water: 'bg-blue-600',
      grass: 'bg-green-600',
      ice: 'bg-cyan-400',
      poison: 'bg-purple-700',
      ground: 'bg-yellow-700',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-600',
      bug: 'bg-lime-600',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-900',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-400',
      normal: 'bg-gray-400',
    };
    return colors[type.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative"
    >
      {/* Holographic border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl opacity-50 blur-sm" />
      
      <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-4 py-3 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <Trophy className="w-4 h-4 text-purple-400" />
            <h2 className="text-purple-100 tracking-wider text-sm">MATCH DATABASE</h2>
          </div>
        </div>

        <div className="p-4 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {matches.map((match, index) => (
            <motion.button
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPokemonSelect(match)}
              className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 hover:from-purple-900/50 hover:to-pink-900/50 rounded-xl p-3 border border-slate-600/50 hover:border-purple-500/50 transition-all text-left relative overflow-hidden group"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex items-center gap-3">
                {/* Rank Badge */}
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 border border-yellow-400/50">
                  <span className="text-white text-sm">#{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Pokemon Name */}
                  <h3 className="text-cyan-100 truncate mb-1 text-sm tracking-wide">
                    {match.name}
                  </h3>

                  {/* Match Percentage */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1 h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-600/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${match.similarity}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400"
                        style={{
                          boxShadow: '0 0 10px rgba(34, 211, 238, 0.5)'
                        }}
                      />
                    </div>
                    <span className="text-xs text-cyan-300 flex-shrink-0 font-mono">{match.similarity}%</span>
                  </div>

                  {/* Types */}
                  <div className="flex flex-wrap gap-1">
                    {match.types.map(type => (
                      <span
                        key={type}
                        className={`px-2 py-0.5 ${getTypeColor(type)} text-white text-xs rounded border border-white/30 uppercase tracking-wide`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

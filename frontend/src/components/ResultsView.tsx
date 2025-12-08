import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import type { PokemonMatch } from '../types/pokemon';

interface ResultsViewProps {
  matches: PokemonMatch[];
  onPokemonSelect: (pokemon: PokemonMatch) => void;
}

export function ResultsView({ matches, onPokemonSelect }: ResultsViewProps) {
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

  if (matches.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-xl">No results yet</p>
          <p className="text-white/40 mt-2">Upload or capture an image to see matches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-2">
      <h2 className="text-2xl text-white mb-4 tracking-wider">TOP MATCHES</h2>
      <div className="space-y-3">
        {matches.map((match, index) => (
          <motion.button
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPokemonSelect(match)}
            className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-2xl p-4 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              {/* Rank Badge */}
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-white/50">
                <span className="text-white text-xl">#{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Pokemon Name */}
                <h3 className="text-white text-lg truncate mb-2 group-hover:text-cyan-200 transition-colors">
                  {match.name}
                </h3>

                {/* Match Percentage */}
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden border border-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${match.similarity}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400"
                      style={{
                        boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)'
                      }}
                    />
                  </div>
                  <span className="text-sm text-cyan-200 flex-shrink-0 font-mono">{match.similarity}%</span>
                </div>

                {/* Types */}
                <div className="flex flex-wrap gap-2">
                  {match.types.map(type => (
                    <span
                      key={type}
                      className={`px-3 py-1 ${getTypeColor(type)} text-white text-xs rounded-full border border-white/40 uppercase tracking-wide`}
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
  );
}

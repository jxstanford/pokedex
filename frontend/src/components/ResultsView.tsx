import { motion } from "motion/react";
import { Zap, Image as ImageIcon } from "lucide-react";
import type { PokemonMatch } from "../types";

interface ResultsViewProps {
  matches: PokemonMatch[];
  onPokemonSelect: (pokemon: PokemonMatch) => void;
  previewUrl?: string | null;
}

export function ResultsView({ matches, onPokemonSelect, previewUrl }: ResultsViewProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fighting: "bg-red-600",
      dragon: "bg-purple-600",
      electric: "bg-yellow-500",
      fire: "bg-orange-600",
      water: "bg-blue-600",
      grass: "bg-green-600",
      ice: "bg-cyan-400",
      poison: "bg-purple-700",
      ground: "bg-yellow-700",
      flying: "bg-indigo-400",
      psychic: "bg-pink-600",
      bug: "bg-lime-600",
      rock: "bg-yellow-800",
      ghost: "bg-purple-900",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-400",
      normal: "bg-gray-400",
    };
    return colors[type.toLowerCase()] || "bg-gray-500";
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
    <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-white mb-2 tracking-wider">TOP MATCHES</h2>
        {previewUrl && (
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/50 border border-white/10">
              <img src={previewUrl} alt="Last scan" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs text-white/60">Last scan</div>
              <div className="text-sm text-white">Tap a match for details</div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {matches.map((match, index) => (
          <motion.button
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPokemonSelect(match)}
            className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-2xl p-4 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2 border-white/50">
                <span className="text-white text-xl">#{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white text-lg truncate mb-2 group-hover:text-cyan-200 transition-colors">
                  {match.name}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden border border-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${match.similarity}%` }}
                      transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400"
                      style={{
                        boxShadow: "0 0 10px rgba(34, 211, 238, 0.8)",
                      }}
                    />
                  </div>
                  <span className="text-sm text-cyan-200 flex-shrink-0 font-mono">
                    {match.similarity}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {match.types.map((type) => (
                    <span
                      key={type}
                      className={`px-3 py-1 ${getTypeColor(type)} text-white text-xs rounded-full border border-white/40 uppercase tracking-wide`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {match.imageUrl ? (
                <img
                  src={match.imageUrl}
                  alt={match.name}
                  className="w-16 h-16 rounded-xl object-contain bg-black/40 border border-white/10"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white/50">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

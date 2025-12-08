import { motion } from "motion/react";
import { X, Ruler, Weight, Sparkles, Activity, Loader2, TriangleAlert } from "lucide-react";
import type { PokemonMatch } from "../types";

interface PokemonDetailProps {
  pokemon: PokemonMatch;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function PokemonDetail({ pokemon, onClose, isLoading, error }: PokemonDetailProps) {
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

  const statMax = 200;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, y: 10 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-6xl"
      >
        <div className="relative rounded-[32px] border-4 border-gray-900 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_0_40px_rgba(0,200,255,0.25)] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.2),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.15),transparent_25%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:16px_16px] opacity-40" />
          </div>

          <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 border-b border-orange-300/40">
            <div>
              <div className="text-xs text-orange-100 tracking-widest">POKÉMON DATA</div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <h2 className="text-3xl text-white tracking-wide">{pokemon.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`px-3 py-1 ${getTypeColor(type)} text-white rounded-lg border border-white/30 uppercase text-xs tracking-wide`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors border border-white/30 shadow-lg"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="relative p-6">
            {isLoading && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 text-cyan-200 rounded-[28px]">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-sm">Refreshing Pokédex entry...</span>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-500/15 border border-red-400/40 text-red-100 rounded-xl p-3 flex items-center gap-2">
                <TriangleAlert className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-12 gap-6 items-stretch max-h-[72vh] overflow-y-auto custom-scrollbar pr-2">
              <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 rounded-2xl p-4 border border-cyan-500/30 shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                    <span className="text-xs text-cyan-300 tracking-widest">DESCRIPTION</span>
                  </div>
                  <p className="text-slate-100 text-sm leading-relaxed">{pokemon.description}</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 rounded-2xl p-4 border border-orange-400/30 shadow-inner space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-300" />
                    <span className="text-sm text-orange-100 tracking-wider">VITALS</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 rounded-xl p-3 border border-red-500/40">
                      <div className="flex items-center gap-2 text-red-100 text-xs mb-1">
                        <Ruler className="w-3 h-3" />
                        HT
                      </div>
                      <div className="text-white font-mono text-sm">{pokemon.height}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl p-3 border border-blue-500/40">
                      <div className="flex items-center gap-2 text-blue-100 text-xs mb-1">
                        <Weight className="w-3 h-3" />
                        WT
                      </div>
                      <div className="text-white font-mono text-sm">{pokemon.weight}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl p-3 border border-purple-500/40">
                      <div className="flex items-center gap-2 text-purple-100 text-xs mb-1">
                        <Activity className="w-3 h-3" />
                        GEN
                      </div>
                      <div className="text-white font-mono text-sm">
                        {pokemon.generation ? `G${pokemon.generation}` : "—"}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 rounded-xl p-3 border border-cyan-500/40">
                      <div className="text-cyan-100 text-xs mb-1">MATCH</div>
                      <div className="text-white font-mono text-sm">{pokemon.similarity}%</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 rounded-2xl p-4 border border-blue-400/30 shadow-inner space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-300" />
                    <span className="text-sm text-blue-100 tracking-wider">ABILITIES</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.length ? (
                      pokemon.abilities.map((ability, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 text-cyan-200 rounded-lg border border-blue-500/30 text-xs tracking-wide"
                        >
                          {ability}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm">No abilities listed.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-cyan-500/40 shadow-inner overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:16px_16px]" />
                  </div>
                  <div className="p-4 text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-100 text-xs tracking-widest">
                      ROTOM DATA LINK
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center min-h-[260px]">
                      {pokemon.imageUrl ? (
                        <img
                          src={pokemon.imageUrl}
                          alt={pokemon.name}
                          className="w-full h-full object-contain bg-slate-900"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-slate-400">No artwork available</div>
                      )}
                    </div>
                    <div className="text-cyan-200 text-xs tracking-wider">
                      Confidence: {pokemon.similarity}% match
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4">
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 rounded-2xl p-4 border border-green-400/30 shadow-inner h-full flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-300" />
                    <span className="text-sm text-green-100 tracking-wider">BASE STATS</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "HP", value: pokemon.stats.hp, color: "bg-red-500" },
                      { name: "ATK", value: pokemon.stats.attack, color: "bg-orange-500" },
                      { name: "DEF", value: pokemon.stats.defense, color: "bg-yellow-500" },
                      { name: "SPA", value: pokemon.stats.spAttack, color: "bg-blue-500" },
                      { name: "SPD", value: pokemon.stats.spDefense, color: "bg-green-500" },
                      { name: "SPE", value: pokemon.stats.speed, color: "bg-pink-500" },
                    ].map((stat) => (
                      <div
                        key={stat.name}
                        className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/60 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-300 w-12 font-mono">{stat.name}</span>
                          <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((stat.value / statMax) * 100, 100)}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className={`h-full ${stat.color}`}
                              style={{
                                boxShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
                              }}
                            />
                          </div>
                          <span className="text-xs text-cyan-300 w-10 text-right font-mono">{stat.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

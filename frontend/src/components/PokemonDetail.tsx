import {
	Activity,
	Loader2,
	Ruler,
	Sparkles,
	TriangleAlert,
	Weight,
	X,
} from "lucide-react";
import { motion } from "motion/react";
import type { PokemonMatch } from "../types";

interface PokemonDetailProps {
	pokemon: PokemonMatch;
	onClose: () => void;
	isLoading?: boolean;
	error?: string | null;
}

export function PokemonDetail({
	pokemon,
	onClose,
	isLoading,
	error,
}: PokemonDetailProps) {
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
			className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.9, y: 20 }}
				animate={{ scale: 1, y: 0 }}
				exit={{ scale: 0.9, y: 20 }}
				onClick={(event) => event.stopPropagation()}
				className="w-full max-w-md"
			>
				<div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-3 shadow-2xl border-4 border-gray-900">
					<div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl overflow-hidden relative border-2 border-cyan-500/30">
						<div className="absolute inset-0 pointer-events-none z-40 scan-lines opacity-20" />

						<div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 relative overflow-hidden">
							<div className="absolute inset-0 opacity-10">
								<div
									className="absolute inset-0"
									style={{
										backgroundImage:
											"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
										backgroundSize: "15px 15px",
									}}
								/>
							</div>

							<button
								onClick={onClose}
								className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors border border-white/30 z-50"
							>
								<X className="w-5 h-5 text-white" />
							</button>

							<div className="text-center relative z-10">
								<div className="text-xs text-orange-200 mb-1 tracking-wider">
									POKÉMON DATA
								</div>

								{pokemon.imageUrl && (
									<div className="flex justify-center mb-3">
										<motion.img
											initial={{ scale: 0.8, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											transition={{ duration: 0.3 }}
											src={pokemon.imageUrl}
											alt={pokemon.name}
											className="w-28 h-28 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
										/>
									</div>
								)}

								<h2 className="text-2xl text-white mb-2 tracking-wide">
									{pokemon.name}
								</h2>
								<div className="flex flex-wrap justify-center gap-2">
									{pokemon.types.map((type) => (
										<span
											key={type}
											className={`px-3 py-1 ${getTypeColor(type)} text-white rounded-lg border border-white/40 uppercase text-xs tracking-wide`}
										>
											{type}
										</span>
									))}
								</div>
							</div>
						</div>

						<div className="p-4 space-y-3 overflow-y-auto max-h-[calc(90vh-250px)] custom-scrollbar relative">
							{isLoading && (
								<div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 text-cyan-200">
									<Loader2 className="w-10 h-10 animate-spin" />
									<span className="text-sm">Refreshing Pokédex entry...</span>
								</div>
							)}

							{error && (
								<div className="bg-red-500/15 border border-red-400/40 text-red-100 rounded-xl p-3 flex items-center gap-2">
									<TriangleAlert className="w-4 h-4" />
									<span>{error}</span>
								</div>
							)}

							<div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-3 border border-cyan-500/30">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
									<span className="text-xs text-cyan-400 tracking-wider">
										DESCRIPTION
									</span>
								</div>
								<p className="text-slate-300 text-sm leading-relaxed">
									{pokemon.description}
								</p>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-2">
									<div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
									<Sparkles className="w-4 h-4 text-orange-400" />
									<h3 className="text-orange-100 text-sm tracking-wider">
										VITALS
									</h3>
								</div>
								<div className="grid grid-cols-3 gap-2">
									<div className="bg-gradient-to-br from-red-900/40 to-red-800/40 rounded-lg p-2.5 border border-red-500/30">
										<div className="flex items-center gap-1 mb-1">
											<Ruler className="w-3 h-3 text-red-400" />
											<span className="text-xs text-red-300 tracking-wide">
												HT
											</span>
										</div>
										<p className="text-white text-xs font-mono">
											{pokemon.height}
										</p>
									</div>
									<div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-lg p-2.5 border border-blue-500/30">
										<div className="flex items-center gap-1 mb-1">
											<Weight className="w-3 h-3 text-blue-400" />
											<span className="text-xs text-blue-300 tracking-wide">
												WT
											</span>
										</div>
										<p className="text-white text-xs font-mono">
											{pokemon.weight}
										</p>
									</div>
									<div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-lg p-2.5 border border-purple-500/30">
										<div className="flex items-center gap-1 mb-1">
											<Activity className="w-3 h-3 text-purple-400" />
											<span className="text-xs text-purple-300 tracking-wide">
												GEN
											</span>
										</div>
										<p className="text-white text-xs font-mono">
											{pokemon.generation ? `G${pokemon.generation}` : "—"}
										</p>
									</div>
								</div>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-2">
									<div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
									<Sparkles className="w-4 h-4 text-blue-400" />
									<h3 className="text-blue-100 text-sm tracking-wider">
										ABILITIES
									</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{pokemon.abilities.length ? (
										pokemon.abilities.map((ability, index) => (
											<span
												key={index}
												className="px-3 py-1.5 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 text-cyan-300 rounded-lg border border-blue-500/30 text-xs tracking-wide"
											>
												{ability}
											</span>
										))
									) : (
										<span className="text-slate-400 text-sm">
											No abilities listed.
										</span>
									)}
								</div>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-2">
									<div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
									<Activity className="w-4 h-4 text-green-400" />
									<h3 className="text-green-100 text-sm tracking-wider">
										BASE STATS
									</h3>
								</div>
								<div className="space-y-2">
									{[
										{
											name: "HP",
											value: pokemon.stats.hp,
											color: "bg-red-500",
										},
										{
											name: "ATK",
											value: pokemon.stats.attack,
											color: "bg-orange-500",
										},
										{
											name: "DEF",
											value: pokemon.stats.defense,
											color: "bg-yellow-500",
										},
										{
											name: "SPA",
											value: pokemon.stats.spAttack,
											color: "bg-blue-500",
										},
										{
											name: "SPD",
											value: pokemon.stats.spDefense,
											color: "bg-green-500",
										},
										{
											name: "SPE",
											value: pokemon.stats.speed,
											color: "bg-pink-500",
										},
									].map((stat) => (
										<div
											key={stat.name}
											className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50"
										>
											<div className="flex items-center gap-2">
												<span className="text-xs text-slate-400 w-10 font-mono">
													{stat.name}
												</span>
												<div className="flex-1 h-3 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700">
													<motion.div
														initial={{ width: 0 }}
														animate={{
															width: `${Math.min((stat.value / statMax) * 100, 100)}%`,
														}}
														transition={{ duration: 0.5, ease: "easeOut" }}
														className={`h-full ${stat.color}`}
														style={{
															boxShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
														}}
													/>
												</div>
												<span className="text-xs text-cyan-300 w-10 text-right font-mono">
													{stat.value}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

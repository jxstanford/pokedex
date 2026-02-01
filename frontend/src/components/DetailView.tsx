import {
	Activity,
	ArrowLeft,
	Loader2,
	Ruler,
	Sparkles,
	TriangleAlert,
	Weight,
} from "lucide-react";
import { motion } from "motion/react";
import type { PokemonMatch } from "../types";

interface DetailViewProps {
	pokemon: PokemonMatch;
	onBack: () => void;
	isLoading?: boolean;
	error?: string | null;
}

export function DetailView({
	pokemon,
	onBack,
	isLoading,
	error,
}: DetailViewProps) {
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
		<div className="h-full flex flex-col pt-6">
			<div className="flex items-center gap-3 mb-3 relative z-30">
				<button
					onClick={onBack}
					className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors border border-white/20"
				>
					<ArrowLeft className="w-5 h-5 text-white" />
				</button>
				<h2 className="text-xl text-white tracking-wider">POKÉMON DATA</h2>
			</div>

			{isLoading && (
				<div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center gap-2 text-cyan-200 rounded-xl">
					<Loader2 className="w-8 h-8 animate-spin" />
					<span className="text-sm">Loading details...</span>
				</div>
			)}

			{error && (
				<div className="bg-red-500/15 border border-red-400/40 text-red-100 rounded-xl p-2 mb-3 flex items-center gap-2 text-sm">
					<TriangleAlert className="w-4 h-4" />
					<span>{error}</span>
				</div>
			)}

			<div className="flex-1 flex gap-4 min-h-0">
				{/* Left Panel - Pokemon Image & Basic Info */}
				<div className="w-56 flex-shrink-0 bg-gradient-to-b from-orange-600 to-red-600 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden">
					<div className="absolute inset-0 opacity-10">
						<div
							className="absolute inset-0"
							style={{
								backgroundImage:
									"linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
								backgroundSize: "12px 12px",
							}}
						/>
					</div>

					{pokemon.imageUrl && (
						<motion.img
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							src={pokemon.imageUrl}
							alt={pokemon.name}
							className="w-32 h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] relative z-10"
						/>
					)}

					<h3 className="text-xl text-white mt-2 text-center relative z-10">
						{pokemon.name}
					</h3>

					{pokemon.genus && (
						<p className="text-white/70 text-xs italic text-center relative z-10 mt-0.5">
							{pokemon.genus}
						</p>
					)}

					<div className="flex flex-wrap justify-center gap-1.5 mt-2 relative z-10">
						{pokemon.types.map((type) => (
							<span
								key={type}
								className={`px-2 py-0.5 ${getTypeColor(type)} text-white rounded-md border border-white/40 uppercase text-xs`}
							>
								{type}
							</span>
						))}
					</div>

					<div className="mt-3 text-center relative z-10">
						<div className="text-white/80 text-xs">Match</div>
						<div className="text-white text-lg font-bold">
							{pokemon.similarity}%
						</div>
					</div>
				</div>

				{/* Right Panel - Stats & Details */}
				<div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
					{/* Description */}
					<div className="bg-slate-800/60 rounded-xl p-3 border border-cyan-500/20">
						<div className="flex items-center gap-2 mb-1.5">
							<div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
							<span className="text-xs text-cyan-400 tracking-wider">
								DESCRIPTION
							</span>
						</div>
						<p className="text-slate-300 text-sm leading-relaxed">
							{pokemon.description}
						</p>
					</div>

					{/* Vitals Row */}
					<div className="flex gap-2">
						<div className="flex-1 bg-gradient-to-br from-red-900/40 to-red-800/40 rounded-lg p-2 border border-red-500/30">
							<div className="flex items-center gap-1 mb-0.5">
								<Ruler className="w-3 h-3 text-red-400" />
								<span className="text-xs text-red-300">HEIGHT</span>
							</div>
							<p className="text-white text-sm font-mono">{pokemon.height}</p>
						</div>
						<div className="flex-1 bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-lg p-2 border border-blue-500/30">
							<div className="flex items-center gap-1 mb-0.5">
								<Weight className="w-3 h-3 text-blue-400" />
								<span className="text-xs text-blue-300">WEIGHT</span>
							</div>
							<p className="text-white text-sm font-mono">{pokemon.weight}</p>
						</div>
						<div className="flex-1 bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-lg p-2 border border-purple-500/30">
							<div className="flex items-center gap-1 mb-0.5">
								<Activity className="w-3 h-3 text-purple-400" />
								<span className="text-xs text-purple-300">GEN</span>
							</div>
							<p className="text-white text-sm font-mono">
								{pokemon.generation ? `G${pokemon.generation}` : "—"}
							</p>
						</div>
					</div>

					{/* Abilities */}
					<div>
						<div className="flex items-center gap-2 mb-1.5">
							<div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
							<Sparkles className="w-3 h-3 text-blue-400" />
							<span className="text-xs text-blue-100 tracking-wider">
								ABILITIES
							</span>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{pokemon.abilities.length > 0 ? (
								pokemon.abilities.map((ability, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 text-cyan-300 rounded-md border border-blue-500/30 text-xs"
									>
										{ability}
									</span>
								))
							) : (
								<span className="text-slate-400 text-xs">
									No abilities listed.
								</span>
							)}
						</div>
					</div>

					{/* Base Stats */}
					<div>
						<div className="flex items-center gap-2 mb-1.5">
							<div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
							<Activity className="w-3 h-3 text-green-400" />
							<span className="text-xs text-green-100 tracking-wider">
								BASE STATS
							</span>
						</div>
						<div className="grid grid-cols-2 gap-1.5">
							{[
								{ name: "HP", value: pokemon.stats.hp, color: "bg-red-500" },
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
									className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-700/50"
								>
									<div className="flex items-center gap-2">
										<span className="text-xs text-slate-400 w-8 font-mono">
											{stat.name}
										</span>
										<div className="flex-1 h-2 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700">
											<motion.div
												initial={{ width: 0 }}
												animate={{
													width: `${Math.min((stat.value / statMax) * 100, 100)}%`,
												}}
												transition={{ duration: 0.5, ease: "easeOut" }}
												className={`h-full ${stat.color}`}
											/>
										</div>
										<span className="text-xs text-cyan-300 w-7 text-right font-mono">
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
	);
}

import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchAllPokemon } from "../lib/api";
import type { ApiPokemon } from "../types";

interface PokedexViewProps {
	onSelect: (pokemon: ApiPokemon) => void;
}

const spriteFallback = (id: number) =>
	`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

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

export function PokedexView({ onSelect }: PokedexViewProps) {
	const [pokemon, setPokemon] = useState<ApiPokemon[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const controller = new AbortController();
		setIsLoading(true);
		setError(null);

		fetchAllPokemon(controller.signal)
			.then((data) => {
				setPokemon(data);
				setIsLoading(false);
			})
			.catch((err) => {
				if (err.name !== "AbortError") {
					setError(err.message || "Failed to load Pokédex");
					setIsLoading(false);
				}
			});

		return () => controller.abort();
	}, []);

	const filtered = useMemo(() => {
		if (!search.trim()) return pokemon;
		const query = search.toLowerCase().trim();
		return pokemon.filter(
			(p) =>
				p.name.toLowerCase().includes(query) ||
				p.id.toString() === query ||
				p.types.some((t) => t.toLowerCase().includes(query)) ||
				(p.genus && p.genus.toLowerCase().includes(query)),
		);
	}, [pokemon, search]);

	if (isLoading) {
		return (
			<div className="h-full flex flex-col items-center justify-center gap-3 text-cyan-200">
				<Loader2 className="w-10 h-10 animate-spin" />
				<span className="text-sm">Loading Pokédex...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-full flex flex-col items-center justify-center gap-3 text-red-300">
				<span className="text-sm">{error}</span>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col pt-6">
			<div className="flex items-center gap-3 mb-3">
				<h2 className="text-xl text-white tracking-wider">POKÉDEX</h2>
				<span className="text-cyan-400 text-sm">
					{filtered.length} / {pokemon.length}
				</span>
			</div>

			<div className="relative mb-3">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by name, number, or type..."
					className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-cyan-500/30 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
				/>
			</div>

			<div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
				<div className="grid grid-cols-4 gap-2">
					{filtered.map((p) => (
						<button
							key={p.id}
							onClick={() => onSelect(p)}
							className="bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 hover:border-cyan-500/40 rounded-xl p-2 transition-all group text-left"
						>
							<div className="flex items-center gap-2">
								<img
									src={p.image_url || spriteFallback(p.id)}
									alt={p.name}
									className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
								/>
								<div className="flex-1 min-w-0">
									<div className="text-[10px] text-slate-500 font-mono">
										#{p.id.toString().padStart(3, "0")}
									</div>
									<div className="text-white text-xs truncate">{p.name}</div>
									<div className="flex gap-1 mt-0.5">
										{p.types.slice(0, 2).map((type) => (
											<span
												key={type}
												className={`px-1 py-0.5 ${getTypeColor(type)} text-white rounded text-[8px] uppercase`}
											>
												{type.slice(0, 3)}
											</span>
										))}
									</div>
								</div>
							</div>
						</button>
					))}
				</div>

				{filtered.length === 0 && (
					<div className="text-center text-slate-400 py-8">
						No Pokémon found matching "{search}"
					</div>
				)}
			</div>
		</div>
	);
}

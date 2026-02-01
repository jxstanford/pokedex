import { useEffect, useState } from "react";
import { RotomPhone } from "./components/RotomPhone";
import { analyzeImage, fetchPokemon } from "./lib/api";
import type {
	AnalysisHistoryEntry,
	ApiMatch,
	ApiPokemon,
	PokemonMatch,
	ViewMode,
} from "./types";

const HISTORY_KEY = "pokemon-vision-history";
const MAX_HISTORY_ENTRIES = 6;

const meters = (value?: number) =>
	typeof value === "number" && Number.isFinite(value)
		? `${value.toFixed(1)} m`
		: "—";
const kilograms = (value?: number) =>
	typeof value === "number" && Number.isFinite(value)
		? `${value.toFixed(1)} kg`
		: "—";

const spriteFallback = (id: number) =>
	`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

function mapMatch(match: ApiMatch, similarityOverride?: number): PokemonMatch {
	const { pokemon } = match;
	const stats = pokemon.stats ?? {};
	const imageUrl = pokemon.image_url || spriteFallback(pokemon.id);
	return {
		id: pokemon.id,
		name: pokemon.name,
		similarity:
			similarityOverride ??
			Math.round(Math.max(match.similarity_score ?? 0, 0) * 100),
		types: pokemon.types ?? [],
		imageUrl,
		description: pokemon.description ?? "No description available yet.",
		genus: pokemon.genus ?? "",
		height: meters(pokemon.height),
		weight: kilograms(pokemon.weight),
		generation: pokemon.generation ?? 0,
		abilities: pokemon.abilities ?? [],
		stats: {
			hp: stats.hp ?? 0,
			attack: stats.attack ?? 0,
			defense: stats.defense ?? 0,
			spAttack: stats.special_attack ?? 0,
			spDefense: stats.special_defense ?? 0,
			speed: stats.speed ?? 0,
		},
	};
}

export default function App() {
	const [matches, setMatches] = useState<PokemonMatch[]>([]);
	const [selectedPokemon, setSelectedPokemon] = useState<PokemonMatch | null>(
		null,
	);
	const [currentView, setCurrentView] = useState<ViewMode>("home");
	const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [detailError, setDetailError] = useState<string | null>(null);
	const [isDetailLoading, setIsDetailLoading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [detailCache, setDetailCache] = useState<Record<number, PokemonMatch>>(
		{},
	);
	const [detailReturnView, setDetailReturnView] = useState<ViewMode>("results");

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		const cached = localStorage.getItem(HISTORY_KEY);
		if (cached) {
			try {
				const parsed = JSON.parse(cached) as AnalysisHistoryEntry[];
				setHistory(parsed);
			} catch {
				// ignore malformed cache
			}
		}
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		localStorage.setItem(
			HISTORY_KEY,
			JSON.stringify(history.slice(0, MAX_HISTORY_ENTRIES)),
		);
	}, [history]);

	const handleAnalyze = async (file: File, preview: string) => {
		setIsAnalyzing(true);
		setError(null);
		setPreviewUrl(preview);
		try {
			const result = await analyzeImage(file, 5);
			const mappedMatches = result.matches.map((match) => mapMatch(match));
			setMatches(mappedMatches);
			setSelectedPokemon(mappedMatches[0] ?? null);
			setCurrentView("results");

			if (mappedMatches.length > 0) {
				const entry: AnalysisHistoryEntry = {
					id: result.id,
					pokemonName: mappedMatches[0].name,
					timestamp: new Date().toISOString(),
					previewUrl: preview,
					matches: mappedMatches,
				};
				setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES));
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Analysis failed. Please try again.",
			);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleHistorySelect = (entry: AnalysisHistoryEntry) => {
		setMatches(entry.matches);
		setSelectedPokemon(entry.matches[0] ?? null);
		setPreviewUrl(entry.previewUrl ?? null);
		setCurrentView("results");
	};

	const handlePokemonSelect = async (match: PokemonMatch) => {
		setSelectedPokemon(match);
		setDetailError(null);
		setDetailReturnView("results");
		setCurrentView("detail");

		const cached = detailCache[match.id];
		if (cached) {
			setSelectedPokemon({ ...cached, similarity: match.similarity });
			return;
		}

		setIsDetailLoading(true);
		try {
			const detail = await fetchPokemon(match.id);
			const hydrated = mapMatch(
				{
					pokemon: detail,
					similarity_score: match.similarity / 100,
					rank: match.id,
				},
				match.similarity,
			);
			setDetailCache((prev) => ({ ...prev, [match.id]: hydrated }));
			setSelectedPokemon(hydrated);
			setMatches((prev) =>
				prev.map((item) =>
					item.id === match.id
						? { ...hydrated, similarity: item.similarity }
						: item,
				),
			);
		} catch (err) {
			setDetailError(
				err instanceof Error ? err.message : "Unable to load Pokémon details.",
			);
		} finally {
			setIsDetailLoading(false);
		}
	};

	const handleDetailClose = () => {
		setCurrentView(detailReturnView);
		setDetailError(null);
	};

	const handlePokedexSelect = (pokemon: ApiPokemon) => {
		const stats = pokemon.stats ?? {};
		const match: PokemonMatch = {
			id: pokemon.id,
			name: pokemon.name,
			similarity: 100,
			types: pokemon.types ?? [],
			imageUrl: pokemon.image_url || spriteFallback(pokemon.id),
			description: pokemon.description ?? "No description available yet.",
			genus: pokemon.genus ?? "",
			height: meters(pokemon.height),
			weight: kilograms(pokemon.weight),
			generation: pokemon.generation ?? 0,
			abilities: pokemon.abilities ?? [],
			stats: {
				hp: stats.hp ?? 0,
				attack: stats.attack ?? 0,
				defense: stats.defense ?? 0,
				spAttack: stats.special_attack ?? 0,
				spDefense: stats.special_defense ?? 0,
				speed: stats.speed ?? 0,
			},
		};
		setSelectedPokemon(match);
		setDetailError(null);
		setDetailReturnView("pokedex");
		setCurrentView("detail");
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-8 relative">
			{error && (
				<div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-400/60 text-red-100 rounded-xl px-4 py-2 backdrop-blur-md shadow-lg">
					{error}
				</div>
			)}

			<RotomPhone
				currentView={currentView}
				onViewChange={setCurrentView}
				onAnalyze={handleAnalyze}
				isAnalyzing={isAnalyzing}
				matches={matches}
				analyses={history}
				onHistorySelect={handleHistorySelect}
				onPokemonSelect={handlePokemonSelect}
				onPokedexSelect={handlePokedexSelect}
				previewUrl={previewUrl}
				clearError={() => setError(null)}
				selectedPokemon={selectedPokemon}
				isDetailLoading={isDetailLoading}
				detailError={detailError}
				onDetailClose={handleDetailClose}
			/>
		</div>
	);
}

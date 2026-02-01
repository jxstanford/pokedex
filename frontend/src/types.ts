export type ViewMode =
	| "home"
	| "camera"
	| "upload"
	| "results"
	| "history"
	| "detail"
	| "pokedex";

export interface ApiPokemon {
	id: number;
	name: string;
	types: string[];
	description?: string;
	image_url?: string;
	genus?: string;
	generation?: number;
	height?: number;
	weight?: number;
	abilities?: string[];
	stats?: {
		hp?: number;
		attack?: number;
		defense?: number;
		special_attack?: number;
		special_defense?: number;
		speed?: number;
	};
}

export interface ApiMatch {
	pokemon: ApiPokemon;
	similarity_score: number;
	rank: number;
}

export interface ApiAnalysisResult {
	id: string;
	matches: ApiMatch[];
	processing_time_ms: number;
	model_version?: string;
	created_at?: string;
}

export interface PokemonMatch {
	id: number;
	name: string;
	similarity: number;
	types: string[];
	imageUrl?: string;
	description: string;
	genus: string;
	height: string;
	weight: string;
	generation: number;
	abilities: string[];
	stats: {
		hp: number;
		attack: number;
		defense: number;
		spAttack: number;
		spDefense: number;
		speed: number;
	};
}

export interface AnalysisHistoryEntry {
	id: string;
	pokemonName: string;
	timestamp: string;
	previewUrl?: string;
	matches: PokemonMatch[];
}

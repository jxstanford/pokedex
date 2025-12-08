export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
}

export interface PokemonSummary {
  id: number;
  name: string;
  types: string[];
  description?: string;
  image_url?: string;
  abilities?: string[];
  stats?: PokemonStats;
}

export interface PokemonDetail extends PokemonSummary {
  height?: number;
  weight?: number;
  generation?: number;
}

export interface ApiPokemonMatch {
  pokemon: PokemonSummary;
  similarity_score: number;
  rank: number;
}

export interface PokemonMatch {
  id: string;
  name: string;
  similarity: number;
  types: string[];
  imageUrl?: string;
  description: string;
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

export interface Analysis {
  id: string;
  pokemonName: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface AnalysisResponse {
  id: string;
  matches: ApiPokemonMatch[];
  processing_time_ms: number;
  model_version: string;
  created_at: string;
}

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

export interface PokemonMatch {
  pokemon: PokemonSummary;
  similarity_score: number;
  rank: number;
}

export interface AnalysisResponse {
  id: string;
  matches: PokemonMatch[];
  processing_time_ms: number;
  model_version: string;
  created_at: string;
}

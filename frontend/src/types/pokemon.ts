export interface PokemonSummary {
  id: number;
  name: string;
  types: string[];
  image_url?: string;
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

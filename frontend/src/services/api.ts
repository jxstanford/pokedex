import axios from 'axios';
import type { AnalysisResponse, PokemonDetail } from '../types/pokemon';

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1' });

export const analyzeImage = async (file: File): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await client.post<AnalysisResponse>('/analyze/', formData);
  return data;
};

export const fetchPokemonDetail = async (id: number): Promise<PokemonDetail> => {
  const { data } = await client.get<PokemonDetail>(`/pokemon/${id}`);
  return data;
};

import { useQuery } from '@tanstack/react-query';
import { fetchPokemonDetail } from '../services/api';
import type { PokemonDetail } from '../types/pokemon';

export const usePokemonDetail = (id?: number) => {
  return useQuery<PokemonDetail, Error>({
    queryKey: ['pokemon', id],
    queryFn: () => {
      if (!id) {
        return Promise.reject(new Error('pokemon_id_missing'));
      }
      return fetchPokemonDetail(id);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
};

import { useLocation, useParams } from 'react-router-dom';
import PokemonDetail from '../components/PokemonDetail';
import type { PokemonDetail as PokemonDetailType } from '../types/pokemon';
import { usePokemonDetail } from '../hooks/usePokemonDetail';

const PokemonDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const statePokemon = location.state as PokemonDetailType | undefined;
  const numericId = id ? Number(id) : undefined;
  const { data, isLoading, error } = usePokemonDetail(numericId);

  const pokemon = data || statePokemon || null;

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      {isLoading && <p className="text-sm text-slate-600">Loading Pokémon data…</p>}
      {error && <p className="text-sm text-red-500">Failed to load Pokémon: {error.message}</p>}
      <PokemonDetail pokemon={pokemon} />
    </main>
  );
};

export default PokemonDetails;

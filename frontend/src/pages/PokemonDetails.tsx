import { useParams } from 'react-router-dom';
import PokemonDetail from '../components/PokemonDetail';
import type { PokemonSummary } from '../types/pokemon';

const PokemonDetails = () => {
  const { id } = useParams();
  const pokemon: PokemonSummary | null = id
    ? {
        id: Number(id),
        name: 'Placeholder Pokémon',
        types: ['mystery'],
      }
    : null;

  return (
    <main className="mx-auto max-w-3xl p-4">
      <PokemonDetail pokemon={pokemon} />
    </main>
  );
};

export default PokemonDetails;

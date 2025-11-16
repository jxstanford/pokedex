import type { PokemonSummary } from '../types/pokemon';

interface PokemonDetailProps {
  pokemon: PokemonSummary | null;
}

const PokemonDetail = ({ pokemon }: PokemonDetailProps) => {
  if (!pokemon) {
    return <p>Select a Pokémon to view details.</p>;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold">{pokemon.name}</h2>
      <p className="text-slate-600">Types: {pokemon.types.join(', ')}</p>
    </section>
  );
};

export default PokemonDetail;

import type { PokemonSummary } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: PokemonSummary;
}

const PokemonCard = ({ pokemon }: PokemonCardProps) => (
  <div className="rounded border p-4">
    <h4 className="font-semibold">{pokemon.name}</h4>
    <p className="text-sm text-slate-600">{pokemon.types.join(', ')}</p>
  </div>
);

export default PokemonCard;

import type { PokemonMatch } from '../types/pokemon';

interface MatchResultsProps {
  matches: PokemonMatch[];
  isLoading?: boolean;
}

const MatchResults = ({ matches, isLoading = false }: MatchResultsProps) => {
  if (isLoading) {
    return <p>Analyzing image…</p>;
  }

  if (!matches.length) {
    return <p>No matches yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {matches.map((match) => (
        <article key={match.pokemon.id} className="rounded border p-4 shadow-sm">
          <header className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{match.pokemon.name}</h3>
            <span>{Math.round(match.similarity_score * 100)}%</span>
          </header>
          <p className="text-sm text-slate-600">Types: {match.pokemon.types.join(', ')}</p>
        </article>
      ))}
    </div>
  );
};

export default MatchResults;

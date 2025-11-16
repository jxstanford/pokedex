import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PokemonMatch } from '../types/pokemon';

interface MatchResultsProps {
  matches: PokemonMatch[];
  isLoading?: boolean;
}

const MatchResults = ({ matches, isLoading = false }: MatchResultsProps) => {
  const navigate = useNavigate();
  const sortedMatches = useMemo(() => matches.sort((a, b) => b.similarity_score - a.similarity_score), [matches]);

  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        <div className="h-24 animate-pulse rounded bg-slate-200" />
        <div className="h-24 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!sortedMatches.length) {
    return <p className="text-sm text-slate-600">Upload a photo to see your top matches.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sortedMatches.map((match, index) => (
        <button
          key={match.pokemon.id}
          type="button"
          onClick={() => navigate(`/pokemon/${match.pokemon.id}`, { state: match.pokemon })}
          className="flex flex-col items-start rounded border p-4 text-left shadow-sm transition hover:border-blue-400"
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-sm font-semibold uppercase text-slate-500">#{index + 1}</span>
            <span className="text-sm font-semibold text-slate-700">{Math.round(match.similarity_score * 100)}%</span>
          </div>
          <h3 className="mt-2 text-xl font-bold">{match.pokemon.name}</h3>
          <p className="text-sm text-slate-600">{match.pokemon.types.join(', ')}</p>
        </button>
      ))}
    </div>
  );
};

export default MatchResults;

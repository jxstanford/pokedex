import { useLocation, useNavigate } from 'react-router-dom';
import MatchResults from '../components/MatchResults';
import type { AnalysisResponse } from '../types/pokemon';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as AnalysisResponse | undefined;

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Top Matches</h1>
          <p className="text-sm text-slate-600">Similarity scores are powered by CLIP + pgvector.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded border px-3 py-1 text-sm"
        >
          Try another photo
        </button>
      </header>
      <MatchResults matches={state?.matches ?? []} />
    </main>
  );
};

export default Results;

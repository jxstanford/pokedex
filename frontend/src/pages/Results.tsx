import { useLocation } from 'react-router-dom';
import MatchResults from '../components/MatchResults';
import type { AnalysisResponse } from '../types/pokemon';

const Results = () => {
  const location = useLocation();
  const state = location.state as AnalysisResponse | undefined;

  return (
    <main className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Matches</h1>
      <MatchResults matches={state?.matches ?? []} />
    </main>
  );
};

export default Results;

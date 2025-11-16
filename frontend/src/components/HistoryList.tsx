import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { AnalysisResponse } from '../types/pokemon';

interface HistoryListProps {
  entries: AnalysisResponse[];
}

const HistoryList = ({ entries }: HistoryListProps) => {
  const navigate = useNavigate();

  if (!entries.length) {
    return (
      <div className="rounded border p-4 text-sm text-slate-600">
        Recent analyses will appear here.
      </div>
    );
  }

  return (
    <section className="rounded border p-4">
      <header className="mb-2">
        <h2 className="text-lg font-semibold">Recent Analyses</h2>
      </header>
      <ul className="space-y-2 text-sm text-slate-700">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => navigate('/results', { state: entry })}
              className="flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-slate-100"
            >
              <span>{entry.matches[0]?.pokemon.name ?? 'Unknown'}</span>
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HistoryList;

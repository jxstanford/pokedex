import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';
import MatchResults from '../components/MatchResults';
import HistoryList from '../components/HistoryList';
import Alert from '../components/Alert';
import { useAnalyze } from '../hooks/useAnalyze';
import { useHistoryStore } from '../store/history';

const Home = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const mutation = useAnalyze();
  const addEntry = useHistoryStore((state) => state.addEntry);
  const historyEntries = useHistoryStore((state) => state.entries);

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const result = await mutation.mutateAsync(file);
      addEntry(result);
      navigate('/results', { state: result });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 lg:flex-row">
      <section className="flex w-full flex-col gap-6 lg:w-1/2">
        <header>
          <h1 className="text-3xl font-bold">Pokémon Vision</h1>
          <p className="text-slate-600">Capture or upload a photo to find the closest Pokémon matches.</p>
        </header>
        <CameraCapture onImageCapture={handleFile} disabled={mutation.isPending} isCapturing={mutation.isPending} />
        <ImageUpload onSelect={handleFile} disabled={mutation.isPending} />
        {mutation.isPending && <p className="text-sm text-slate-600">Analyzing image…</p>}
        {error && <Alert message={error} onClose={() => setError(null)} />}
      </section>
      <aside className="w-full space-y-4 lg:w-1/2">
        <MatchResults matches={mutation.data?.matches ?? []} isLoading={mutation.isPending} />
        <HistoryList entries={historyEntries} />
      </aside>
    </main>
  );
};

export default Home;

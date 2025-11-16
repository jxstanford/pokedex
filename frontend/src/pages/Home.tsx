import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';
import { useAnalyze } from '../hooks/useAnalyze';

const Home = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const mutation = useAnalyze();

  const handleFile = async (file: File) => {
    setError(null);
    try {
      const result = await mutation.mutateAsync(file);
      navigate('/results', { state: result });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      <h1 className="text-3xl font-bold">Pokémon Vision</h1>
      <CameraCapture onImageCapture={handleFile} />
      <ImageUpload onSelect={handleFile} />
      {mutation.isPending && <p>Uploading…</p>}
      {error && <p className="text-red-500">{error}</p>}
    </main>
  );
};

export default Home;

import { useState } from 'react';
import { RotomPhone } from '@/components/RotomPhone';
import { PokemonDetail as PokemonDetailComponent } from '@/components/PokemonDetail';
import * as api from './services/api';
import type { PokemonMatch, Analysis } from './types/pokemon';

export type ViewMode = 'home' | 'camera' | 'upload' | 'results' | 'history';

function App() {
  const [matches, setMatches] = useState<PokemonMatch[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonMatch | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('home');

  const handleImageAnalysis = async (imageInput: string | File) => {
    try {
      setIsAnalyzing(true);
      let file: File;

      if (typeof imageInput === 'string') {
        // Convert data URL to File
        const res = await fetch(imageInput);
        const blob = await res.blob();
        file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      } else {
        file = imageInput;
      }

      const response = await api.analyzeImage(file);

      // Transform backend response to PokemonMatch[]
      const results: PokemonMatch[] = response.matches.map((match) => ({
        id: match.pokemon.id.toString(),
        name: match.pokemon.name,
        similarity: match.similarity_score,
        types: match.pokemon.types,
        imageUrl: match.pokemon.image_url,
        description: match.pokemon.description || '',
        height: match.pokemon.stats ? '' : '', // Placeholder, map if available
        weight: match.pokemon.stats ? '' : '', // Placeholder
        generation: 0, // Placeholder
        abilities: match.pokemon.abilities || [],
        stats: {
          hp: match.pokemon.stats?.hp || 0,
          attack: match.pokemon.stats?.attack || 0,
          defense: match.pokemon.stats?.defense || 0,
          spAttack: match.pokemon.stats?.special_attack || 0,
          spDefense: match.pokemon.stats?.special_defense || 0,
          speed: match.pokemon.stats?.speed || 0,
        }
      }));

      setMatches(results);

      if (results.length > 0) {
        // Add to recent analyses
        const newAnalysis: Analysis = {
          id: Date.now().toString(),
          pokemonName: results[0].name,
          timestamp: new Date(),
          imageUrl: URL.createObjectURL(file)
        };
        setAnalyses(prev => [newAnalysis, ...prev]);
      }

      setCurrentView('results');
    } catch (error) {
      console.error("Analysis failed:", error);
      // TODO: Add error handling toast here
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-8">
      <RotomPhone
        currentView={currentView}
        onViewChange={setCurrentView}
        onImageAnalysis={handleImageAnalysis}
        isAnalyzing={isAnalyzing}
        matches={matches}
        analyses={analyses}
        onPokemonSelect={setSelectedPokemon}
      />

      {selectedPokemon && (
        <PokemonDetailComponent
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
}

export default App;

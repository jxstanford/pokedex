import { useState } from 'react';
import { RotomPhone } from './components/RotomPhone';
import { PokemonDetail } from './components/PokemonDetail';
import { mockPokemonMatches } from './data/mockData';

export interface PokemonMatch {
  id: string;
  name: string;
  similarity: number;
  types: string[];
  imageUrl?: string;
  description: string;
  height: string;
  weight: string;
  generation: number;
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
  };
}

export interface Analysis {
  id: string;
  pokemonName: string;
  timestamp: Date;
  imageUrl?: string;
}

export type ViewMode = 'home' | 'camera' | 'upload' | 'results' | 'history';

export default function App() {
  const [matches, setMatches] = useState<PokemonMatch[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonMatch | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([
    {
      id: '1',
      pokemonName: 'Koraidon-Limited-Build',
      timestamp: new Date(Date.now() - 4 * 60 * 1000)
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('home');

  const handleImageAnalysis = async (imageUrl: string) => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = mockPokemonMatches;
    setMatches(results);
    
    // Add to recent analyses
    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      pokemonName: results[0].name,
      timestamp: new Date(),
      imageUrl
    };
    setAnalyses(prev => [newAnalysis, ...prev]);
    
    setIsAnalyzing(false);
    setCurrentView('results');
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
        <PokemonDetail
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
}
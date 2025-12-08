import { motion } from 'motion/react';
import { Camera, Upload, Trophy, Clock, Home, Zap } from 'lucide-react';
import { RotomBackground } from './RotomBackground';
import { CameraView } from './CameraView';
import { UploadView } from './UploadView';
import { ResultsView } from './ResultsView';
import { HistoryView } from './HistoryView';
import { HomeView } from './HomeView';
import type { ViewMode } from '../App';
import type { PokemonMatch, Analysis } from '../types/pokemon';

interface RotomPhoneProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onImageAnalysis: (imageUrl: string) => void;
  isAnalyzing: boolean;
  matches: PokemonMatch[];
  analyses: Analysis[];
  onPokemonSelect: (pokemon: PokemonMatch) => void;
}

export function RotomPhone({
  currentView,
  onViewChange,
  onImageAnalysis,
  isAnalyzing,
  matches,
  analyses,
  onPokemonSelect,
}: RotomPhoneProps) {
  const navButtons = [
    { id: 'home' as ViewMode, icon: Home, color: 'from-cyan-500 to-blue-500' },
    { id: 'camera' as ViewMode, icon: Camera, color: 'from-orange-500 to-red-500' },
    { id: 'upload' as ViewMode, icon: Upload, color: 'from-blue-500 to-cyan-500' },
    { id: 'results' as ViewMode, icon: Trophy, color: 'from-purple-500 to-pink-500', badge: matches.length > 0 },
    { id: 'history' as ViewMode, icon: Clock, color: 'from-green-500 to-emerald-500', badge: analyses.length > 0 },
  ];

  return (
    <div className="relative">
      {/* Phone bezel */}
      <div className="bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 rounded-3xl p-6 shadow-2xl border-4 border-gray-900">
        {/* Screen container */}
        <div className="relative w-[900px] h-[500px] bg-black rounded-2xl overflow-hidden border-4 border-gray-900 shadow-inner">
          {/* Rotom background */}
          <RotomBackground />

          {/* Content overlay */}
          <div className="relative z-10 h-full flex">
            {/* Left navigation panel */}
            <div className="w-24 flex flex-col items-center justify-center gap-4 p-4">
              {navButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => onViewChange(button.id)}
                  className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${button.color} 
                    ${currentView === button.id ? 'ring-4 ring-white shadow-2xl scale-110' : 'opacity-70 hover:opacity-100'}
                    transition-all duration-300 flex items-center justify-center group`}
                >
                  <button.icon className="w-7 h-7 text-white" />
                  {button.badge && currentView !== button.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-gray-800 animate-pulse" />
                  )}

                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${button.color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity`} />
                </button>
              ))}
            </div>

            {/* Main content area */}
            <div className="flex-1 p-6 overflow-hidden">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {currentView === 'home' && <HomeView onViewChange={onViewChange} />}
                {currentView === 'camera' && (
                  <CameraView onCapture={onImageAnalysis} isAnalyzing={isAnalyzing} />
                )}
                {currentView === 'upload' && (
                  <UploadView onUpload={onImageAnalysis} isAnalyzing={isAnalyzing} />
                )}
                {currentView === 'results' && (
                  <ResultsView matches={matches} onPokemonSelect={onPokemonSelect} />
                )}
                {currentView === 'history' && (
                  <HistoryView analyses={analyses} />
                )}
              </motion.div>
            </div>
          </div>

          {/* Top status bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center"
              >
                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              </motion.div>
              <span className="text-white tracking-widest rotom-screen-title text-lg">
                ROTOM-DEX
              </span>
            </div>
            <div className="text-cyan-300 text-sm font-mono">SCANNING MODE</div>
          </div>
        </div>
      </div>

      {/* Speaker grille below screen */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-gray-600 rounded-full" />
        ))}
      </div>
    </div>
  );
}

import { Book, Camera, Clock, Home, Trophy, Upload, Zap } from "lucide-react";
import { motion } from "motion/react";
import type {
	AnalysisHistoryEntry,
	ApiPokemon,
	PokemonMatch,
	ViewMode,
} from "../types";
import { CameraView } from "./CameraView";
import { DetailView } from "./DetailView";
import { HistoryView } from "./HistoryView";
import { HomeView } from "./HomeView";
import { PokedexView } from "./PokedexView";
import { ResultsView } from "./ResultsView";
import { RotomBackground } from "./RotomBackground";
import { UploadView } from "./UploadView";

interface RotomPhoneProps {
	currentView: ViewMode;
	onViewChange: (view: ViewMode) => void;
	onAnalyze: (file: File, previewUrl: string) => void;
	isAnalyzing: boolean;
	matches: PokemonMatch[];
	analyses: AnalysisHistoryEntry[];
	onHistorySelect: (entry: AnalysisHistoryEntry) => void;
	onPokemonSelect: (pokemon: PokemonMatch) => void;
	onPokedexSelect: (pokemon: ApiPokemon) => void;
	previewUrl: string | null;
	clearError: () => void;
	selectedPokemon: PokemonMatch | null;
	isDetailLoading?: boolean;
	detailError?: string | null;
	onDetailClose: () => void;
}

export function RotomPhone({
	currentView,
	onViewChange,
	onAnalyze,
	isAnalyzing,
	matches,
	analyses,
	onHistorySelect,
	onPokemonSelect,
	onPokedexSelect,
	previewUrl,
	clearError,
	selectedPokemon,
	isDetailLoading,
	detailError,
	onDetailClose,
}: RotomPhoneProps) {
	const navButtons = [
		{ id: "home" as ViewMode, icon: Home, color: "from-cyan-500 to-blue-500" },
		{
			id: "camera" as ViewMode,
			icon: Camera,
			color: "from-orange-500 to-red-500",
		},
		{
			id: "upload" as ViewMode,
			icon: Upload,
			color: "from-blue-500 to-cyan-500",
		},
		{
			id: "results" as ViewMode,
			icon: Trophy,
			color: "from-purple-500 to-pink-500",
			badge: matches.length > 0,
		},
		{
			id: "history" as ViewMode,
			icon: Clock,
			color: "from-green-500 to-emerald-500",
			badge: analyses.length > 0,
		},
		{
			id: "pokedex" as ViewMode,
			icon: Book,
			color: "from-red-500 to-orange-500",
		},
	];

	const changeView = (view: ViewMode) => {
		clearError();
		onViewChange(view);
	};

	return (
		<div className="relative">
			<div className="bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 rounded-3xl p-6 shadow-2xl border-4 border-gray-900">
				<div className="relative w-[900px] h-[500px] bg-black rounded-2xl overflow-hidden border-4 border-gray-900 shadow-inner">
					<RotomBackground />

					<div className="relative z-10 h-full flex">
						<div className="w-24 flex flex-col items-center justify-center gap-4 p-4">
							{navButtons.map((button) => (
								<button
									key={button.id}
									onClick={() => changeView(button.id)}
									className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${button.color}
                    ${
											currentView === button.id ||
											(button.id === "results" && currentView === "detail")
												? "ring-4 ring-white shadow-2xl scale-110"
												: "opacity-70 hover:opacity-100"
										}
                    transition-all duration-300 flex items-center justify-center group`}
								>
									<button.icon className="w-7 h-7 text-white" />
									{button.badge && currentView !== button.id && (
										<div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-gray-800 animate-pulse" />
									)}
									<div
										className={`absolute inset-0 rounded-full bg-gradient-to-br ${button.color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity`}
									/>
								</button>
							))}
						</div>

						<div className="flex-1 p-6 overflow-hidden">
							<motion.div
								key={currentView}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.3 }}
								className="h-full"
							>
								{currentView === "home" && (
									<HomeView onViewChange={changeView} />
								)}
								{currentView === "camera" && (
									<CameraView onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} />
								)}
								{currentView === "upload" && (
									<UploadView onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} />
								)}
								{currentView === "results" && (
									<ResultsView
										matches={matches}
										onPokemonSelect={onPokemonSelect}
										previewUrl={previewUrl}
									/>
								)}
								{currentView === "history" && (
									<HistoryView analyses={analyses} onSelect={onHistorySelect} />
								)}
								{currentView === "detail" && selectedPokemon && (
									<DetailView
										pokemon={selectedPokemon}
										onBack={onDetailClose}
										isLoading={isDetailLoading}
										error={detailError}
									/>
								)}
								{currentView === "pokedex" && (
									<PokedexView onSelect={onPokedexSelect} />
								)}
							</motion.div>
						</div>
					</div>

					<div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
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

			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
				{Array.from({ length: 8 }).map((_, index) => (
					<div key={index} className="w-1 h-1 bg-gray-600 rounded-full" />
				))}
			</div>
		</div>
	);
}

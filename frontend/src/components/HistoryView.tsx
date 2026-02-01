import { ChevronRight, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { AnalysisHistoryEntry } from "../types";

interface HistoryViewProps {
	analyses: AnalysisHistoryEntry[];
	onSelect: (analysis: AnalysisHistoryEntry) => void;
}

function PreviewImage({ analysis }: { analysis: AnalysisHistoryEntry }) {
	const [failed, setFailed] = useState(false);
	const fallbackUrl = analysis.matches[0]?.imageUrl;

	if (!analysis.previewUrl && !fallbackUrl) {
		return <ImageIcon className="w-6 h-6 text-white/40" />;
	}

	const src = failed ? fallbackUrl : analysis.previewUrl || fallbackUrl;

	if (!src) {
		return <ImageIcon className="w-6 h-6 text-white/40" />;
	}

	return (
		<img
			src={src}
			alt="Preview"
			className="w-full h-full object-cover"
			loading="lazy"
			onError={() => !failed && fallbackUrl && setFailed(true)}
		/>
	);
}

export function HistoryView({ analyses, onSelect }: HistoryViewProps) {
	const formatTimestamp = (iso: string) => {
		const date = new Date(iso);
		const now = new Date();
		const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diff < 60) return "Just now";
		if (diff < 3600) {
			const minutes = Math.floor(diff / 60);
			return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
		}
		if (diff < 86400) {
			const hours = Math.floor(diff / 3600);
			return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
		}
		const days = Math.floor(diff / 86400);
		return `${days} ${days === 1 ? "day" : "days"} ago`;
	};

	if (analyses.length === 0) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center">
					<p className="text-white/60 text-xl">No history yet</p>
					<p className="text-white/40 mt-2">
						Your scanned Pokémon will appear here
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-auto custom-scrollbar pr-2">
			<h2 className="text-2xl text-white mb-4 tracking-wider">SCAN HISTORY</h2>
			<div className="space-y-3">
				{analyses.map((analysis, index) => (
					<motion.button
						key={analysis.id}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.05 }}
						onClick={() => onSelect(analysis)}
						className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-2xl p-4 transition-all text-left group"
					>
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<div className="w-14 h-14 rounded-xl bg-black/40 border border-white/15 overflow-hidden flex items-center justify-center flex-shrink-0">
									<PreviewImage analysis={analysis} />
								</div>
								<div className="min-w-0">
									<p className="text-white text-lg truncate group-hover:text-cyan-200 transition-colors">
										{analysis.pokemonName}
									</p>
									<p className="text-sm text-white/60 mt-1 font-mono">
										{formatTimestamp(analysis.timestamp)}
									</p>
								</div>
							</div>
							<ChevronRight className="w-6 h-6 text-white/40 group-hover:text-cyan-200 transition-colors flex-shrink-0" />
						</div>
					</motion.button>
				))}
			</div>
		</div>
	);
}

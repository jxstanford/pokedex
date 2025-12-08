import { useRef, useState } from "react";
import { Upload, Loader2, Image as ImageIcon, ShieldCheck, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES } from "../lib/api";

interface UploadViewProps {
  onAnalyze: (file: File, previewUrl: string) => void;
  isAnalyzing: boolean;
}

export function UploadView({ onAnalyze, isAnalyzing }: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setError("Unsupported format. Use JPEG, PNG, or WebP.");
      return false;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Image exceeds the 10MB limit.");
      return false;
    }
    return true;
  };

  const handleFile = (file: File) => {
    setError(null);
    if (!validateFile(file)) return;
    const url = URL.createObjectURL(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(file);
    setPreviewUrl(url);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const [file] = event.dataTransfer.files;
    if (file) handleFile(file);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    if (file) handleFile(file);
  };

  const analyze = () => {
    if (!uploadedFile || !previewUrl) return;
    onAnalyze(uploadedFile, previewUrl);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {!uploadedFile ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragActive(false);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDrop={handleDrop}
            className={`relative border-4 border-dashed rounded-3xl p-16 text-center transition-all ${
              dragActive
                ? "border-white bg-white/20 backdrop-blur-md"
                : "border-white/40 bg-white/10 backdrop-blur-md hover:border-white/60 hover:bg-white/15"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            <ImageIcon className="w-24 h-24 mx-auto mb-6 text-white" />
            <h2 className="text-2xl text-white mb-2">Upload Image</h2>
            <p className="text-white/80 mb-6">Drag and drop or browse to select a file.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all shadow-lg text-lg"
            >
              Choose File
            </button>
            <p className="text-white/60 text-sm mt-4">JPEG, PNG, or WebP up to 10MB</p>
            {error && (
              <p className="text-red-200 mt-3 text-sm flex items-center justify-center gap-2">
                <TriangleAlert className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="w-full max-w-2xl text-center">
          <div className="relative rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl mb-6">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Uploaded"
                className="w-full max-h-80 object-contain bg-black/50"
              />
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
                  <div className="text-cyan-400 text-xl tracking-wider">ANALYZING...</div>
                  <div className="text-cyan-600 mt-2">Processing vectors...</div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-200 text-sm mb-3 flex items-center justify-center gap-2">
              <TriangleAlert className="w-4 h-4" />
              {error}
            </p>
          )}

          {!isAnalyzing && (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-green-500/20 border-2 border-green-400/40 rounded-xl p-3 backdrop-blur-md flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-200" />
                <p className="text-green-100 text-sm">Preview ready. Confirm to analyze.</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={analyze}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-60 text-white rounded-xl transition-all shadow-lg"
                >
                  Analyze Image
                </button>
                <button
                  onClick={reset}
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-all border-2 border-white/30"
                >
                  Choose Another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

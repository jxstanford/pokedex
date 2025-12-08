import { useState, useRef } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadViewProps {
  onUpload: (imageUrl: string) => void;
  isAnalyzing: boolean;
}

export function UploadView({ onUpload, isAnalyzing }: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      onUpload(url);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {!uploadedImage ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-4 border-dashed rounded-3xl p-16 text-center transition-all ${
              dragActive 
                ? 'border-white bg-white/20 backdrop-blur-md' 
                : 'border-white/40 bg-white/10 backdrop-blur-md hover:border-white/60 hover:bg-white/15'
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
            <h2 className="text-2xl text-white mb-4">Upload Image</h2>
            <p className="text-white/80 mb-6">
              Drop an image here or click to browse
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all shadow-lg text-lg"
            >
              Choose File
            </button>
            <p className="text-white/60 text-sm mt-4">
              Supported: JPEG, PNG, WebP
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="w-full max-w-2xl text-center">
          <div className="relative rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl mb-6">
            <img src={uploadedImage} alt="Uploaded" className="w-full max-h-80 object-contain bg-black/50" />
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
          {!isAnalyzing && (
            <div className="bg-green-500/30 border-2 border-green-400 rounded-xl p-4 backdrop-blur-md">
              <p className="text-green-100 text-lg">✓ SCAN COMPLETE</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

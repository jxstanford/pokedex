import { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadSectionProps {
  onImageUpload: (imageUrl: string) => void;
  isAnalyzing: boolean;
}

export function UploadSection({ onImageUpload, isAnalyzing }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      setPreviewUrl(url);
      onImageUpload(url);
    }
  };

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const url = canvas.toDataURL('image/jpeg');
        setPreviewUrl(url);
        onImageUpload(url);
        disableCamera();
      }
    }
  };

  const disableCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraEnabled(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative"
    >
      {/* Holographic border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-50 blur-sm" />
      
      <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
        {/* Tech pattern overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 255, 255, 0.5) 10px, rgba(0, 255, 255, 0.5) 11px)',
          }} />
        </div>

        {/* Header bar */}
        <div className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 px-4 py-3 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <h2 className="text-cyan-100 tracking-wider text-sm">TARGET ACQUISITION</h2>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl p-3 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 border border-cyan-400/30 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <Upload className="w-5 h-5" />
            <span className="tracking-wide">UPLOAD IMAGE</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Camera Button */}
          {!cameraEnabled ? (
            <button
              onClick={enableCamera}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl p-3 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 border border-orange-400/30 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <Camera className="w-5 h-5" />
              <span className="tracking-wide">LIVE CAPTURE</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border-2 border-cyan-500/50">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    animate={{ y: [0, 200, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={capturePhoto}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl p-2.5 transition-all shadow-lg border border-green-400/30"
                >
                  CAPTURE
                </button>
                <button
                  onClick={disableCamera}
                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl p-2.5 transition-all shadow-lg border border-slate-400/30"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {/* Preview and Analysis */}
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-3 border-t border-cyan-500/20"
            >
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-cyan-500/50">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-40 object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-2" />
                        <div className="text-cyan-400 tracking-wider text-sm">ANALYZING...</div>
                        <div className="text-cyan-600 text-xs mt-1">Processing vectors...</div>
                      </div>
                    </div>
                  )}
                </div>
                {!isAnalyzing && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-2.5 text-center backdrop-blur-sm">
                    <p className="text-green-300 tracking-wide text-sm">✓ SCAN COMPLETE</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
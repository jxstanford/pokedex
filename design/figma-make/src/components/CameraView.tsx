import { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';

interface CameraViewProps {
  onCapture: (imageUrl: string) => void;
  isAnalyzing: boolean;
}

export function CameraView({ onCapture, isAnalyzing }: CameraViewProps) {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
        setCapturedImage(url);
        onCapture(url);
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
    <div className="h-full flex flex-col items-center justify-center">
      {!cameraEnabled && !capturedImage ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/30">
            <Camera className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-2xl text-white mb-4">Live Camera Capture</h2>
          <button
            onClick={enableCamera}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all shadow-lg text-lg"
          >
            Activate Camera
          </button>
        </motion.div>
      ) : cameraEnabled ? (
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video object-cover"
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ y: [0, 300, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400"
              />
            </div>

            {/* Targeting reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-white/50 rounded-lg relative">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-cyan-400" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-cyan-400" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-cyan-400" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-cyan-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6 justify-center">
            <button
              onClick={capturePhoto}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all shadow-lg"
            >
              Capture
            </button>
            <button
              onClick={disableCamera}
              className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-all border-2 border-white/30"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : capturedImage && (
        <div className="w-full max-w-2xl text-center">
          <div className="relative rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl mb-6">
            <img src={capturedImage} alt="Captured" className="w-full" />
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

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, X, ShieldCheck, TriangleAlert } from "lucide-react";
import { motion } from "motion/react";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES } from "../lib/api";
import { CameraDeviceSelector } from "./CameraDeviceSelector";

interface CameraViewProps {
  onAnalyze: (file: File, previewUrl: string) => void;
  isAnalyzing: boolean;
}

export function CameraView({ onAnalyze, isAnalyzing }: CameraViewProps) {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [retryUsed, setRetryUsed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const streamReadyRef = useRef(false);
  const attemptIdRef = useRef(0);

  useEffect(() => {
    if (!cameraEnabled || !streamRef.current || !videoRef.current) {
      return;
    }
    const videoEl = videoRef.current;
    const stream = streamRef.current;

    videoEl.srcObject = stream;
    videoEl.playsInline = true;
    videoEl.muted = true;

    const markReady = () => {
      if (!videoEl.videoWidth || !videoEl.videoHeight) return;
      if (streamReadyRef.current) return;
      streamReadyRef.current = true;
      setStreamReady(true);
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      setDebugInfo(
        `Camera ready (${settings.width || videoEl.videoWidth}x${
          settings.height || videoEl.videoHeight
        }) ${settings.deviceId ? `device: ${settings.deviceId}` : ""}`,
      );
      console.info("Camera ready", settings);
    };

    videoEl.onloadedmetadata = markReady;
    videoEl.onloadeddata = markReady;
    videoEl.oncanplay = markReady;
    videoEl.onplaying = markReady;
    videoEl.onresize = () => {
      if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        markReady();
      }
    };

    void videoEl.play().catch(() => {
      // ignore; events above may still fire
    });
  }, [cameraEnabled]);

  useEffect(() => {
    return () => {
      disableCamera();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const enableCamera = async () => {
    const attemptId = ++attemptIdRef.current;
    setError(null);
    setStreamReady(false);
    setDebugInfo(null);
    setRetryUsed(false);
    streamReadyRef.current = false;
    disableCamera();
    try {
      const constraints = {
        video:
          selectedDeviceId != null
            ? { deviceId: { exact: selectedDeviceId } }
            : { width: { ideal: 1280 }, height: { ideal: 720 } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraEnabled(true);
      // Warn if no video frames arrive shortly after enable
      setTimeout(() => {
        if (attemptIdRef.current !== attemptId) return;
        if (!streamReadyRef.current) {
          setError("Camera preview unavailable. Check permissions or try a different device.");
          const track = stream.getVideoTracks()[0];
          if (track) {
            setDebugInfo(`Track state: ${track.readyState}, muted: ${track.muted}`);
            console.warn("Track not delivering frames", track.getSettings(), track.getConstraints());
            track.onmute = () => console.warn("Camera track muted");
            track.onunmute = () => console.warn("Camera track unmuted");
          }
          const tracks = stream.getVideoTracks();
          if (tracks.length > 1) {
            console.info("Available video tracks", tracks.map((t) => t.getSettings()));
          }
          if (!retryUsed) {
            console.info("Retrying getUserMedia with simplified constraints");
            setRetryUsed(true);
            disableCamera();
            void enableCameraFallback();
          }
        }
      }, 1500);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const enableCameraFallback = async () => {
    const attemptId = ++attemptIdRef.current;
    setError(null);
    setDebugInfo(null);
    streamReadyRef.current = false;
    disableCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video:
          selectedDeviceId != null
            ? { deviceId: { exact: selectedDeviceId } }
            : true,
      });
      streamRef.current = stream;
      setCameraEnabled(true);
      setCameraEnabled(true);
      setTimeout(() => {
        if (attemptIdRef.current !== attemptId) return;
        if (!streamReadyRef.current) {
          const track = stream.getVideoTracks()[0];
          setError("Camera stream is muted or blocked. Try another device or allow camera access.");
          if (track) {
            setDebugInfo(`Fallback track state: ${track.readyState}, muted: ${track.muted}`);
          }
        }
      }, 1500);
    } catch (err) {
      console.error("Fallback getUserMedia failed", err);
      setError("Unable to start camera. Check browser permissions or try another camera.");
    }
  };

  const disableCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
    setStreamReady(false);
    streamReadyRef.current = false;
  };

  const validateBlobAsFile = (blob: Blob): File | null => {
    const type = blob.type || "image/jpeg";
    if (!ALLOWED_MIME_TYPES.includes(type.toLowerCase())) {
      setError("Unsupported format. Use JPEG, PNG, or WebP.");
      return null;
    }
    if (blob.size > MAX_UPLOAD_BYTES) {
      setError("Image exceeds the 10MB limit.");
      return null;
    }
    return new File([blob], "capture.jpg", { type });
  };

  const capturePhoto = () => {
    setError(null);
    const videoEl = videoRef.current;
    if (!videoEl || !streamReadyRef.current) {
      setError("Camera is not ready yet. Allow access and try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth || 1280;
    canvas.height = videoEl.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not read camera stream.");
          return;
        }
        const file = validateBlobAsFile(blob);
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCapturedFile(file);
        setPreviewUrl(url);
        disableCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  const analyzeCapture = () => {
    if (!capturedFile || !previewUrl) return;
    setError(null);
    onAnalyze(capturedFile, previewUrl);
  };

  const resetCapture = () => {
    setCapturedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {!cameraEnabled && !previewUrl ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/30">
            <Camera className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-2xl text-white mb-4">Live Camera Capture</h2>
          <p className="text-white/70 mb-4 text-sm">
            Enable your camera to capture a fresh photo before analysis.
          </p>
          <button
            onClick={enableCamera}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all shadow-lg text-lg"
          >
            Activate Camera
          </button>
          <div className="flex justify-center">
            <CameraDeviceSelector onSelect={setSelectedDeviceId} />
          </div>
          {error && <p className="text-red-200 mt-3 text-sm">{error}</p>}
        </motion.div>
      ) : cameraEnabled ? (
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video object-cover bg-black"
          />

            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ y: [0, 300, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400"
              />
            </div>

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
          {error && <p className="text-red-200 mt-3 text-center text-sm">{error}</p>}
          {!error && debugInfo && (
            <p className="text-cyan-200 mt-3 text-center text-xs opacity-70">{debugInfo}</p>
          )}
        </div>
      ) : (
        <div className="w-full max-w-2xl text-center">
          <div className="relative rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl mb-6">
            {previewUrl && <img src={previewUrl} alt="Captured" className="w-full" />}
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

          {error && <p className="text-red-200 text-sm mb-3">{error}</p>}

          {!isAnalyzing && (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-green-500/20 border-2 border-green-400/40 rounded-xl p-3 backdrop-blur-md flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-200" />
                <p className="text-green-100 text-sm">Preview ready. Confirm to analyze.</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={analyzeCapture}
                  disabled={!capturedFile}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-60 text-white rounded-xl transition-all shadow-lg"
                >
                  Analyze Image
                </button>
                <button
                  onClick={() => {
                    resetCapture();
                    enableCamera();
                  }}
                  className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition-all border-2 border-white/30 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && !cameraEnabled && !previewUrl && (
        <div className="mt-4 text-red-200 flex items-center gap-2 text-sm">
          <TriangleAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

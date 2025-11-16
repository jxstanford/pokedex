import { useCallback, useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
  disabled?: boolean;
  isCapturing?: boolean;
}

const CameraCapture = ({ onImageCapture, disabled = false, isCapturing = false }: CameraCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      setIsReady(false);
    };
  }, [stream]);

  const requestCamera = useCallback(async () => {
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(nextStream);
      if (videoRef.current) {
        videoRef.current.srcObject = nextStream;
      }
    } catch (err) {
      console.error('Camera access denied', err);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !isReady) return;
    const canvas = document.createElement('canvas');
    const width = videoRef.current.videoWidth || 640;
    const height = videoRef.current.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
      onImageCapture(file);
    }, 'image/png');
  }, [onImageCapture]);

  return (
    <section className="rounded border p-4">
      <header className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Capture a photo</h2>
        {!stream && (
          <button
            onClick={requestCamera}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
            type="button"
            disabled={disabled}
          >
            Enable Camera
          </button>
        )}
      </header>
      {stream ? (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onLoadedMetadata={() => setIsReady(true)}
            className="w-full rounded"
          />
          <button
            type="button"
            className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={capturePhoto}
            disabled={disabled || isCapturing || !isReady}
          >
            {isCapturing ? 'Capturing…' : isReady ? 'Capture Photo' : 'Camera initializing…'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-600">Allow camera access to capture a new photo.</p>
      )}
    </section>
  );
};

export default CameraCapture;

import { useCallback } from 'react';

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
}

const CameraCapture = ({ onImageCapture }: CameraCaptureProps) => {
  const handleStubClick = useCallback(() => {
    const blob = new Blob(['placeholder'], { type: 'text/plain' });
    onImageCapture(new File([blob], 'placeholder.txt'));
  }, [onImageCapture]);

  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleStubClick}>
      Capture (stub)
    </button>
  );
};

export default CameraCapture;

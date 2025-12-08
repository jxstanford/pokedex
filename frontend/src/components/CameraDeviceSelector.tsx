import { useEffect, useState } from "react";

interface CameraDeviceSelectorProps {
  onSelect: (deviceId: string | null) => void;
}

interface DeviceOption {
  deviceId: string;
  label: string;
}

export function CameraDeviceSelector({ onSelect }: CameraDeviceSelectorProps) {
  const [devices, setDevices] = useState<DeviceOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadDevices = async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const cameras = mediaDevices
          .filter((d) => d.kind === "videoinput")
          .map((d, index) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${index + 1}`,
          }));
        setDevices(cameras);
      } catch (err) {
        console.warn("Unable to enumerate devices", err);
      }
    };
    void loadDevices();
    return () => {
      mounted = false;
    };
  }, []);

  if (devices.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-white/80">
      <label className="text-white/70">Camera:</label>
      <select
        className="bg-white/10 border border-white/30 rounded px-2 py-1 text-white/90 text-xs"
        value={selected || ""}
        onChange={(event) => {
          const value = event.target.value || null;
          setSelected(value);
          onSelect(value);
        }}
      >
        <option value="">System default</option>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
}

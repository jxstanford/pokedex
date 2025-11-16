interface AlertProps {
  message: string;
  onClose?: () => void;
}

const Alert = ({ message, onClose }: AlertProps) => (
  <div className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
    <span>{message}</span>
    {onClose && (
      <button type="button" onClick={onClose} className="text-xs font-semibold">
        Dismiss
      </button>
    )}
  </div>
);

export default Alert;

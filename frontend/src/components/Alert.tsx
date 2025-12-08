interface AlertProps {
  message: string;
  onClose?: () => void;
}

const Alert = ({ message, onClose }: AlertProps) => (
  <div className="glass-card flex items-center justify-between border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
    <span className="pr-3">{message}</span>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="text-xs font-semibold text-red-100 underline decoration-red-300/70 decoration-2 underline-offset-4"
      >
        Dismiss
      </button>
    )}
  </div>
);

export default Alert;

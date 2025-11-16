interface ImageUploadProps {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

const ImageUpload = ({ onSelect, disabled = false }: ImageUploadProps) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
      event.target.value = '';
    }
  };

  return (
    <section className="rounded border p-4">
      <header className="mb-2">
        <h2 className="text-lg font-semibold">Upload from library</h2>
        <p className="text-sm text-slate-600">JPEG, PNG, or WebP up to 10MB.</p>
      </header>
      <label className="flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-slate-300 px-6 py-8 text-center text-slate-600">
        <span>Select an image</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        <span className="text-xs">or drag & drop here</span>
      </label>
    </section>
  );
};

export default ImageUpload;

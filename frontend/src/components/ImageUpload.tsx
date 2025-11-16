interface ImageUploadProps {
  onSelect: (file: File) => void;
}

const ImageUpload = ({ onSelect }: ImageUploadProps) => {
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) {
          onSelect(file);
        }
      }}
    />
  );
};

export default ImageUpload;

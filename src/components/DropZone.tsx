import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

const DropZone = ({ onFileSelect, isLoading }: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        drop-zone w-full aspect-[16/9] cursor-pointer
        flex flex-col items-center justify-center gap-8 p-8
        ${isDragOver ? 'drop-zone-active' : ''}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Upload className="w-12 h-12 text-muted" strokeWidth={1.5} />
      
      <div className="text-center">
        <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-reading tracking-brutal leading-brutal">
          DROP FILE
        </h2>
        <p className="font-ui text-lg md:text-xl text-muted mt-4">
          [.GLB / .GLTF]
        </p>
      </div>
    </div>
  );
};

export default DropZone;

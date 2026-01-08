import { useRef, useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import gsap from 'gsap';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  loadProgress?: number;
}

const DropZone = ({ onFileSelect, isLoading, loadProgress = 0 }: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (progressBarRef.current && isLoading) {
      gsap.to(progressBarRef.current, {
        width: `${loadProgress}%`,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [loadProgress, isLoading]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (isLoading) return;
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.glb') || file.name.endsWith('.gltf'))) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !isLoading) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        drop-zone w-full aspect-[16/9] cursor-pointer relative
        flex flex-col items-center justify-center gap-8 p-8
        ${isDragOver ? 'drop-zone-active' : ''}
        ${isLoading ? 'pointer-events-none' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-6">
          <img 
            src="/loading.svg" 
            alt="Loading" 
            className="w-20 h-20"
            style={{ 
              filter: 'invert(56%) sepia(52%) saturate(2071%) hue-rotate(314deg) brightness(100%) contrast(97%)',
              animation: 'wobble 2s ease-in-out infinite'
            }}
          />
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl text-reading tracking-brutal leading-brutal mb-4">
              LOADING FILE
            </h2>
            <div className="w-64 h-2 bg-muted/30 overflow-hidden">
              <div 
                ref={progressBarRef}
                className="h-full bg-active"
                style={{ width: '0%' }}
              />
            </div>
            <p className="font-ui text-sm text-muted mt-2">
              {Math.round(loadProgress)}%
            </p>
          </div>
        </div>
      ) : (
        <>
          <Upload className="w-12 h-12 text-muted" strokeWidth={1.5} />
          
          <div className="text-center">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl text-reading tracking-brutal leading-brutal">
              DROP FILE
            </h2>
            <p className="font-ui text-lg md:text-xl text-muted mt-4">
              [.GLB / .GLTF]
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DropZone;

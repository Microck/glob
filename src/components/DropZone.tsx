import { useRef, useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import gsap from 'gsap';

export type AnimationType = 
  | 'glitch-slide' | 'elastic-pop' | 'flash-bang' | 'cinema-scope' | 'curtain' | 'blur-snap' | 'squeeze'
  | 'scanline' | 'pixelate' | 'glitch-shake' | 'hydraulic' | 'rotate-snap' | 'perspective-tilt'
  | 'stomp' | 'slide-up' | 'slide-down' | 'zoom-in' | 'flip-x' | 'flip-y' | 'jitter';

interface DropZoneProps {
  onFileSelect: (files: File[]) => void;
  isLoading?: boolean;
  loadProgress?: number;
  animationType?: AnimationType;
  maxFiles?: number;
}

const DropZone = ({ 
  onFileSelect, 
  isLoading, 
  loadProgress = 0, 
  animationType = 'glitch-slide',
  maxFiles = 1
}: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      
      gsap.set(el, { clearProps: 'all' });
      
      switch (animationType) {
        case 'glitch-slide':
          gsap.fromTo(el,
            { x: -20, opacity: 0, skewX: 20 },
            { x: 0, opacity: 1, skewX: 0, duration: 0.4, ease: 'back.out(1.7)' }
          );
          break;
        case 'elastic-pop':
          gsap.fromTo(el,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' }
          );
          break;
        case 'flash-bang':
          gsap.fromTo(el,
            { opacity: 0, filter: 'invert(1) brightness(2)' },
            { opacity: 1, filter: 'invert(0) brightness(1)', duration: 0.1, delay: 0.1 }
          );
          break;
        case 'cinema-scope':
          gsap.fromTo(el,
            { clipPath: 'inset(50% 0 50% 0)' },
            { clipPath: 'inset(0% 0 0% 0)', duration: 0.8, ease: 'expo.out' }
          );
          break;
        case 'curtain':
          gsap.fromTo(el,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'circ.out' }
          );
          break;
        case 'blur-snap':
          gsap.fromTo(el,
            { filter: 'blur(20px)', opacity: 0, scale: 1.1 },
            { filter: 'blur(0px)', opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
          );
          break;
        case 'squeeze':
          gsap.fromTo(el,
            { scaleX: 1.5, scaleY: 0.1, opacity: 0 },
            { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.3)' }
          );
          break;
        case 'scanline':
          gsap.fromTo(el,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'steps(5)' }
          );
          break;
        case 'pixelate':
          gsap.fromTo(el,
            { filter: 'blur(10px) contrast(200%)', opacity: 0 },
            { filter: 'blur(0px) contrast(100%)', opacity: 1, duration: 0.6, ease: 'power2.out' }
          );
          break;
        case 'glitch-shake':
          gsap.fromTo(el,
            { x: 0 },
            { x: 0, duration: 0.5, ease: 'rough({ template: none.out, strength: 1, points: 20, taper: "none", randomize: true, clamp: false })' }
          );
          gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.1 });
          break;
        case 'hydraulic':
          gsap.fromTo(el,
            { scaleY: 0, transformOrigin: 'center' },
            { scaleY: 1, duration: 0.6, ease: 'circ.out' }
          );
          break;
        case 'rotate-snap':
          gsap.fromTo(el,
            { rotation: 15, opacity: 0, scale: 0.8 },
            { rotation: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
          );
          break;
        case 'perspective-tilt':
          gsap.fromTo(el,
            { rotationX: 45, y: 50, opacity: 0, transformPerspective: 1000 },
            { rotationX: 0, y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }
          );
          break;
        case 'stomp':
          gsap.fromTo(el,
            { scale: 2, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'bounce.out' }
          );
          break;
        case 'slide-up':
          gsap.fromTo(el,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
          );
          break;
        case 'slide-down':
          gsap.fromTo(el,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
          );
          break;
        case 'zoom-in':
          gsap.fromTo(el,
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
          );
          break;
        case 'flip-x':
          gsap.fromTo(el,
            { rotationX: 90, opacity: 0 },
            { rotationX: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }
          );
          break;
        case 'flip-y':
          gsap.fromTo(el,
            { rotationY: 90, opacity: 0 },
            { rotationY: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }
          );
          break;
        case 'jitter':
          gsap.fromTo(el,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'steps(5)' }
          );
          break;
      }
    }
  }, [animationType]);

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
    
    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter(file => file.name.endsWith('.glb') || file.name.endsWith('.gltf'))
      .slice(0, maxFiles);
      
    if (droppedFiles.length > 0) {
      onFileSelect(droppedFiles);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files 
      ? Array.from(e.target.files)
          .filter(file => file.name.endsWith('.glb') || file.name.endsWith('.gltf'))
          .slice(0, maxFiles)
      : [];
      
    if (selectedFiles.length > 0 && !isLoading) {
      onFileSelect(selectedFiles);
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
        drop-zone w-full aspect-[16/9] cursor-pointer relative z-10
        flex flex-col items-center justify-center gap-8 p-8
        ${isDragOver ? 'drop-zone-active' : ''}
        ${isLoading ? 'pointer-events-none' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf"
        multiple={maxFiles > 1}
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

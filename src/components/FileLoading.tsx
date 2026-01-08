import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import LoadingIndicator from './LoadingIndicator';

interface FileLoadingProps {
  fileName: string;
  progress?: number;
}

const FileLoading = ({ fileName, progress }: FileLoadingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-4xl border-3 border-muted bg-surface p-8">
      <LoadingIndicator 
        text="LOADING FILE" 
        subText={fileName}
        showCat={true}
        size="lg"
      />
      {progress !== undefined && (
        <div className="w-full max-w-xs mx-auto mt-4">
          <div className="flex justify-between text-xs text-muted mb-1 font-ui">
            <span>PROGRESS</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-muted h-2">
            <div 
              className="bg-active h-2"
              style={{ width: `${progress}%`, transition: 'width 0.3s ease-out' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileLoading;

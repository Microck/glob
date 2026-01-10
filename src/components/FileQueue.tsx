import { X, FileBox, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface FileQueueProps {
  files: File[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onStart: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileQueue = ({ files, onRemove, onClear, onStart }: FileQueueProps) => {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (itemsRef.current) {
      gsap.fromTo(itemsRef.current.children,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [files.length]);

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between border-b-3 border-muted pb-4">
        <div>
          <h2 className="font-display text-3xl text-reading tracking-brutal leading-none">
            READY TO OPTIMIZE
          </h2>
          <p className="font-ui text-sm text-muted mt-1 uppercase">
            {files.length} FILES • {formatFileSize(totalSize)} TOTAL
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
           <span className="font-ui text-xs text-active animate-pulse">
             AWAITING CONFIRMATION
           </span>
        </div>
      </div>

      <div ref={itemsRef} className="grid gap-3">
        {files.map((file, index) => (
          <div 
            key={`${file.name}-${index}`}
            className="group flex items-center justify-between p-4 bg-surface border-3 border-muted hover:border-active transition-colors"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-10 h-10 flex items-center justify-center bg-muted/20 text-muted group-hover:text-active group-hover:bg-active/10 transition-colors">
                <FileBox size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-ui text-reading truncate text-lg leading-none mb-1">
                  {file.name}
                </span>
                <span className="font-ui text-xs text-muted">
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onRemove(index)}
              className="p-2 text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Remove file"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          onClick={onStart}
          className="flex-1 btn-download flex items-center justify-center gap-3 group"
        >
          <span>START OPTIMIZATION</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={onClear}
          className="btn-brutal px-8 hover:bg-destructive hover:text-white hover:border-destructive"
        >
          CLEAR ALL
        </button>
      </div>
    </div>
  );
};

export default FileQueue;

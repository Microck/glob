import { OptimizeResponse } from '@/lib/api';
import { Loader2, Check, X, Clock, Eye } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export type FileStatus = 'pending' | 'processing' | 'completed' | 'error';

interface BulkProgressListProps {
  files: File[];
  status: FileStatus[];
  currentProgress: number;
  results: (OptimizeResponse | null)[];
  onView?: (index: number) => void;
}

const BulkProgressList = ({ files, status, currentProgress, results, onView }: BulkProgressListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 30, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (listRef.current?.children) {
      gsap.fromTo(listRef.current.children,
        { x: -15, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.25, stagger: 0.03, ease: 'power2.out' }
      );
    }
  }, [files.length]);

  return (
    <div ref={containerRef} className="w-full max-w-2xl border-3 border-muted bg-surface p-4">
      <div className="font-display text-xl mb-4 text-reading">BATCH PROGRESS</div>
      <div ref={listRef} className="space-y-2">
        {files.map((file, index) => {
           const s = status[index];
           const isProcessing = s === 'processing';
           const isCompleted = s === 'completed';
           const isError = s === 'error';
           const result = results[index];
           
           let reduction = '';
           if (result && result.originalSize > 0) {
               const red = ((result.originalSize - result.optimizedSize) / result.originalSize) * 100;
               reduction = `-${red.toFixed(1)}%`;
           }
           
            return (
              <div key={index} className="flex items-center gap-3 border-2 border-muted p-3 bg-background">
                 <div className="w-6 flex justify-center">
                     {s === 'pending' && <Clock className="w-5 h-5 text-muted" />}
                     {s === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-active" />}
                     {s === 'completed' && <Check className="w-5 h-5 text-green-500" />}
                     {s === 'error' && <X className="w-5 h-5 text-destructive" />}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between">
                         <div className="font-ui text-sm truncate">{file.name}</div>
                         {isCompleted && onView && (
                             <button 
                               onClick={() => onView(index)}
                               className="p-1 hover:bg-muted text-muted hover:text-active transition-colors flex items-center gap-1"
                               title="View Comparison"
                             >
                               <Eye className="w-4 h-4" />
                               <span className="text-[10px] font-bold uppercase">View</span>
                             </button>
                         )}
                     </div>
                     {isProcessing && (
                        <div className="w-full h-1 bg-muted mt-2 relative overflow-hidden">
                            <div 
                                className="h-full bg-active transition-all duration-300 ease-out" 
                                style={{ width: `${currentProgress}%` }} 
                            />
                        </div>
                    )}
                </div>
                
                <div className="font-ui text-sm font-bold min-w-[80px] text-right">
                    {isProcessing && `${Math.round(currentProgress)}%`}
                    {isCompleted && <span className="text-active">{reduction}</span>}
                    {isError && <span className="text-destructive">FAILED</span>}
                    {s === 'pending' && <span className="text-muted">WAITING</span>}
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default BulkProgressList;

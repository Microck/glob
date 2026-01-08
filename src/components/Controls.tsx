import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';

interface ControlsProps {
  decimation: number;
  dracoLevel: number;
  onDecimationChange: (value: number) => void;
  onDracoChange: (value: number) => void;
  onCompress: () => void;
  isProcessing: boolean;
  hasFile: boolean;
}

const Controls = ({ 
  decimation, 
  dracoLevel, 
  onDecimationChange, 
  onDracoChange, 
  onCompress,
  isProcessing,
  hasFile
}: ControlsProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const advancedPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.4, ease: 'expo.out' }
      );
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (isAdvancedOpen) {
      if (advancedPanelRef.current) {
        gsap.to(advancedPanelRef.current, {
          opacity: 0,
          height: 0,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => {
            setIsAdvancedOpen(false);
            setShouldRender(false);
          }
        });
      }
    } else {
      setShouldRender(true);
      setIsAdvancedOpen(true);
    }
  }, [isAdvancedOpen]);

  useEffect(() => {
    if (advancedPanelRef.current && isAdvancedOpen && shouldRender) {
      gsap.fromTo(advancedPanelRef.current,
        { opacity: 0, height: 0 },
        { opacity: 1, height: 'auto', duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isAdvancedOpen, shouldRender]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-0">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 border-3 border-t-0 border-muted bg-surface font-ui text-sm text-muted hover:text-active hover:border-active"
        style={{ transition: 'none' }}
      >
        <span>ADVANCED_SETTINGS</span>
        <ChevronDown 
          className={`w-4 h-4 transform ${isAdvancedOpen || shouldRender ? 'rotate-180' : ''}`}
          style={{ transition: 'none' }}
        />
      </button>

      {shouldRender && (
        <div ref={advancedPanelRef} className="flex border-3 border-t-0 border-muted overflow-hidden" style={{ height: 0, opacity: 0 }}>
          <div className="flex-1 border-r-3 border-muted bg-surface">
            <label className="block font-ui text-xs text-muted px-4 pt-3">
              DECIMATION_%
            </label>
            <div className="px-4 pb-3 pt-1">
              <input
                type="range"
                min="1"
                max="100"
                value={decimation}
                onChange={(e) => onDecimationChange(Number(e.target.value))}
                className="w-full h-1 bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-active"
                disabled={isProcessing}
              />
              <div className="font-display text-xl text-reading mt-2">{decimation}%</div>
            </div>
          </div>
          
          <div className="flex-1 bg-surface">
            <label className="block font-ui text-xs text-muted px-4 pt-3">
              DRACO_LEVEL
            </label>
            <div className="px-4 pb-3 pt-1">
              <input
                type="range"
                min="1"
                max="10"
                value={dracoLevel}
                onChange={(e) => onDracoChange(Number(e.target.value))}
                className="w-full h-1 bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-active"
                disabled={isProcessing}
              />
              <div className="font-display text-xl text-reading mt-2">{dracoLevel}</div>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={onCompress}
        disabled={!hasFile || isProcessing}
        className={`
          w-full font-ui text-xl py-4 border-3 border-t-0 border-muted
          ${hasFile && !isProcessing 
            ? 'bg-surface text-reading hover:bg-active hover:text-surface hover:border-active' 
            : 'bg-surface/50 text-muted cursor-not-allowed'
          }
        `}
        style={{ transition: 'none' }}
      >
        {isProcessing ? 'PROCESSING...' : 'COMPRESS'}
      </button>
    </div>
  );
};

export default Controls;

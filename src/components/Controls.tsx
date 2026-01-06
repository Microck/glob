import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

  return (
    <div className="w-full flex flex-col gap-0">
      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border-3 border-t-0 border-muted bg-surface font-ui text-sm text-muted hover:text-active hover:border-active"
        style={{ transition: 'none' }}
      >
        <span>ADVANCED_SETTINGS</span>
        <ChevronDown 
          className={`w-4 h-4 transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
          style={{ transition: 'none' }}
        />
      </button>

      {/* Advanced Settings Panel */}
      {isAdvancedOpen && (
        <div className="flex border-3 border-t-0 border-muted">
          {/* Decimation */}
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
          
          {/* Draco Level */}
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
      
      {/* Compress Button */}
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

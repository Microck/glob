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
  return (
    <div className="w-full max-w-xl flex flex-col gap-0">
      {/* Control Inputs Row */}
      <div className="flex border-3 border-muted">
        {/* Decimation */}
        <div className="flex-1 border-r-3 border-muted">
          <label className="block font-ui text-xs text-muted px-4 pt-3">
            DECIMATION
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={decimation}
            onChange={(e) => onDecimationChange(Number(e.target.value))}
            className="w-full bg-transparent font-ui text-2xl text-reading px-4 pb-3 pt-1 focus:outline-none focus:text-active"
            disabled={isProcessing}
          />
        </div>
        
        {/* Draco Level */}
        <div className="flex-1">
          <label className="block font-ui text-xs text-muted px-4 pt-3">
            DRACO LEVEL
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={dracoLevel}
            onChange={(e) => onDracoChange(Number(e.target.value))}
            className="w-full bg-transparent font-ui text-2xl text-reading px-4 pb-3 pt-1 focus:outline-none focus:text-active"
            disabled={isProcessing}
          />
        </div>
      </div>
      
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

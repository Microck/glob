interface DownloadPanelProps {
  originalSize: number;
  compressedSize: number;
  onDownload: () => void;
  onReset: () => void;
}

const DownloadPanel = ({ originalSize, compressedSize, onDownload, onReset }: DownloadPanelProps) => {
  const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

  return (
    <div className="w-full max-w-xl">
      {/* Stats */}
      <div className="border-3 border-muted bg-surface">
        <div className="flex border-b-3 border-muted">
          <div className="flex-1 p-4 border-r-3 border-muted">
            <div className="font-ui text-xs text-muted mb-1">ORIGINAL</div>
            <div className="font-display text-2xl text-reading">
              {(originalSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="font-ui text-xs text-muted mb-1">COMPRESSED</div>
            <div className="font-display text-2xl text-active">
              {(compressedSize / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="font-ui text-xs text-muted mb-1">REDUCTION</div>
          <div className="font-display text-4xl text-active tracking-brutal">
            -{reduction}%
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex">
        <button
          onClick={onDownload}
          className="flex-1 bg-active text-surface font-ui text-xl py-5 hover:bg-reading"
          style={{ transition: 'none' }}
        >
          DOWNLOAD
        </button>
        <button
          onClick={onReset}
          className="border-3 border-l-0 border-muted bg-surface text-muted font-ui text-xl px-6 py-5 hover:text-active hover:border-active"
          style={{ transition: 'none' }}
        >
          RESET
        </button>
      </div>
    </div>
  );
};

export default DownloadPanel;

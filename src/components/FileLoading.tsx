import { Spinner } from '@/components/ui/spinner';

interface FileLoadingProps {
  fileName: string;
  progress?: number;
}

const FileLoading = ({ fileName, progress }: FileLoadingProps) => {
  return (
    <div className="w-full max-w-4xl border-3 border-muted bg-surface p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6 animate-bouncing-glob">
          <img src="/loading.svg" alt="Loading glob" className="w-24 h-24" />
        </div>
        <h3 className="font-ui text-reading text-lg mb-2">LOADING FILE</h3>
        <p className="font-ui text-muted text-sm mb-4">{fileName}</p>
        {progress !== undefined && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-active h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileLoading;
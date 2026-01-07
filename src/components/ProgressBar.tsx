import { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress: number;
  message: string;
}

const ProgressBar = ({ progress, message }: ProgressBarProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  const totalChars = 40;
  const filledCount = Math.floor((displayProgress / 100) * totalChars);
  const emptyCount = totalChars - filledCount;
  
  const bar = '[' + '|'.repeat(filledCount) + '.'.repeat(emptyCount) + ']';

  return (
    <div className="w-full border-3 border-muted bg-surface p-6">
      {message === 'COMPLETE' && progress === 100 ? (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <img 
              src="/finished.svg" 
              alt="Finished glob" 
              className="w-20 h-20 relative top-[-10px]" 
            />
          </div>
          <div className="font-ui text-sm md:text-base text-active mb-4 whitespace-nowrap overflow-hidden">
            {bar} {displayProgress}%
          </div>
          <div className="font-ui text-sm text-muted">
            {message}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center text-center mb-4">
            <div className="mb-4">
              <img 
                src="/loading.svg" 
                alt="Loading glob" 
                className="w-20 h-20 relative top-[10px]" 
                style={{ filter: 'hue-rotate(330deg) saturate(150%)' }}
              />
            </div>
            <div className="font-ui text-sm md:text-base text-active mb-4 whitespace-nowrap overflow-hidden">
              {bar} {displayProgress}%
            </div>
          </div>
          <div className="font-ui text-sm text-muted text-center">
            {message}
          </div>
        </>
      )}
    </div>
  );
};

export default ProgressBar;

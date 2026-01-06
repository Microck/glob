import { useState, useEffect } from 'react';

interface ProgressBarProps {
  progress: number;
  message: string;
}

const ProgressBar = ({ progress, message }: ProgressBarProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  const filledCount = Math.floor((displayProgress / 100) * 20);
  const emptyCount = 20 - filledCount;
  
  const bar = '[' + '|'.repeat(filledCount) + '.'.repeat(emptyCount) + ']';

  return (
    <div className="w-full max-w-xl border-3 border-muted bg-surface p-6">
      <div className="font-ui text-lg text-active mb-4">
        {bar} {displayProgress}%
      </div>
      <div className="font-ui text-sm text-muted">
        {message}
      </div>
    </div>
  );
};

export default ProgressBar;

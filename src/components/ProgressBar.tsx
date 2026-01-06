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
      <div className="font-ui text-sm md:text-base text-active mb-4 whitespace-nowrap overflow-hidden">
        {bar} {displayProgress}%
      </div>
      <div className="font-ui text-sm text-muted">
        {message}
      </div>
    </div>
  );
};

export default ProgressBar;
